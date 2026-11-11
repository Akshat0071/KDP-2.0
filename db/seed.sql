-- ==============================================================================
-- KDP GreenSource Enterprise Inventory Management System
-- Seed Data (Matches Whiteboard Lowest-Freight Routing & ER Diagram)
-- ==============================================================================

-- 1. Dimension_Table_Site (7 Local Roasting Plants & 3 Central Warehouses)
INSERT INTO "Dimension_Table_Site" ("Site_ID", "Site_Name", "Category") VALUES
  -- 3 Central Warehouses
  ('1020', 'Warehouse 1020', 'Central Warehouse'),
  ('1021', 'Warehouse 1021', 'Central Warehouse'),
  ('1055', 'Warehouse 1055', 'Central Warehouse'),
  -- 7 Local Roasting Plants
  ('1003', 'Site 1003 — Sumner Plant', 'Local Roasting Plant'),
  ('1004', 'Site 1004 — Castroville Plant', 'Local Roasting Plant'),
  ('1006', 'Site 1006 — Essex Plant', 'Local Roasting Plant'),
  ('1009', 'Site 1009 — Knoxville Plant', 'Local Roasting Plant'),
  ('1054', 'Site 1054 — Plano Roasting', 'Local Roasting Plant'),
  ('1102', 'Site 1102 — Windsor Facility', 'Local Roasting Plant'),
  ('1103', 'Site 1103 — Montreal Plant', 'Local Roasting Plant')
ON CONFLICT ("Site_ID") DO UPDATE SET
  "Site_Name" = EXCLUDED."Site_Name",
  "Category" = EXCLUDED."Category";

-- 2. Platform_Table_User_Info (Default Local Buyer & Central Manager)
INSERT INTO "Platform_Table_User_Info" ("User_ID", "Site_ID", "Email", "Password") VALUES
  (
    'USR-1054-01',
    '1054',
    'maya.torres@kdpgreensource.com',
    crypt('PlanoRoast2026!', gen_salt('bf'))
  ),
  (
    'USR-1055-01',
    '1055',
    'marcus.vance@kdpgreensource.com',
    crypt('CentralHub2026!', gen_salt('bf'))
  ),
  (
    'USR-1003-01',
    '1003',
    'sarah.chen@kdpgreensource.com',
    crypt('SumnerRoast2026!', gen_salt('bf'))
  )
ON CONFLICT ("Email") DO NOTHING;

-- 3. Application_Table_Shipping_Cost (Whiteboard Fixed Lowest Freight Mapping)
-- 1003 -> 1020 (Cost: 1000)
-- 1004 -> 1055 (Cost: 1000)
-- 1006 -> 1021 (Cost: 1000)
-- 1009 -> 1055 (Cost: 1000)
-- 1054 -> 1055 (Cost: 589)
-- 1102 -> 1055 (Cost: 3000)
-- 1103 -> 1055 (Cost: 3165)
INSERT INTO "Application_Table_Shipping_Cost" ("Warehouse_ID", "Site_ID", "Cost") VALUES
  ('1020', '1003', 1000.00),
  ('1055', '1004', 1000.00),
  ('1021', '1006', 1000.00),
  ('1055', '1009', 1000.00),
  ('1055', '1054', 589.00),
  ('1055', '1102', 3000.00),
  ('1055', '1103', 3165.00)
ON CONFLICT ("Warehouse_ID", "Site_ID") DO UPDATE SET
  "Cost" = EXCLUDED."Cost";

-- 4. Dimension_Table_Green_Materials (Single Alternate Self-Reference per Row)
-- Insert root materials first, then update alternates
INSERT INTO "Dimension_Table_Green_Materials" ("Green_Material_ID", "Green_Material_Description", "Alternate_Green_ID", "Price") VALUES
  ('Gc-04', 'Colombia Supremo Washed', NULL, 3.90),
  ('Gc-11', 'Brazil Cerrado Natural', NULL, 3.40),
  ('Gc-14', 'Guatemala Antigua SHB', NULL, 4.10),
  ('Gc-22', 'Huila Washed Regional', NULL, 4.40),
  ('Gc-19', 'Ethiopia Yirgacheffe Washed', NULL, 4.60),
  ('Gd-09', 'Ethiopia Yirgacheffe Natural', NULL, 4.85),
  ('Ga-17', 'Kenya AA Nyeri Grade 1', NULL, 5.20),
  ('Ge-31', 'Sumatra Mandheling Grade 1', NULL, 4.60),
  ('Gh-08', 'Costa Rica Tarrazu SHB Honey', NULL, 4.30)
