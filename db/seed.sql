-- ==============================================================================
-- KDP GreenSource Enterprise Inventory Management System
-- Seed Dataset (Updated for Merged Sites, User Info, Dual Orders, & Logs)
-- ==============================================================================

-- 1. Dimension_Table_Site (Merged 7 Local Roasting Plants & 3 Central Warehouses)
INSERT INTO "Dimension_Table_Site" ("Site_ID", "Site_Name", "Facility_Type", "Location") VALUES
  ('1020', 'Warehouse 1020', 'Central Warehouse', 'Pacific Northwest Hub, WA'),
  ('1021', 'Warehouse 1021', 'Central Warehouse', 'Northeast Hub, MA'),
  ('1055', 'Warehouse 1055', 'Central Warehouse', 'Central Distribution Hub, TX'),
  ('1003', 'Site 1003 — Sumner Plant', 'Local Roasting Plant', 'Sumner, WA'),
  ('1004', 'Site 1004 — Castroville Plant', 'Local Roasting Plant', 'Castroville, CA'),
  ('1006', 'Site 1006 — Essex Plant', 'Local Roasting Plant', 'Essex, VT'),
  ('1009', 'Site 1009 — Knoxville Plant', 'Local Roasting Plant', 'Knoxville, TN'),
  ('1054', 'Site 1054 — Plano Roasting', 'Local Roasting Plant', 'Plano, TX'),
  ('1102', 'Site 1102 — Windsor Facility', 'Local Roasting Plant', 'Windsor, VA'),
  ('1103', 'Site 1103 — Montreal Plant', 'Local Roasting Plant', 'Montreal, QC')
ON CONFLICT ("Site_ID") DO UPDATE SET
  "Site_Name" = EXCLUDED."Site_Name",
  "Facility_Type" = EXCLUDED."Facility_Type",
  "Location" = EXCLUDED."Location";

-- 2. Platform_Table_User_Info
INSERT INTO "Platform_Table_User_Info" ("User_ID", "Site_ID", "Email", "Password_Hash", "Name", "Role", "Created_At", "Last_Login") VALUES
  (
    'USR-1054-01',
    '1054',
    'maya.torres@kdpgreensource.com',
    crypt('PlanoRoast2026!', gen_salt('bf')),
    'Maya Torres',
    'Local Buyer',
    '2026-01-15 08:00:00+00',
    '2026-11-16 09:30:00+00'
  ),
  (
    'USR-1055-01',
    '1055',
    'marcus.vance@kdpgreensource.com',
    crypt('CentralHub2026!', gen_salt('bf')),
    'Marcus Vance',
    'Warehouse Manager',
    '2026-01-10 08:00:00+00',
    '2026-11-16 08:45:00+00'
  ),
  (
    'USR-1003-01',
    '1003',
    'sarah.chen@kdpgreensource.com',
    crypt('SumnerRoast2026!', gen_salt('bf')),
    'Sarah Chen',
    'Local Buyer',
    '2026-02-01 08:00:00+00',
    '2026-11-15 17:00:00+00'
  )
ON CONFLICT ("Email") DO NOTHING;

-- 3. Application_Table_Shipping_Cost (Whiteboard Fixed Freight Matrix)
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

-- 4. Dimension_Table_Green_Materials
INSERT INTO "Dimension_Table_Green_Materials" ("Green_Material_ID", "Green_Material_Description", "Price") VALUES
  ('Gc-04', 'Colombia Supremo Washed', 3.90),
  ('Gc-11', 'Brazil Cerrado Natural', 3.40),
  ('Gc-14', 'Guatemala Antigua SHB', 4.10),
  ('Gc-22', 'Huila Washed Regional', 4.40),
  ('Gc-19', 'Ethiopia Yirgacheffe Washed', 4.60),
  ('Gd-09', 'Ethiopia Yirgacheffe Natural', 4.85),
  ('Ga-17', 'Kenya AA Nyeri Grade 1', 5.20),
  ('Ge-31', 'Sumatra Mandheling Grade 1', 4.60),
  ('Gh-08', 'Costa Rica Tarrazu SHB Honey', 4.30)
ON CONFLICT ("Green_Material_ID") DO UPDATE SET
  "Green_Material_Description" = EXCLUDED."Green_Material_Description",
  "Price" = EXCLUDED."Price";

