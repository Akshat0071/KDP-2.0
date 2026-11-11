-- ==============================================================================
-- KDP GreenSource Enterprise Inventory Management System
-- Core Sourcing Engine & Inventory SQL Queries
-- Strictly Aligned with KDP Dataset ER Diagram & Whiteboard Mapping
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AUTO-REPLENISHMENT CALCULATION QUERY
-- Calculates exact quantity to order for every green to restore minimum threshold:
-- Formula: GREATEST(0, (Min_Threshold + Open_Demand) - (Quantity_Available + Incoming_Shipments))
-- ------------------------------------------------------------------------------
WITH open_orders AS (
  SELECT
    "Site_ID",
    "Green_Material_ID",
    COALESCE(SUM("Order_Quantity"), 0) AS "Open_Demand"
  FROM "Fact_Table_Orders"
  WHERE "Status" IN ('pending', 'needs-signoff', 'at-risk', 'awaiting-approval')
  GROUP BY "Site_ID", "Green_Material_ID"
),
incoming_shipments AS (
  SELECT
    "Site_ID",
    "Green_Material_ID",
    COALESCE(SUM("Shipment_Quantity"), 0) AS "Incoming_Quantity"
  FROM "Fact_Table_Shipment_Details"
  WHERE "Shipment_Status" IN ('Scheduled', 'In Transit')
  GROUP BY "Site_ID", "Green_Material_ID"
)
SELECT
  i."Site_ID",
  s."Site_Name",
  i."Green_Material_ID",
  g."Green_Material_Description",
  i."Quantity_Available",
  COALESCE(ord."Open_Demand", 0) AS "Open_Demand",
  i."Min_Threshold",
  COALESCE(inc."Incoming_Quantity", 0) AS "Incoming_Shipments",
  (i."Quantity_Available" + COALESCE(inc."Incoming_Quantity", 0) - COALESCE(ord."Open_Demand", 0)) AS "Projected_Balance",
  GREATEST(
    0,
    (COALESCE(ord."Open_Demand", 0) + i."Min_Threshold") - (i."Quantity_Available" + COALESCE(inc."Incoming_Quantity", 0))
  ) AS "Recommended_Replenish_Quantity",
  -- Assigned lowest-freight warehouse and fixed freight from whiteboard
  sc."Warehouse_ID" AS "Assigned_Warehouse_ID",
  sc."Cost" AS "Warehouse_Shipping_Cost",
  -- Landed cost calculation = (Quantity * Green Price) + Shipping Cost
  ROUND(
    GREATEST(
      0,
      (COALESCE(ord."Open_Demand", 0) + i."Min_Threshold") - (i."Quantity_Available" + COALESCE(inc."Incoming_Quantity", 0))
    ) * g."Price" + sc."Cost",
    2
  ) AS "Estimated_Total_Replenish_Cost"
FROM "Fact_Table_Inventory" i
JOIN "Dimension_Table_Site" s ON s."Site_ID" = i."Site_ID"
JOIN "Dimension_Table_Green_Materials" g ON g."Green_Material_ID" = i."Green_Material_ID"
LEFT JOIN "Application_Table_Shipping_Cost" sc ON sc."Site_ID" = i."Site_ID"
LEFT JOIN open_orders ord ON ord."Site_ID" = i."Site_ID" AND ord."Green_Material_ID" = i."Green_Material_ID"
LEFT JOIN incoming_shipments inc ON inc."Site_ID" = i."Site_ID" AND inc."Green_Material_ID" = i."Green_Material_ID"
WHERE i."Site_ID" = '1054' -- Filter by active site (Site 1054 Plano Roasting)
ORDER BY "Recommended_Replenish_Quantity" DESC;


-- ------------------------------------------------------------------------------
-- 2. LOWEST-COST DESIGNATED WAREHOUSE SOURCING LOOKUP
-- For a given site (e.g. 1054) and order requirement (e.g. 1,200 kg Gc-04),
-- looks up the assigned lowest-cost warehouse and available unreserved stock:
-- Total Cost = (Selected_Green_Price * Selected_Green_Quantity) + Shipping_Cost
-- ------------------------------------------------------------------------------
SELECT
  sc."Warehouse_ID",
  ws."Site_Name" AS "Warehouse_Name",
  g."Green_Material_ID",
  g."Green_Material_Description",
  g."Price" AS "Unit_Price",
  1200.00 AS "Required_Quantity",
  sc."Cost" AS "Fixed_Shipping_Cost",
  ROUND((1200.00 * g."Price") + sc."Cost", 2) AS "Total_Delivered_Cost",
  ROUND(((1200.00 * g."Price") + sc."Cost") / 1200.00, 2) AS "Landed_Per_Kg",
  wi."Quantity_Available" AS "Warehouse_Stock_Available",
  CASE WHEN wi."Quantity_Available" >= 1200.00 THEN true ELSE false END AS "Is_Fulfillable"
FROM "Application_Table_Shipping_Cost" sc
JOIN "Dimension_Table_Site" ws ON ws."Site_ID" = sc."Warehouse_ID"
JOIN "Dimension_Table_Green_Materials" g ON g."Green_Material_ID" = 'Gc-04'
LEFT JOIN "Fact_Table_Inventory" wi ON wi."Site_ID" = sc."Warehouse_ID" AND wi."Green_Material_ID" = 'Gc-04'
WHERE sc."Site_ID" = '1054' -- Plano site assigned warehouse
ORDER BY sc."Cost" ASC
LIMIT 1;