ON CONFLICT ("Green_Material_ID") DO UPDATE SET
  "Green_Material_Description" = EXCLUDED."Green_Material_Description",
  "Price" = EXCLUDED."Price";

-- Set 1-to-1 alternate green relationships
UPDATE "Dimension_Table_Green_Materials" SET "Alternate_Green_ID" = 'Gc-14' WHERE "Green_Material_ID" = 'Gc-04';
UPDATE "Dimension_Table_Green_Materials" SET "Alternate_Green_ID" = 'Gc-14' WHERE "Green_Material_ID" = 'Gc-11';
UPDATE "Dimension_Table_Green_Materials" SET "Alternate_Green_ID" = 'Gc-22' WHERE "Green_Material_ID" = 'Gc-14';
UPDATE "Dimension_Table_Green_Materials" SET "Alternate_Green_ID" = 'Gc-19' WHERE "Green_Material_ID" = 'Gc-22';
UPDATE "Dimension_Table_Green_Materials" SET "Alternate_Green_ID" = 'Ga-17' WHERE "Green_Material_ID" = 'Gc-19';
UPDATE "Dimension_Table_Green_Materials" SET "Alternate_Green_ID" = 'Gc-11' WHERE "Green_Material_ID" = 'Gd-09';

-- 5. Fact_Table_Inventory (Local Site 1054 Plano & Central Warehouse 1055 Stocks)
INSERT INTO "Fact_Table_Inventory" ("Site_ID", "Green_Material_ID", "Quantity_Available", "Unit_of_Measurement", "Updated_Date", "Min_Threshold") VALUES
  -- Local Site 1054 (Plano Roasting) Stock
  ('1054', 'Gc-04', 800.00,  'kg', CURRENT_DATE, 1200.00),
  ('1054', 'Gc-11', 1600.00, 'kg', CURRENT_DATE, 1000.00),
  ('1054', 'Gc-14', 1300.00, 'kg', CURRENT_DATE, 1000.00),
  ('1054', 'Gc-22', 900.00,  'kg', CURRENT_DATE, 800.00),
  ('1054', 'Gc-19', 700.00,  'kg', CURRENT_DATE, 700.00),
  ('1054', 'Gd-09', 250.00,  'kg', CURRENT_DATE, 700.00),
  ('1054', 'Ga-17', 4200.00, 'kg', CURRENT_DATE, 2500.00),
  ('1054', 'Ge-31', 350.00,  'kg', CURRENT_DATE, 1200.00),
  ('1054', 'Gh-08', 1600.00, 'kg', CURRENT_DATE, 1200.00),

  -- Central Warehouse 1055 Available Stock
  ('1055', 'Gc-04', 5200.00, 'kg', CURRENT_DATE, 0.00),
  ('1055', 'Gc-11', 8000.00, 'kg', CURRENT_DATE, 0.00),
  ('1055', 'Gc-14', 4500.00, 'kg', CURRENT_DATE, 0.00),
  ('1055', 'Gc-22', 3100.00, 'kg', CURRENT_DATE, 0.00),
  ('1055', 'Gc-19', 2400.00, 'kg', CURRENT_DATE, 0.00),
  ('1055', 'Gd-09', 1800.00, 'kg', CURRENT_DATE, 0.00),
  ('1055', 'Ga-17', 3100.00, 'kg', CURRENT_DATE, 0.00),
  ('1055', 'Ge-31', 3500.00, 'kg', CURRENT_DATE, 0.00),
  ('1055', 'Gh-08', 2200.00, 'kg', CURRENT_DATE, 0.00)