-- 5. Application_Table_Green_Material_Alternate
INSERT INTO "Application_Table_Green_Material_Alternate" ("Green_Material_ID", "Alternate_Green_ID") VALUES
  ('Gc-04', 'Gc-14'),
  ('Gc-11', 'Gc-14'),
  ('Gc-14', 'Gc-22'),
  ('Gc-22', 'Gc-19'),
  ('Gc-19', 'Ga-17'),
  ('Gd-09', 'Gc-11')
ON CONFLICT ("Green_Material_ID", "Alternate_Green_ID") DO NOTHING;

-- 6. Fact_Table_Inventory (Local Roasting Facility Stock & Safety Thresholds)
-- (Quantity_Incoming and Safety_Status are computed dynamically)
INSERT INTO "Fact_Table_Inventory" ("Site_ID", "Green_Material_ID", "Quantity_Available", "Minimum_Threshold", "Unit_of_Measurement", "Updated_Date") VALUES
  ('1054', 'Gc-04', 800.00,  1200.00, 'kg', CURRENT_DATE),
  ('1054', 'Gc-11', 1600.00, 1000.00, 'kg', CURRENT_DATE),
  ('1054', 'Gc-14', 1300.00, 1000.00, 'kg', CURRENT_DATE),
  ('1054', 'Gc-22', 900.00,  800.00,  'kg', CURRENT_DATE),
  ('1054', 'Gc-19', 700.00,  700.00,  'kg', CURRENT_DATE),
  ('1054', 'Gd-09', 250.00,  700.00,  'kg', CURRENT_DATE),
  ('1054', 'Ga-17', 4200.00, 2500.00, 'kg', CURRENT_DATE),
  ('1054', 'Ge-31', 350.00,  1200.00, 'kg', CURRENT_DATE),
  ('1054', 'Gh-08', 1600.00, 1200.00, 'kg', CURRENT_DATE)
ON CONFLICT ("Site_ID", "Green_Material_ID") DO UPDATE SET
  "Quantity_Available" = EXCLUDED."Quantity_Available",
  "Minimum_Threshold" = EXCLUDED."Minimum_Threshold",
  "Updated_Date" = CURRENT_DATE;

