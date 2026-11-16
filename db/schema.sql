-- ==============================================================================
-- KDP GreenSource Enterprise Inventory Management System
-- PostgreSQL Database Schema (Updated Aligned Schema)
-- Merged Sites & Warehouses, Dynamic Calculations, Dual-Order Support
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS "Platform_Table_Audit_Logs" CASCADE;
DROP TABLE IF EXISTS "Application_Table_Notifications" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Order_Status_History" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Shipment_Details" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Optimization_Table" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Orders" CASCADE;
DROP TABLE IF EXISTS "Fact_Table_Inventory" CASCADE;
DROP TABLE IF EXISTS "Application_Table_Shipping_Cost" CASCADE;
DROP TABLE IF EXISTS "Application_Table_Green_Material_Alternate" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_Green_Materials" CASCADE;
DROP TABLE IF EXISTS "Platform_Table_User_Info" CASCADE;
DROP TABLE IF EXISTS "Dimension_Table_Site" CASCADE;

-- ------------------------------------------------------------------------------
-- 1. Dimension_Table_Site (Merged Sites & Warehouses)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_Site" (
  "Site_ID" VARCHAR(32) PRIMARY KEY,
  "Site_Name" VARCHAR(128) NOT NULL,
  "Facility_Type" VARCHAR(64) NOT NULL CHECK ("Facility_Type" IN ('Local Roasting Plant', 'Central Warehouse')),
  "Location" VARCHAR(128) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. Platform_Table_User_Info (User Authentication & Profiles)
-- ------------------------------------------------------------------------------
CREATE TABLE "Platform_Table_User_Info" (
  "User_ID" VARCHAR(64) PRIMARY KEY,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Email" VARCHAR(128) NOT NULL UNIQUE,
  "Password_Hash" VARCHAR(255) NOT NULL,
  "Name" VARCHAR(128) NOT NULL,
  "Role" VARCHAR(64) NOT NULL CHECK ("Role" IN ('Local Buyer', 'Warehouse Manager', 'Central Planner', 'Admin')),
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Last_Login" TIMESTAMPTZ
);

-- ------------------------------------------------------------------------------
-- 3. Dimension_Table_Green_Materials (Catalog & Baseline Cost)
-- (Thresholds are maintained in Fact_Table_Inventory per site)
-- ------------------------------------------------------------------------------
CREATE TABLE "Dimension_Table_Green_Materials" (
  "Green_Material_ID" VARCHAR(32) PRIMARY KEY,
  "Green_Material_Description" VARCHAR(255) NOT NULL,
  "Price" NUMERIC(10, 2) NOT NULL CHECK ("Price" >= 0)
);

-- ------------------------------------------------------------------------------
-- 4. Application_Table_Green_Material_Alternate (Approved Sourcing Alternates)
-- ------------------------------------------------------------------------------
CREATE TABLE "Application_Table_Green_Material_Alternate" (
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE CASCADE,
  "Alternate_Green_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE CASCADE,
  PRIMARY KEY ("Green_Material_ID", "Alternate_Green_ID")
);

-- ------------------------------------------------------------------------------
-- 5. Application_Table_Shipping_Cost (Whiteboard Fixed Freight Matrix)
-- ------------------------------------------------------------------------------
CREATE TABLE "Application_Table_Shipping_Cost" (
  "Warehouse_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Cost" NUMERIC(10, 2) NOT NULL CHECK ("Cost" >= 0),
  PRIMARY KEY ("Warehouse_ID", "Site_ID")
);

-- ------------------------------------------------------------------------------
-- 6. Fact_Table_Inventory (Local Facility Stock & Minimum Safety Thresholds)
-- (Quantity_Incoming and Safety_Status are dynamically computed by the system)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Inventory" (
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE CASCADE,
  "Quantity_Available" NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK ("Quantity_Available" >= 0),
  "Minimum_Threshold" NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK ("Minimum_Threshold" >= 0),
  "Unit_of_Measurement" VARCHAR(16) NOT NULL DEFAULT 'kg',
  "Updated_Date" DATE NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY ("Site_ID", "Green_Material_ID")
);

