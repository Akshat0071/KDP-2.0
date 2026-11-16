# KDP GreenSource Enterprise — Updated ER Diagram & Schema Guide

## 1. Updated Mermaid Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    Dimension_Table_Site ||--o{ Platform_Table_User_Info : "has_users"
    Dimension_Table_Site ||--o{ Fact_Table_Inventory : "has_stock"
    Dimension_Table_Site ||--o{ Fact_Table_Orders : "places_or_receives_orders"
    Dimension_Table_Site ||--o{ Application_Table_Shipping_Cost : "origin_warehouse"
    Dimension_Table_Site ||--o{ Application_Table_Shipping_Cost : "destination_site"
    Dimension_Table_Site ||--o{ Fact_Table_Shipment_Details : "ships_to_site"
    Dimension_Table_Site ||--o{ Fact_Table_Shipment_Details : "ships_from_warehouse"
    Dimension_Table_Site ||--o{ Application_Table_Notifications : "site_notifications"

    Dimension_Table_Green_Materials ||--o{ Fact_Table_Inventory : "stocked_in_inventory"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Orders : "requested_green"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Orders : "final_selected_green"
    Dimension_Table_Green_Materials ||--o{ Application_Table_Green_Material_Alternate : "base_green"
    Dimension_Table_Green_Materials ||--o{ Application_Table_Green_Material_Alternate : "alternate_green"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Shipment_Details : "shipped_material"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Optimization_Table : "optimized_green"

    Fact_Table_Orders ||--o{ Fact_Table_Optimization_Table : "evaluates_sourcing_options"
    Fact_Table_Orders ||--o{ Fact_Table_Shipment_Details : "generates_shipment"
    Fact_Table_Orders ||--o{ Fact_Table_Order_Status_History : "tracks_lifecycle_transitions"

    Platform_Table_User_Info ||--o{ Fact_Table_Order_Status_History : "changed_by"
    Platform_Table_User_Info ||--o{ Application_Table_Notifications : "receives_alert"
    Platform_Table_User_Info ||--o{ Platform_Table_Audit_Logs : "performed_action"

    Dimension_Table_Site {
        varchar Site_ID PK
        varchar Site_Name
        varchar Facility_Type
        varchar Location
    }

    Platform_Table_User_Info {
        varchar User_ID PK
        varchar Site_ID FK
        varchar Email UK
        varchar Password_Hash
        varchar Name
        varchar Role
        timestamptz Created_At
        timestamptz Last_Login
    }

    Dimension_Table_Green_Materials {
        varchar Green_Material_ID PK
        varchar Green_Material_Description
        decimal Price
    }

    Application_Table_Green_Material_Alternate {
        varchar Green_Material_ID PK,FK
        varchar Alternate_Green_ID PK,FK
    }

    Application_Table_Shipping_Cost {
        varchar Warehouse_ID PK,FK
        varchar Site_ID PK,FK
        decimal Cost
    }

    Fact_Table_Inventory {
        varchar Site_ID PK,FK
        varchar Green_Material_ID PK,FK
        decimal Quantity_Available
        decimal Minimum_Threshold
        varchar Unit_of_Measurement
        date Updated_Date
    }

    Fact_Table_Orders {
        varchar Order_Number PK
        varchar Site_ID FK
        varchar Order_Type
        varchar FG_Material_ID
        varchar FG_Material_Description
        varchar Brand
        varchar Brand_Type
        varchar Green_Material_ID FK
        decimal Order_Quantity
        varchar Unit_of_Measurement
        varchar Final_Green_ID FK
        int Selected_Option_ID
        date Schedule_Start_Date
        date Delivery_Target_Date
        varchar Status
        text Rejection_Reason
        timestamptz Created_At
        date Updated_Date
    }

    Fact_Table_Optimization_Table {
        int Option_ID PK
        varchar Order_Number PK,FK
        varchar Green_Material_ID FK
        varchar Site_ID FK
        varchar Source_Type
        varchar Source_Site_ID FK
        varchar Selected_Green_ID FK
        decimal Selected_Green_Price
        decimal Selected_Green_Quantity
        decimal Shipping_Cost
        decimal Total_Cost
        boolean Procurement_Required
        boolean Is_Feasible
        boolean Is_Recommended
        boolean Is_Selected
        text Exclusion_Reason
    }

    Fact_Table_Shipment_Details {
        varchar Shipment_ID PK
        varchar Order_Number FK
        varchar Replenishment_ID
        varchar Site_ID FK
        varchar From_Warehouse_ID FK
        varchar Green_Material_ID FK
        decimal Shipment_Quantity
        varchar Unit_of_Measurement
        date Shipped_Date
        date Estimated_Arrival_Date
        date Delivery_Date
        decimal Shipping_Cost
        varchar Shipment_Status
        boolean Is_Delayed
        date Updated_Date
    }

    Fact_Table_Order_Status_History {
        bigint History_ID PK
        varchar Order_Number FK
        varchar Order_Type
        varchar Replenishment_ID
        varchar From_Status
        varchar To_Status
        varchar Changed_By_User_ID FK
        varchar Actor_Role
        text Notes
        timestamptz Created_At
    }

    Application_Table_Notifications {
        bigint Notification_ID PK
        varchar Site_ID FK
        varchar User_ID FK
        varchar Severity
        varchar Type
        varchar Title
        text Message
        varchar Action_Label
        varchar Action_URL
        boolean Is_Read
        timestamptz Created_At
    }

    Platform_Table_Audit_Logs {
        bigint Log_ID PK
        varchar User_ID FK
        varchar Action_Type
        varchar Target_Entity
        varchar Target_ID
        jsonb Details
        timestamptz Created_At
    }
```

---

## 2. Summary of Applied Design Decisions

| # | Requested Change | Implementation Details |
|---|---|---|
| **1** | **Update `Fact_Table_Orders`** | Added `Order_Type` (`'PRODUCTION'` vs `'REPLENISHMENT'`). Made finished good columns (`FG_Material_ID`, `FG_Material_Description`, `Brand`, `Brand_Type`) **NULLABLE** so raw bean threshold replenishment orders can be registered seamlessly. |
| **2** | **Add `Fact_Table_Order_Status_History`** | Tracks the 9-stage lifecycle (`new` $\rightarrow$ `approved` $\rightarrow$ `requested` $\rightarrow$ `accepted` $\rightarrow$ `dispatched` $\rightarrow$ `in transit` $\rightarrow$ `delivered` $\rightarrow$ `received` $\rightarrow$ `closed`), supporting both production fulfillment orders (`Order_Number`) and replenishment orders (`Replenishment_ID`). |
| **3** | **Add `Application_Table_Notifications`** | Powers the topbar bell icon and alerts drawer with severity levels (`critical`, `warning`, `info`), deep-link action buttons (`/inventory?tab=stock`, `/orders`), and read state tracking. |
| **4** | **Add `Platform_Table_Audit_Logs`** | System compliance log recording user sign-offs, automated sourcing cascade evaluations, threshold overrides, and warehouse dock scans. |
| **5** | **Merge `Site` and `Warehouse` Tables** | Merged into `Dimension_Table_Site` with `Facility_Type` (`'Local Roasting Plant'` vs `'Central Warehouse'`) and `Location`. Warehouse inventory is excluded as out-of-scope. |
| **6** | **Update `Platform_Table_User_Info`** | Added `Name`, `Role` (`'Local Buyer'` vs `'Warehouse Manager'`), `Created_At`, and `Last_Login`. |
| **7** | **Catalog Simplification** | `Dimension_Table_Green_Materials` retains clean catalog attributes (`Green_Material_ID`, `Green_Material_Description`, `Price`). Minimum thresholds remain in `Fact_Table_Inventory` per site. |
| **8** | **Dynamic Computation in Inventory** | `Quantity_Reserved`, `Quantity_Incoming`, and `Safety_Status` are **NOT** stored as static columns in `Fact_Table_Inventory` — they are dynamically computed on render: `Projected = Available + Incoming - Open Demand`. |
| **9** | **Refine `Fact_Table_Orders`** | Removed static `Assigned_Warehouse_ID` (system calculates the lowest-cost warehouse recommendation dynamically). Added `Selected_Option_ID`, `Rejection_Reason`, and `Delivery_Target_Date`. |
| **10** | **Refine `Fact_Table_Shipment_Details`** | Added `Order_Number` (nullable for production orders) and `Replenishment_ID` (for threshold restocks). Removed `Carrier_Name` and `Tracking_Number`. Added `Shipped_Date`, `Estimated_Arrival_Date`, `Shipping_Cost`, and `Is_Delayed`. |
| **11** | **Enrich `Fact_Table_Optimization_Table`** | Added `Source_Type` (*'Local Inventory'*, *'Local Alternate'*, *'Warehouse Fulfillment'*), `Is_Feasible`, `Is_Recommended`, `Is_Selected`, and `Exclusion_Reason`. |

---

## 3. Codebase and Website Integration Status

- **PostgreSQL DDL**: [db/schema.sql](file:///e:/Akshat/My%20Projects/kdp%20capstone/db/schema.sql) has been updated with the merged site table, dual order types, history, notifications, and logs.
- **Seed Data**: [db/seed.sql](file:///e:/Akshat/My%20Projects/kdp%20capstone/db/seed.sql) has been loaded with sample production demand and threshold replenishment data.
- **Website Mock Data**: [src/data/mockData.js](file:///e:/Akshat/My%20Projects/kdp%20capstone/src/data/mockData.js) provides the merged `SITES`, user profiles, orders with `orderType`, shipments with `estimatedArrivalDate` and `shippingCost`, notifications, and audit logs.
- **Context & Pages**: [OrdersContext.jsx](file:///e:/Akshat/My%20Projects/kdp%20capstone/src/context/OrdersContext.jsx), [Inventory.jsx](file:///e:/Akshat/My%20Projects/kdp%20capstone/src/pages/LocalBuyer/Inventory.jsx), and [Orders.jsx](file:///e:/Akshat/My%20Projects/kdp%20capstone/src/pages/LocalBuyer/Orders.jsx) display the updated models.