ON CONFLICT ("Site_ID", "Green_Material_ID") DO UPDATE SET
  "Quantity_Available" = EXCLUDED."Quantity_Available",
  "Min_Threshold" = EXCLUDED."Min_Threshold",
  "Updated_Date" = EXCLUDED."Updated_Date";

-- 6. Fact_Table_Orders (Active Production Batch Orders)
INSERT INTO "Fact_Table_Orders" (
  "Site_ID", "Order_Number", "FG_Material_ID", "FG_Material_Description",
  "Green_Material_ID", "Brand", "Brand_Type", "Order_Quantity",
  "Unit_of_Measurement", "Final_green_ID", "Schedule_Start_date", "Status", "Updated_Date"
) VALUES
  ('1054', 'PO-2843', 'FG-4401', 'Dark Magic Blend Whole Bean 12oz', 'Gc-04', 'Green Mountain Coffee Roasters', 'Signature Blend', 1200.00, 'kg', 'Gc-04', '2026-11-10', 'at-risk', CURRENT_DATE),
  ('1054', 'PO-2842', 'FG-3108', 'Barista Reserve Medium Roast K-Cup', 'Gc-11', 'The Original Donut Shop', 'Signature Roast', 800.00, 'kg', 'Gc-14', '2026-11-09', 'needs-signoff', CURRENT_DATE),
  ('1054', 'PO-2844', 'FG-2204', 'Antigua Single Origin Whole Bean 12oz', 'Gc-14', 'Green Mountain Coffee Roasters', 'Single Origin', 600.00, 'kg', 'Gc-14', '2026-11-07', 'awaiting-approval', CURRENT_DATE),
  ('1054', 'PO-2847', 'FG-6120', 'Tarrazu Estate Reserve Whole Bean', 'Gh-08', 'Green Mountain Coffee Roasters', 'Limited Edition', 1000.00, 'kg', 'Gh-08', '2026-11-13', 'at-risk', CURRENT_DATE),
  ('1054', 'PO-2848', 'FG-1802', 'Dukale''s Blend Single Serve Pods 24ct', 'Gd-09', 'Laughing Man Coffee', 'Signature Blend', 900.00, 'kg', 'Gc-11', '2026-11-14', 'needs-signoff', CURRENT_DATE),
  ('1054', 'PO-2841', 'FG-1801', 'Dukale''s Blend Whole Bean 12oz', 'Gd-09', 'Laughing Man Coffee', 'Signature Blend', 1200.00, 'kg', 'Gd-09', '2026-11-08', 'auto-reserved', CURRENT_DATE),
  ('1054', 'PO-2845', 'FG-9201', 'Kenya AA Estate Roast Whole Bean', 'Ga-17', 'Green Mountain Coffee Roasters', 'Estate Select', 800.00, 'kg', 'Ga-17', '2026-11-11', 'reserved', CURRENT_DATE),
  ('1054', 'PO-2846', 'FG-5510', 'Sumatra Reserve Single Origin Whole Bean 12oz', 'Ge-31', 'Green Mountain Coffee Roasters', 'Single Origin', 1500.00, 'kg', 'Ge-31', '2026-11-12', 'no-option', CURRENT_DATE)
ON CONFLICT ("Order_Number", "Green_Material_ID") DO UPDATE SET
  "Order_Quantity" = EXCLUDED."Order_Quantity",
  "Status" = EXCLUDED."Status",
  "Schedule_Start_date" = EXCLUDED."Schedule_Start_date";