-- ------------------------------------------------------------------------------
-- 7. Fact_Table_Orders (Production Demands & Threshold Replenishment Orders)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Orders" (
  "Order_Number" VARCHAR(64) PRIMARY KEY,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Order_Type" VARCHAR(32) NOT NULL DEFAULT 'PRODUCTION' CHECK ("Order_Type" IN ('PRODUCTION', 'REPLENISHMENT')),
  "FG_Material_ID" VARCHAR(64) NULL,            -- NULL for safety replenishment orders
  "FG_Material_Description" VARCHAR(255) NULL,  -- NULL for safety replenishment orders
  "Brand" VARCHAR(128) NULL,                    -- NULL for safety replenishment orders
  "Brand_Type" VARCHAR(64) NULL,                -- NULL for safety replenishment orders
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Order_Quantity" NUMERIC(12, 2) NOT NULL CHECK ("Order_Quantity" > 0),
  "Unit_of_Measurement" VARCHAR(16) NOT NULL DEFAULT 'kg',
  "Final_Green_ID" VARCHAR(32) REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Selected_Option_ID" INT NULL,
  "Schedule_Start_Date" DATE NOT NULL,
  "Delivery_Target_Date" DATE NULL,
  "Status" VARCHAR(64) NOT NULL DEFAULT 'new' CHECK ("Status" IN (
    'new', 'approved', 'requested', 'accepted', 'dispatched', 'in transit', 'delivered', 'received', 'closed', 'rejected'
  )),
  "Rejection_Reason" TEXT NULL,
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Updated_Date" DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ------------------------------------------------------------------------------
-- 8. Fact_Table_Optimization_Table (Evaluated Sourcing Options & Cost Scenarios)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Optimization_Table" (
  "Option_ID" INT NOT NULL,
  "Order_Number" VARCHAR(64) NOT NULL REFERENCES "Fact_Table_Orders"("Order_Number") ON DELETE CASCADE,
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "Source_Type" VARCHAR(64) NOT NULL, -- 'Local Inventory' | 'Local Alternate' | 'Warehouse Fulfillment'
  "Source_Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE RESTRICT,
  "Selected_Green_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
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
  "Shipment_ID" VARCHAR(64) PRIMARY KEY,
  "Order_Number" VARCHAR(64) NULL REFERENCES "Fact_Table_Orders"("Order_Number") ON DELETE SET NULL,
  "Replenishment_ID" VARCHAR(64) NULL,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "From_Warehouse_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE RESTRICT,
  "Green_Material_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Green_Materials"("Green_Material_ID") ON DELETE RESTRICT,
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
-- 10. Fact_Table_Order_Status_History (Lifecycle Audit & Historical Stepper)
-- ------------------------------------------------------------------------------
CREATE TABLE "Fact_Table_Order_Status_History" (
  "History_ID" BIGSERIAL PRIMARY KEY,
  "Order_Number" VARCHAR(64) NOT NULL REFERENCES "Fact_Table_Orders"("Order_Number") ON DELETE CASCADE,
  "Order_Type" VARCHAR(32) NOT NULL DEFAULT 'PRODUCTION' CHECK ("Order_Type" IN ('PRODUCTION', 'REPLENISHMENT')),
  "Replenishment_ID" VARCHAR(64) NULL,
  "From_Status" VARCHAR(64) NULL,
  "To_Status" VARCHAR(64) NOT NULL,
  "Changed_By_User_ID" VARCHAR(64) REFERENCES "Platform_Table_User_Info"("User_ID") ON DELETE SET NULL,
  "Actor_Role" VARCHAR(64) NOT NULL,
  "Notes" TEXT NULL,
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 11. Application_Table_Notifications (Alerts & Action Triggers)
-- ------------------------------------------------------------------------------
CREATE TABLE "Application_Table_Notifications" (
  "Notification_ID" BIGSERIAL PRIMARY KEY,
  "Site_ID" VARCHAR(32) NOT NULL REFERENCES "Dimension_Table_Site"("Site_ID") ON DELETE CASCADE,
  "User_ID" VARCHAR(64) NULL REFERENCES "Platform_Table_User_Info"("User_ID") ON DELETE SET NULL,
  "Severity" VARCHAR(32) NOT NULL CHECK ("Severity" IN ('critical', 'warning', 'info')),
  "Type" VARCHAR(64) NOT NULL, -- 'below_threshold', 'no_feasible', 'transfer_delay', 'order_status_update'
  "Title" VARCHAR(128) NOT NULL,
  "Message" TEXT NOT NULL,
  "Action_Label" VARCHAR(64) NULL,
  "Action_URL" VARCHAR(255) NULL,
  "Is_Read" BOOLEAN NOT NULL DEFAULT false,
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 12. Platform_Table_Audit_Logs (System Compliance & Operations Log)
-- ------------------------------------------------------------------------------
CREATE TABLE "Platform_Table_Audit_Logs" (
  "Log_ID" BIGSERIAL PRIMARY KEY,
  "User_ID" VARCHAR(64) NULL REFERENCES "Platform_Table_User_Info"("User_ID") ON DELETE SET NULL,
  "Action_Type" VARCHAR(64) NOT NULL,
  "Target_Entity" VARCHAR(64) NOT NULL,
  "Target_ID" VARCHAR(64) NOT NULL,
  "Details" JSONB NULL,
  "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 13. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX idx_inventory_site ON "Fact_Table_Inventory"("Site_ID");
CREATE INDEX idx_orders_site_status ON "Fact_Table_Orders"("Site_ID", "Status");
CREATE INDEX idx_orders_type ON "Fact_Table_Orders"("Order_Type");
CREATE INDEX idx_shipments_order ON "Fact_Table_Shipment_Details"("Order_Number");
CREATE INDEX idx_shipments_replenish ON "Fact_Table_Shipment_Details"("Replenishment_ID");
CREATE INDEX idx_shipments_status ON "Fact_Table_Shipment_Details"("Shipment_Status");
CREATE INDEX idx_order_history_order ON "Fact_Table_Order_Status_History"("Order_Number");
CREATE INDEX idx_notifications_site_read ON "Application_Table_Notifications"("Site_ID", "Is_Read");
CREATE INDEX idx_audit_logs_user ON "Platform_Table_Audit_Logs"("User_ID", "Created_At");