-- ------------------------------------------------------------------------------
-- 3. SOURCING WATERFALL CASCADE SCENARIO EVALUATION
-- Evaluates feasible sourcing options for an order (e.g. PO-2842 Brazil Cerrado 800 kg):
-- Option 1: Local same green in Site 1054 ($0 shipping)
-- Option 2: Local approved alternate in Site 1054 ($0 shipping)
-- Option 3: Assigned lowest-freight warehouse (Warehouse 1055, $589 shipping)
-- Option 4: Assigned warehouse alternate green
-- ------------------------------------------------------------------------------
-- 1. Local Same Green
SELECT
  1 AS "Option_ID",
  'Local Inventory (Exact Match)' AS "Sourcing_Tier",
  i."Site_ID" AS "Source_Site_ID",
  g."Green_Material_ID" AS "Selected_Green_ID",
  g."Green_Material_Description",
  g."Price" AS "Selected_Green_Price",
  800.00 AS "Quantity",
  0.00 AS "Shipping_Cost",
  ROUND(800.00 * g."Price", 2) AS "Total_Cost",
  CASE WHEN i."Quantity_Available" >= 800.00 THEN true ELSE false END AS "Is_Feasible",
  false AS "Procurement_Required"
FROM "Fact_Table_Inventory" i
JOIN "Dimension_Table_Green_Materials" g ON g."Green_Material_ID" = i."Green_Material_ID"
WHERE i."Site_ID" = '1054' AND i."Green_Material_ID" = 'Gc-11'

UNION ALL

-- 2. Local Approved Alternate (via Alternate_Green_ID self-reference)
SELECT
  2 AS "Option_ID",
  'Local Alternate (Zero Shipping)' AS "Sourcing_Tier",
  i."Site_ID" AS "Source_Site_ID",
  alt."Green_Material_ID" AS "Selected_Green_ID",
  alt."Green_Material_Description",
  alt."Price" AS "Selected_Green_Price",
  800.00 AS "Quantity",
  0.00 AS "Shipping_Cost",
  ROUND(800.00 * alt."Price", 2) AS "Total_Cost",
  CASE WHEN i."Quantity_Available" >= 800.00 THEN true ELSE false END AS "Is_Feasible",
  false AS "Procurement_Required"
FROM "Dimension_Table_Green_Materials" g
JOIN "Dimension_Table_Green_Materials" alt ON alt."Green_Material_ID" = g."Alternate_Green_ID"
JOIN "Fact_Table_Inventory" i ON i."Site_ID" = '1054' AND i."Green_Material_ID" = alt."Green_Material_ID"
WHERE g."Green_Material_ID" = 'Gc-11'

UNION ALL

-- 3. Assigned Warehouse Fulfillment (Lowest Freight Warehouse)
SELECT
  3 AS "Option_ID",
  'Assigned Warehouse Transfer' AS "Sourcing_Tier",
  sc."Warehouse_ID" AS "Source_Site_ID",
  g."Green_Material_ID" AS "Selected_Green_ID",
  g."Green_Material_Description",
  g."Price" AS "Selected_Green_Price",
  800.00 AS "Quantity",
  sc."Cost" AS "Shipping_Cost",
  ROUND((800.00 * g."Price") + sc."Cost", 2) AS "Total_Cost",
  CASE WHEN wi."Quantity_Available" >= 800.00 THEN true ELSE false END AS "Is_Feasible",
  true AS "Procurement_Required"
FROM "Application_Table_Shipping_Cost" sc
JOIN "Dimension_Table_Green_Materials" g ON g."Green_Material_ID" = 'Gc-11'
LEFT JOIN "Fact_Table_Inventory" wi ON wi."Site_ID" = sc."Warehouse_ID" AND wi."Green_Material_ID" = 'Gc-11'
WHERE sc."Site_ID" = '1054'

ORDER BY "Is_Feasible" DESC, "Total_Cost" ASC;


-- ------------------------------------------------------------------------------
-- 4. CENTRAL WAREHOUSE ORDERS FULFILLMENT QUEUE
-- Sourcing view for Central Warehouse Manager to review, approve, or partial-accept
-- orders placed by local plants:
-- ------------------------------------------------------------------------------
SELECT
  o."Order_Number",
  o."Site_ID" AS "Local_Site_ID",
  s."Site_Name" AS "Local_Site_Name",
  o."FG_Material_ID",
  o."FG_Material_Description",
  o."Brand",
  o."Green_Material_ID",
  g."Green_Material_Description",
  o."Order_Quantity",
  o."Unit_of_Measurement",
  g."Price" AS "Green_Price",
  sc."Cost" AS "Assigned_Shipping_Cost",
  ROUND((o."Order_Quantity" * g."Price") + sc."Cost", 2) AS "Total_Delivered_Cost",
  o."Schedule_Start_date",
  o."Status",
  -- Warehouse stock available for allocation
  wi."Quantity_Available" AS "Central_Warehouse_Stock_Available",
  CASE 
    WHEN wi."Quantity_Available" >= o."Order_Quantity" THEN 'Sufficient Uncommitted Stock'
    ELSE 'Stock Constrained · Partial Recommended'
  END AS "Stock_Buffer_Assessment"
FROM "Fact_Table_Orders" o
JOIN "Dimension_Table_Site" s ON s."Site_ID" = o."Site_ID"
JOIN "Dimension_Table_Green_Materials" g ON g."Green_Material_ID" = o."Green_Material_ID"
LEFT JOIN "Application_Table_Shipping_Cost" sc ON sc."Site_ID" = o."Site_ID"
LEFT JOIN "Fact_Table_Inventory" wi ON wi."Site_ID" = sc."Warehouse_ID" AND wi."Green_Material_ID" = o."Green_Material_ID"
WHERE sc."Warehouse_ID" = '1055' -- Central Warehouse 1055 Manager View
ORDER BY o."Schedule_Start_date" ASC;
