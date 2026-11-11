-- ==============================================================================
-- KDP GreenSource Enterprise Inventory Management System
-- PostgreSQL Database Schema (Strictly Aligned with KDP Dataset ER Diagram)
-- 7 Local Sites, 3 Central Warehouses, Zero Lots, Cost Optimization Priority
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in dependency order
DROP TABLE IF EXISTS "Fact_Table_Optimization_Table" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Shipment_Details" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Orders" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Inventory" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_Green_Materials" CASCADE;
DROP TABLE IF EXISTS "Application_Table_Shipping_Cost" CASCADE;
DROP TABLE IF EXISTS "Platform_Table_User_Info" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_Site" CASCADE;

-- ------------------------------------------------------------------------------
-- 1. Dimension_Table_Site (7 Local Sites & 3 Central Warehouses)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_Site" (
  "Site_ID" VARCHAR(32) PRIMARY KEY,
  "Site_Name" VARCHAR(128) NOT NULL,
  "Category" VARCHAR(64) NOT NULL -- 'Local Roasting Plant' | 'Central Warehouse'
);

-- ------------------------------------------------------------------------------
-- 2. Platform_Table_User_Info (User Auth & Roles)
-- ------------------------------------------------------------------------------
CREATE TABLE "Platform_Table_User_Info" (
  "User_ID" VARCHAR(64) PRIMARY KEY,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Email" VARCHAR(128) NOT NULL UNIQUE,
  "Password" VARCHAR(255) NOT NULL, -- bcrypt/blowfish hash
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Updated_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. Application_Table_Shipping_Cost (Whiteboard Fixed Freight Matrix)
-- ------------------------------------------------------------------------------
CREATE TABLE "Application_Table_Shipping_Cost" (
  "Warehouse_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Cost" NUMERIC(10, 2) NOT NULL CHECK ("Cost" >= 0),
  PRIMARY KEY ("Warehouse_ID", "Site_ID")
);

-- ------------------------------------------------------------------------------
-- 4. Dimension_Table_Green_Materials (Single Alternate Self-Reference per Row)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_Green_Materials" (
  "Green_Material_ID" VARCHAR(32) PRIMARY KEY,
  "Green_Material_Description" VARCHAR(255) NOT NULL,
  "Alternate_Green_ID" VARCHAR(32) REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE SET NULL,
  "Price" NUMERIC(10, 2) NOT NULL CHECK ("Price" >= 0)
);

-- ------------------------------------------------------------------------------
-- 5. Fact_Table_Inventory (Local & Warehouse On-Hand Stock + User-Added Min_Threshold)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Inventory" (
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE CASCADE,
  "Quantity_Available" NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK ("Quantity_Available" >= 0),
  "Unit_of_Measurement" VARCHAR(16) NOT NULL DEFAULT 'kg',
  "Updated_Date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "Min_Threshold" NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK ("Min_Threshold" >= 0),
  PRIMARY KEY ("Site_ID", "Green_Material_ID")
);

-- ------------------------------------------------------------------------------
-- 6. Fact_Table_Orders (Production Roasting Orders & Demand)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Orders" (
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Order_Number" VARCHAR(64) NOT NULL,
  "FG_Material_ID" VARCHAR(64) NOT NULL,
  "FG_Material_Description" VARCHAR(255) NOT NULL,
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Brand" VARCHAR(128) NOT NULL,
  "Brand_Type" VARCHAR(64) NOT NULL,
  "Order_Quantity" NUMERIC(12, 2) NOT NULL CHECK ("Order_Quantity" > 0),
  "Unit_of_Measurement" VARCHAR(16) NOT NULL DEFAULT 'kg',
  "Final_green_ID" VARCHAR(32) REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Schedule_Start_date" DATE NOT NULL,
  "Status" VARCHAR(64) NOT NULL DEFAULT 'pending', -- 'needs-signoff' | 'at-risk' | 'auto-reserved' | 'reserved' | 'awaiting-approval' | 'no-option'
  "Updated_Date" DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY ("Order_Number", "Green_Material_ID")
);