-- 7. Fact_Table_Orders (Production Demand Orders and Threshold Replenishment Orders)
-- Combines active queue, order history, and lifecycle audit trail (Timeline_History JSONB)
INSERT INTO "Fact_Table_Orders" (
  "Order_Number", "Site_ID", "Order_Type", "FG_Material_ID", "FG_Material_Description",
  "Brand", "Brand_Type", "Green_Material_ID", "Order_Quantity", "Unit_of_Measurement",
  "Final_Green_ID", "Selected_Option_ID", "Schedule_Start_Date", "Delivery_Target_Date",
  "Status", "Rejection_Reason", "Is_Closed", "Timeline_History", "Created_At"
) VALUES
  (
    '2843', '1054', 'PRODUCTION', 'FG-4401', 'Dark Magic Blend Whole Bean 12oz',
    'Green Mountain Coffee Roasters', 'Signature Blend', 'Gc-04', 1200.00, 'kg',
    'Gc-04', 1, '2026-11-10', '2026-11-09', 'in transit', NULL, false,
    '[
      {"stage": "new", "actor": "Production System", "role": "System", "notes": "Roasting demand scheduled for Dark Magic Blend", "timestamp": "2026-10-20T09:00:00Z"},
      {"stage": "approved", "actor": "Maya Torres", "role": "Local Buyer", "notes": "Approved lowest-cost Warehouse 1055 fulfillment option", "timestamp": "2026-10-21T10:15:00Z"},
      {"stage": "requested", "actor": "Maya Torres", "role": "Local Buyer", "notes": "Transfer request sent to Warehouse 1055 Manager", "timestamp": "2026-10-21T10:30:00Z"},
      {"stage": "accepted", "actor": "Marcus Vance", "role": "Warehouse Manager", "notes": "Accepted 1,200 kg Gc-04 transfer request", "timestamp": "2026-10-22T08:30:00Z"},
      {"stage": "dispatched", "actor": "Marcus Vance", "role": "Warehouse Manager", "notes": "Staged and dispatched at Outbound Bay 3", "timestamp": "2026-10-23T14:00:00Z"},
      {"stage": "in transit", "actor": "Freight Logistics", "role": "Carrier", "notes": "En route to Plano Roasting Site 1054", "timestamp": "2026-10-24T07:45:00Z"}
    ]'::jsonb,
    '2026-10-20 09:00:00+00'
  ),
  (
    '2842', '1054', 'PRODUCTION', 'FG-3108', 'Barista Reserve Medium Roast K-Cup',
    'The Original Donut Shop', 'Signature Roast', 'Gc-11', 800.00, 'kg',
    'Gc-14', 1, '2026-11-09', '2026-11-08', 'approved', NULL, false,
    '[
      {"stage": "new", "actor": "Production System", "role": "System", "notes": "Roasting demand scheduled for Barista Reserve", "timestamp": "2026-10-21T08:00:00Z"},
      {"stage": "approved", "actor": "Maya Torres", "role": "Local Buyer", "notes": "Approved local alternate green bean Gc-14 ($0 freight)", "timestamp": "2026-10-21T11:30:00Z"}
    ]'::jsonb,
    '2026-10-21 11:30:00+00'
  ),
  (
    '2844', '1054', 'PRODUCTION', 'FG-2204', 'Nantucket Blend Ground 12oz',
    'Green Mountain Coffee Roasters', 'Heritage Blend', 'Gc-14', 600.00, 'kg',
    'Gc-14', 1, '2026-11-07', '2026-11-06', 'requested', NULL, false,
    '[
      {"stage": "new", "actor": "Production System", "role": "System", "notes": "Roasting demand scheduled for Nantucket Blend", "timestamp": "2026-10-22T08:30:00Z"},
      {"stage": "requested", "actor": "Maya Torres", "role": "Local Buyer", "notes": "Transfer requested from Warehouse 1055", "timestamp": "2026-10-22T14:15:00Z"}
    ]'::jsonb,
    '2026-10-22 14:15:00+00'
  ),
  (
    '2841', '1054', 'PRODUCTION', 'FG-1102', 'Single Origin Ethiopia Yirgacheffe 10oz',
    'Green Mountain Specialty', 'Single Origin', 'Gd-09', 1260.00, 'kg',
    'Gd-09', 1, '2026-11-08', '2026-11-07', 'closed', NULL, true,
    '[
      {"stage": "new", "actor": "Production System", "role": "System", "notes": "Demand created", "timestamp": "2026-10-18T10:00:00Z"},
      {"stage": "approved", "actor": "Maya Torres", "role": "Local Buyer", "notes": "Approved warehouse transfer", "timestamp": "2026-10-18T11:30:00Z"},
      {"stage": "delivered", "actor": "Receiving Dock", "role": "Dock Staff", "notes": "Received at Site 1054 Dock", "timestamp": "2026-10-22T15:00:00Z"},
      {"stage": "closed", "actor": "System", "role": "System", "notes": "Fulfillment verified; order closed and archived to history", "timestamp": "2026-10-22T16:00:00Z"}
    ]'::jsonb,
    '2026-10-18 10:00:00+00'
  ),
  (
    '2846', '1054', 'PRODUCTION', 'FG-5510', 'Sumatra Reserve Single Origin Whole Bean 12oz',
    'Green Mountain Coffee Roasters', 'Single Origin', 'Ge-31', 1500.00, 'kg',
    'Ge-31', 1, '2026-11-12', '2026-11-11', 'new', NULL, false,
    '[
      {"stage": "new", "actor": "Production System", "role": "System", "notes": "Roasting demand scheduled; pending sourcing evaluation", "timestamp": "2026-10-25T08:30:00Z"}
    ]'::jsonb,
    '2026-10-25 08:30:00+00'
  ),
  -- Safety Threshold Replenishment Order (Null FG details)
  (
    '3001', '1054', 'REPLENISHMENT', NULL, NULL,
    NULL, NULL, 'Gd-09', 450.00, 'kg',
    'Gd-09', 1, '2026-11-05', '2026-11-04', 'accepted', NULL, false,
    '[
      {"stage": "new", "actor": "Maya Torres", "role": "Local Buyer", "notes": "Auto-replenish order created to restore Gd-09 minimum safety threshold", "timestamp": "2026-10-25T15:40:00Z"},
      {"stage": "accepted", "actor": "Marcus Vance", "role": "Warehouse Manager", "notes": "Warehouse 1055 accepted restock replenishment request", "timestamp": "2026-10-25T16:10:00Z"}
    ]'::jsonb,
    '2026-10-25 15:40:00+00'
  )
ON CONFLICT ("Order_Number") DO NOTHING;