-- 7. Fact_Table_Optimization_Table (Evaluated Sourcing Options & Costs)
INSERT INTO "Fact_Table_Optimization_Table" (
  "Option_ID", "Site_ID", "Order_Number", "Green_Material_ID",
  "Selected_Green_ID", "Selected_Green_Price", "Source_Site_ID",
  "Selected_Green_Quantity", "Shipping_Cost", "Total_Cost", "Procurement_Required"
) VALUES
  -- PO-2843 (Colombia Supremo 1200kg)
  (1, '1054', 'PO-2843', 'Gc-04', 'Gc-04', 3.90, '1055', 1200.00, 589.00, 5269.00, true),
  (2, '1054', 'PO-2843', 'Gc-04', 'Gc-04', 3.90, '1054', 800.00, 0.00, 3120.00, false),

  -- PO-2842 (Brazil Cerrado 800kg)
  (1, '1054', 'PO-2842', 'Gc-11', 'Gc-14', 4.10, '1054', 800.00, 0.00, 3280.00, false),
  (2, '1054', 'PO-2842', 'Gc-11', 'Gc-11', 3.40, '1055', 800.00, 589.00, 3309.00, true),

  -- PO-2844 (Guatemala Antigua 600kg)
  (1, '1054', 'PO-2844', 'Gc-14', 'Gc-14', 4.10, '1055', 600.00, 589.00, 3049.00, true),

  -- PO-2847 (Costa Rica Tarrazu 1000kg)
  (1, '1054', 'PO-2847', 'Gh-08', 'Gh-08', 4.30, '1055', 1000.00, 589.00, 4889.00, true),

  -- PO-2848 (Ethiopia Yirgacheffe 900kg)
  (1, '1054', 'PO-2848', 'Gd-09', 'Gc-11', 3.40, '1054', 900.00, 0.00, 3060.00, false),

  -- PO-2841 (Ethiopia Yirgacheffe 1200kg)
  (1, '1054', 'PO-2841', 'Gd-09', 'Gd-09', 4.85, '1054', 1200.00, 0.00, 5820.00, false),

  -- PO-2845 (Kenya AA 800kg)
  (1, '1054', 'PO-2845', 'Ga-17', 'Ga-17', 5.20, '1054', 800.00, 0.00, 4160.00, false)
ON CONFLICT ("Order_Number", "Green_Material_ID", "Option_ID") DO UPDATE SET
  "Total_Cost" = EXCLUDED."Total_Cost",
  "Shipping_Cost" = EXCLUDED."Shipping_Cost";

-- 8. Fact_Table_Shipment_Details (Inbound Logistics Shipments)
INSERT INTO "Fact_Table_Shipment_Details" (
  "Site_ID", "Shipment_ID", "From_Warehouse_ID", "Green_Material_ID",
  "Shipment_Quantity", "Unit_of_Measurement", "Delivery_Date", "Shipment_Status", "Updated_Date"
) VALUES
  ('1054', 'SH-7810', '1055', 'Gc-11', 800.00, 'kg', '2026-11-08', 'In Transit', CURRENT_DATE),
  ('1054', 'SH-7811', '1055', 'Gc-14', 400.00, 'kg', '2026-11-07', 'In Transit', CURRENT_DATE),
  ('1054', 'SH-7812', '1021', 'Gc-22', 600.00, 'kg', '2026-11-09', 'Delayed', CURRENT_DATE),
  ('1054', 'SH-7813', '1055', 'Gc-22', 500.00, 'kg', '2026-11-08', 'Scheduled', CURRENT_DATE),
  ('1054', 'SH-7814', '1055', 'Gc-19', 300.00, 'kg', '2026-11-10', 'In Transit', CURRENT_DATE),
  ('1054', 'SH-7815', '1021', 'Gc-14', 920.00, 'kg', '2026-11-08', 'Scheduled', CURRENT_DATE),
  ('1054', 'SH-7816', '1055', 'Gc-22', 850.00, 'kg', '2026-11-11', 'Scheduled', CURRENT_DATE),
  ('1054', 'SH-7817', '1055', 'Gc-11', 400.00, 'kg', '2026-11-12', 'In Transit', CURRENT_DATE),
  ('1054', 'SH-7818', '1055', 'Gc-04', 1200.00, 'kg', '2026-11-09', 'In Transit', CURRENT_DATE),
  ('1054', 'SH-7819', '1021', 'Gd-09', 500.00, 'kg', '2026-11-07', 'Delayed', CURRENT_DATE),
  ('1054', 'SH-7820', '1055', 'Ga-17', 600.00, 'kg', '2026-11-10', 'Scheduled', CURRENT_DATE)
ON CONFLICT ("Shipment_ID") DO UPDATE SET
  "Shipment_Quantity" = EXCLUDED."Shipment_Quantity",
  "Shipment_Status" = EXCLUDED."Shipment_Status",
  "Delivery_Date" = EXCLUDED."Delivery_Date";
