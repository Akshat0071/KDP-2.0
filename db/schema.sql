-- ==============================================================================
-- KDP GreenSource Enterprise Relational Database Schema (PostgreSQL)
-- Categorized strictly into Dimension Tables and Fact Tables
-- All Primary Keys, Foreign Keys, and Order Numbers typed as INTEGER
-- ==============================================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS "Fact_Table_Audit_Logs" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Notifications" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Shipment_Details" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Optimization_Table" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Orders" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Inventory" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_Shipping_Cost" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_Green_Material_Alternate" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_Green_Materials" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_User_Info" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_Site" CASCADE;

-- ==============================================================================
-- PART 1: DIMENSION TABLES (Contextual Master / Reference Data)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Dimension_Table_Site (Facilities: Roasting Plants & Central Warehouses)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_Site" (
  "Site_ID" INT PRIMARY KEY,
  "Site_Name" VARCHAR(128) NOT NULL,
  "Facility_Type" VARCHAR(64) NOT NULL CHECK ("Facility_Type" IN ('Local Roasting Plant', 'Central Warehouse')),
  "Location" VARCHAR(128) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. Dimension_Table_User_Info (User Authentication & Profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_User_Info" (
  "User_ID" INT PRIMARY KEY,
  "Site_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Email" VARCHAR(128) NOT NULL UNIQUE,
  "Password_Hash" VARCHAR(255) NOT NULL,
  "Name" VARCHAR(128) NOT NULL,
  "Role" VARCHAR(64) NOT NULL CHECK ("Role" IN ('Local Buyer', 'Warehouse Manager', 'Central Planner', 'Admin')),
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Last_Login" TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 3. Dimension_Table_Green_Materials (Master Green Coffee Catalog)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_Green_Materials" (
  "Green_Material_ID" INT PRIMARY KEY,
  "Green_Material_Description" VARCHAR(255) NOT NULL,
  "Price" NUMERIC(10, 2) NOT NULL CHECK ("Price" >= 0)
);

-- ------------------------------------------------------------------------------
-- 4. Dimension_Table_Green_Material_Alternate (Approved Sourcing Alternates)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_Green_Material_Alternate" (
  "Green_Material_ID" INT NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE CASCADE,
  "Alternate_Green_ID" INT NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE CASCADE,
  PRIMARY KEY ("Green_Material_ID", "Alternate_Green_ID")
);

-- ------------------------------------------------------------------------------
-- 5. Dimension_Table_Shipping_Cost (Freight Lookup Rate Matrix)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_Shipping_Cost" (
  "Warehouse_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Site_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Cost" NUMERIC(10, 2) NOT NULL CHECK ("Cost" >= 0),
  PRIMARY KEY ("Warehouse_ID", "Site_ID")
);

-- ==============================================================================
-- PART 2: FACT TABLES (Transactions, Inventory Snapshots & Operational Events)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 6. Fact_Table_Inventory (Periodic Stock Level & Safety Threshold Snapshot)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Inventory" (
  "Site_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Green_Material_ID" INT NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE CASCADE,
  "Quantity_Available" NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK ("Quantity_Available" >= 0),
  "Minimum_Threshold" NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK ("Minimum_Threshold" >= 0),
  "Unit_of_Measurement" VARCHAR(16) NOT NULL DEFAULT 'kg',
  "Updated_Date" DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY ("Site_ID", "Green_Material_ID")
);

-- ------------------------------------------------------------------------------
-- 7. Fact_Table_Orders (Production Demands & Threshold Replenishment Orders)
-- Combines Active Orders, Order History, and Complete Audit Trail (Timeline_History)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Orders" (
  "Order_Number" INT PRIMARY KEY,
  "Site_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Order_Type" VARCHAR(32) NOT NULL DEFAULT 'PRODUCTION' CHECK ("Order_Type" IN ('PRODUCTION', 'REPLENISHMENT')),
  "FG_Material_ID" INT NULL,
  "FG_Material_Description" VARCHAR(255) NULL,
  "Brand" VARCHAR(128) NULL,
  "Brand_Type" VARCHAR(64) NULL,
  "Green_Material_ID" INT NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Order_Quantity" NUMERIC(12, 2) NOT NULL CHECK ("Order_Quantity" > 0),
  "Unit_of_Measurement" VARCHAR(16) NOT NULL DEFAULT 'kg',
  "Final_Green_ID" INT REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Selected_Option_ID" INT NULL,
  "Schedule_Start_Date" DATE NOT NULL,
  "Delivery_Target_Date" DATE NULL,
  "Status" VARCHAR(64) NOT NULL DEFAULT 'new' CHECK ("Status" IN (
    'new', 'approved', 'requested', 'accepted', 'dispatched', 'in transit', 'delivered', 'received', 'closed', 'rejected'
  )),
  "Rejection_Reason" TEXT NULL,
  "Is_Closed" BOOLEAN NOT NULL DEFAULT false,
  "Timeline_History" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Updated_Date" DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ------------------------------------------------------------------------------