-- ------------------------------------------------------------------------------
-- 7. Fact_Table_Shipment_Details (Inbound Logistics & Transfer Shipments)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Shipment_Details" (
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Shipment_ID" VARCHAR(64) PRIMARY KEY,
  "From_Warehouse_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE RESTRICT,
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Shipment_Quantity" NUMERIC(12, 2) NOT NULL CHECK ("Shipment_Quantity" > 0),
  "Unit_of_Measurement" VARCHAR(16) NOT NULL DEFAULT 'kg',
  "Delivery_Date" DATE NOT NULL,
  "Shipment_Status" VARCHAR(64) NOT NULL DEFAULT 'Scheduled', -- 'Scheduled' | 'In Transit' | 'Delayed' | 'Received'
  "Updated_Date" DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ------------------------------------------------------------------------------
-- 8. Fact_Table_Optimization_Table (Evaluated Sourcing Scenarios & Costs)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Optimization_Table" (
  "Option_ID" INT NOT NULL,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Order_Number" VARCHAR(64) NOT NULL,
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Selected_Green_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Selected_Green_Price" NUMERIC(10, 2) NOT NULL,
  "Source_Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE RESTRICT,
  "Selected_Green_Quantity" NUMERIC(12, 2) NOT NULL,
  "Shipping_Cost" NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  "Total_Cost" NUMERIC(12, 2) NOT NULL, -- (Selected_Green_Price * Selected_Green_Quantity) + Shipping_Cost
  "Procurement_Required" BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY ("Order_Number", "Green_Material_ID", "Option_ID")
);

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX idx_inventory_site ON "Fact_Table_Inventory"("Site_ID");
CREATE INDEX idx_inventory_green ON "Fact_Table_Inventory"("Green_Material_ID");
CREATE INDEX idx_orders_site ON "Fact_Table_Orders"("Site_ID");
CREATE INDEX idx_orders_status ON "Fact_Table_Orders"("Status");
CREATE INDEX idx_shipments_site ON "Fact_Table_Shipment_Details"("Site_ID");
CREATE INDEX idx_shipments_status ON "Fact_Table_Shipment_Details"("Shipment_Status");
CREATE INDEX idx_optimization_order ON "Fact_Table_Optimization_Table"("Order_Number", "Green_Material_ID");

-- ------------------------------------------------------------------------------
-- 10. HELPER ANALYTIC VIEWS
-- ------------------------------------------------------------------------------

-- View: Inventory items below minimum safety threshold
CREATE OR REPLACE VIEW v_inventory_threshold_alerts AS
SELECT 
  i."Site_ID",
  s."Site_Name",
  i."Green_Material_ID",
  g."Green_Material_Description",
  i."Quantity_Available",
  i."Min_Threshold",
  (i."Min_Threshold" - i."Quantity_Available") AS "Deficit_Quantity",
  g."Price",
  COALESCE(sc."Warehouse_ID", '1055') AS "Assigned_Warehouse_ID",
  COALESCE(sc."Cost", 589.00) AS "Fixed_Shipping_Cost",
  i."Updated_Date"
FROM "Fact_Table_Inventory" i
JOIN "Dimension_Table_Site" s ON s."Site_ID" = i."Site_ID"
JOIN "Dimension_Table_Green_Materials" g ON g."Green_Material_ID" = i."Green_Material_ID"
LEFT JOIN "Application_Table_Shipping_Cost" sc ON sc."Site_ID" = i."Site_ID"
WHERE i."Quantity_Available" < i."Min_Threshold";

-- View: Designated lowest-cost warehouse routing per site
CREATE OR REPLACE VIEW v_lowest_freight_routing AS
SELECT DISTINCT ON (sc."Site_ID")
  sc."Site_ID",
  s."Site_Name",
  sc."Warehouse_ID" AS "Assigned_Warehouse_ID",
  ws."Site_Name" AS "Warehouse_Name",
  sc."Cost" AS "Lowest_Shipping_Cost"
FROM "Application_Table_Shipping_Cost" sc
JOIN "Dimension_Table_Site" s ON s."Site_ID" = sc."Site_ID"
JOIN "Dimension_Table_Site" ws ON ws."Site_ID" = sc."Warehouse_ID"
ORDER BY sc."Site_ID", sc."Cost" ASC;