-- 8. Fact_Table_Optimization_Table
INSERT INTO "Fact_Table_Optimization_Table" (
  "Option_ID", "Order_Number", "Green_Material_ID", "Site_ID", "Source_Type", "Source_Site_ID",
  "Selected_Green_ID", "Selected_Green_Price", "Selected_Green_Quantity", "Shipping_Cost", "Total_Cost",
  "Procurement_Required", "Is_Feasible", "Is_Recommended", "Is_Selected", "Exclusion_Reason"
) VALUES
  (1, '2843', 'Gc-04', '1054', 'Warehouse Fulfillment', '1055', 'Gc-04', 3.90, 1200.00, 589.00, 5269.00, true, true, true, true, NULL),
  (2, '2843', 'Gc-04', '1054', 'Local Inventory', '1054', 'Gc-04', 3.90, 800.00, 0.00, 3120.00, false, false, false, false, 'Only 800 kg available — 400 kg short of order quantity'),
  (1, '2842', 'Gc-11', '1054', 'Local Alternate', '1054', 'Gc-14', 4.10, 800.00, 0.00, 3280.00, false, true, true, true, NULL),
  (2, '2842', 'Gc-11', '1054', 'Warehouse Fulfillment', '1055', 'Gc-11', 3.40, 800.00, 589.00, 3309.00, true, true, false, false, NULL)
ON CONFLICT ("Order_Number", "Option_ID") DO NOTHING;

-- 9. Fact_Table_Shipment_Details
INSERT INTO "Fact_Table_Shipment_Details" (
  "Shipment_ID", "Order_Number", "Replenishment_ID", "Site_ID", "From_Warehouse_ID",
  "Green_Material_ID", "Shipment_Quantity", "Unit_of_Measurement", "Shipped_Date",
  "Estimated_Arrival_Date", "Delivery_Date", "Shipping_Cost", "Shipment_Status", "Is_Delayed"
) VALUES
  ('SH-7810', '2843', NULL, '1054', '1055', 'Gc-04', 1200.00, 'kg', '2026-10-24', '2026-10-27', NULL, 589.00, 'Delayed', true),
  ('SH-7811', '2844', NULL, '1054', '1055', 'Gc-14', 400.00, 'kg', '2026-10-25', '2026-10-28', NULL, 589.00, 'In Transit', false),
  ('SH-7812', NULL, '3001', '1054', '1055', 'Gd-09', 450.00, 'kg', '2026-10-26', '2026-10-29', NULL, 589.00, 'Scheduled', false)
ON CONFLICT ("Shipment_ID") DO NOTHING;

-- 10. Application_Table_Notifications
INSERT INTO "Application_Table_Notifications" (
  "Site_ID", "User_ID", "Severity", "Type", "Title", "Message", "Action_Label", "Action_URL"
) VALUES
  ('1054', 'USR-1054-01', 'critical', 'below_threshold', 'Safety Threshold Alert', 'Gd-09 below minimum — 250 / 700 kg', 'Replenish', '/inventory?tab=stock'),
  ('1054', 'USR-1054-01', 'warning', 'transfer_delay', 'Shipment Delayed', 'SH-7810 delayed 2 days — revised ETA Oct 29', 'Track', '/inventory?tab=incoming'),
  ('1054', 'USR-1054-01', 'critical', 'no_feasible', 'Sourcing Infeasible', 'Order 2846 no feasible option — all scenarios exhausted', 'Review', '/orders?id=2846'),
  ('1054', 'USR-1054-01', 'info', 'alternate_approved', 'Alternate Approved', 'Gc-14 approved as alternate to Gc-04 in Local Inventory', 'View', '/inventory?tab=stock');

-- 11. Platform_Table_Audit_Logs (System Compliance & Operations Log)
INSERT INTO "Platform_Table_Audit_Logs" ("User_ID", "Action_Type", "Target_Entity", "Target_ID", "Details") VALUES
  ('USR-1054-01', 'ORDER_APPROVED', 'Fact_Table_Orders', '2842', '{"option": 1, "selected_green": "Gc-14", "price": 4.10, "source": "Local Alternate"}'::jsonb),
  ('USR-1054-01', 'REPLENISHMENT_PLACED', 'Fact_Table_Orders', '3001', '{"green": "Gd-09", "quantity": 450, "warehouse": "1055", "cost": 589.00}'::jsonb),
  ('USR-1055-01', 'SHIPMENT_DISPATCHED', 'Fact_Table_Shipment_Details', 'SH-7810', '{"shipped_date": "2026-10-24", "origin": "1055", "destination": "1054"}'::jsonb);