-- 8. Fact_Table_Optimization_Table (Evaluated Sourcing Options & Cost Scenarios)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Optimization_Table" (
  "Option_ID" INT NOT NULL,
  "Order_Number" INT NOT NULL REFERENCES "Fact_Table_Orders"("Order_Number") ON DELETE CASCADE,
  "Green_Material_ID" INT NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Site_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Source_Type" VARCHAR(64) NOT NULL,
  "Source_Site_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE RESTRICT,
  "Selected_Green_ID" INT NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Selected_Green_Price" NUMERIC(10, 2) NOT NULL,
  "Selected_Green_Quantity" NUMERIC(12, 2) NOT NULL,
  "Shipping_Cost" NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  "Total_Cost" NUMERIC(12, 2) NOT NULL,
  "Procurement_Required" BOOLEAN NOT NULL DEFAULT false,
  "Is_Feasible" BOOLEAN NOT NULL DEFAULT true,
  "Is_Recommended" BOOLEAN NOT NULL DEFAULT false,
  "Is_Selected" BOOLEAN NOT NULL DEFAULT false,
  "Exclusion_Reason" TEXT NULL,
  PRIMARY KEY ("Order_Number", "Option_ID")
);

-- ------------------------------------------------------------------------------
-- 9. Fact_Table_Shipment_Details (Inbound Logistics & Transfer Shipments)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Shipment_Details" (
  "Shipment_ID" INT PRIMARY KEY,
  "Order_Number" INT NULL REFERENCES "Fact_Table_Orders"("Order_Number") ON DELETE SET NULL,
  "Replenishment_ID" INT NULL,
  "Site_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "From_Warehouse_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE RESTRICT,
  "Green_Material_ID" INT NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Shipment_Quantity" NUMERIC(12, 2) NOT NULL CHECK ("Shipment_Quantity" > 0),
  "Unit_of_Measurement" VARCHAR(16) NOT NULL DEFAULT 'kg',
  "Shipped_Date" DATE NULL,
  "Estimated_Arrival_Date" DATE NOT NULL,
  "Delivery_Date" DATE NULL,
  "Shipping_Cost" NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  "Shipment_Status" VARCHAR(64) NOT NULL DEFAULT 'Scheduled' CHECK ("Shipment_Status" IN (
    'Scheduled', 'Dispatched', 'In Transit', 'Delayed', 'Delivered', 'Received', 'Closed'
  )),
  "Is_Delayed" BOOLEAN NOT NULL DEFAULT false,
  "Updated_Date" DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ------------------------------------------------------------------------------
-- 10. Fact_Table_Notifications (System Alert Events & Threshold Triggers)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Notifications" (
  "Notification_ID" INT PRIMARY KEY,
  "Site_ID" INT NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "User_ID" INT NULL REFERENCES "Dimension_Table_User_Info"("User_ID") ON DELETE SET NULL,
  "Severity" VARCHAR(32) NOT NULL CHECK ("Severity" IN ('critical', 'warning', 'info')),
  "Type" VARCHAR(64) NOT NULL,
  "Title" VARCHAR(128) NOT NULL,
  "Message" TEXT NOT NULL,
  "Action_Label" VARCHAR(64) NULL,
  "Action_URL" VARCHAR(255) NULL,
  "Is_Read" BOOLEAN NOT NULL DEFAULT false,
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 11. Fact_Table_Audit_Logs (System Compliance & Operations Event Log)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Audit_Logs" (
  "Log_ID" INT PRIMARY KEY,
  "User_ID" INT NULL REFERENCES "Dimension_Table_User_Info"("User_ID") ON DELETE SET NULL,
  "Action_Type" VARCHAR(64) NOT NULL,
  "Target_Entity" VARCHAR(64) NOT NULL,
  "Target_ID" INT NOT NULL,
  "Details" JSONB NULL,
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 12. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX idx_inventory_site ON "Fact_Table_Inventory"("Site_ID");
CREATE INDEX idx_orders_site_status ON "Fact_Table_Orders"("Site_ID", "Status");
CREATE INDEX idx_orders_type ON "Fact_Table_Orders"("Order_Type");
CREATE INDEX idx_orders_is_closed ON "Fact_Table_Orders"("Is_Closed");
CREATE INDEX idx_orders_timeline ON "Fact_Table_Orders" USING GIN ("Timeline_History");
CREATE INDEX idx_shipments_order ON "Fact_Table_Shipment_Details"("Order_Number");
CREATE INDEX idx_shipments_replenish ON "Fact_Table_Shipment_Details"("Replenishment_ID");
CREATE INDEX idx_shipments_status ON "Fact_Table_Shipment_Details"("Shipment_Status");
CREATE INDEX idx_notifications_site_read ON "Fact_Table_Notifications"("Site_ID", "Is_Read");
CREATE INDEX idx_audit_logs_user ON "Fact_Table_Audit_Logs"("User_ID", "Created_At");
