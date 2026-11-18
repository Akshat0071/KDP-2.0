# KDP GreenSource — Dimension & Fact Categorized ER Diagram

All tables are strictly categorized into **Dimension Tables** (contextual master reference data) and **Fact Tables** (transactional events and operational measurements), with all identifiers typed as `int`.

---

## 1. Classification & Rationale

| Table Name | Category | Primary Key | Description & Rationale |
| :--- | :--- | :--- | :--- |
| **`Dimension_Table_Site`** | **Dimension** | `Site_ID` (int) | **Where**: Roasting facilities, warehouses, locations, and facility types. |
| **`Dimension_Table_User_Info`** | **Dimension** | `User_ID` (int) | **Who**: System actors, local buyers, warehouse managers, roles, and profiles. |
| **`Dimension_Table_Green_Materials`** | **Dimension** | `Green_Material_ID` (int) | **What**: Master catalog of green coffee bean types, descriptions, and baseline unit prices. |
| **`Dimension_Table_Green_Material_Alternate`** | **Dimension** | `(Green_Material_ID, Alternate_Green_ID)` | **What Alternate**: Reference matrix of pre-approved botanical bean substitutions. |
| **`Dimension_Table_Shipping_Cost`** | **Dimension** | `(Warehouse_ID, Site_ID)` | **Rate Matrix**: Static/standard freight rate lookup between supply warehouses and roasting plants. |
| **`Fact_Table_Orders`** | **Fact** | `Order_Number` (int) | **Transaction Event**: Core fulfillment requisitions & safety replenishment orders, containing volumes, need-by dates, status transitions, and full JSONB audit timeline. |
| **`Fact_Table_Inventory`** | **Fact** | `(Site_ID, Green_Material_ID)` | **Periodic Snapshot Fact**: Current on-hand balances, safety stock thresholds, and stock update dates. |
| **`Fact_Table_Optimization_Table`** | **Fact** | `(Order_Number, Option_ID)` | **Evaluation Fact**: Multi-scenario cost engine results (direct stock, transfer, alternate), landed prices, feasibility flags, and selection logic. |
| **`Fact_Table_Shipment_Details`** | **Fact** | `Shipment_ID` (int) | **Logistics Movement Fact**: Physical transfer shipments, quantities dispatched, delivery dates, freight costs, and delay tracking. |
| **`Fact_Table_Notifications`** | **Fact** | `Notification_ID` (int) | **Alert Event Fact**: Time-stamped alerts triggered by safety stock breaches, delays, and critical status updates. |
| **`Fact_Table_Audit_Logs`** | **Fact** | `Log_ID` (int) | **Compliance Event Fact**: Immutable audit trail recording user actions, target entities, and operation JSON payloads. |

---

## 2. Mermaid ER Diagram Code

```text
erDiagram
    Dimension_Table_Site ||--o{ Dimension_Table_User_Info : "has_users"
    Dimension_Table_Site ||--o{ Fact_Table_Inventory : "has_stock"
    Dimension_Table_Site ||--o{ Fact_Table_Orders : "places_or_receives_orders"
    Dimension_Table_Site ||--o{ Dimension_Table_Shipping_Cost : "origin_warehouse"
    Dimension_Table_Site ||--o{ Dimension_Table_Shipping_Cost : "destination_site"
    Dimension_Table_Site ||--o{ Fact_Table_Shipment_Details : "ships_to_site"
    Dimension_Table_Site ||--o{ Fact_Table_Shipment_Details : "ships_from_warehouse"
    Dimension_Table_Site ||--o{ Fact_Table_Notifications : "site_notifications"

    Dimension_Table_Green_Materials ||--o{ Fact_Table_Inventory : "stocked_in_inventory"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Orders : "requested_green"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Orders : "final_selected_green"
    Dimension_Table_Green_Materials ||--o{ Dimension_Table_Green_Material_Alternate : "base_green"
    Dimension_Table_Green_Materials ||--o{ Dimension_Table_Green_Material_Alternate : "alternate_green"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Shipment_Details : "shipped_material"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Optimization_Table : "optimized_green"

    Fact_Table_Orders ||--o{ Fact_Table_Optimization_Table : "evaluates_sourcing_options"
    Fact_Table_Orders ||--o{ Fact_Table_Shipment_Details : "generates_shipment"

    Dimension_Table_User_Info ||--o{ Fact_Table_Notifications : "receives_alert"
    Dimension_Table_User_Info ||--o{ Fact_Table_Audit_Logs : "performed_action"

    Dimension_Table_Site {
        int Site_ID PK
        varchar Site_Name
        varchar Facility_Type
        varchar Location
    }

    Dimension_Table_User_Info {
        int User_ID PK
        int Site_ID FK
        varchar Email UK
        varchar Password_Hash
        varchar Name
        varchar Role
        timestamptz Created_At
        timestamptz Last_Login
    }

    Dimension_Table_Green_Materials {
        int Green_Material_ID PK
        varchar Green_Material_Description
        decimal Price
    }

    Dimension_Table_Green_Material_Alternate {
        int Green_Material_ID PK,FK
        int Alternate_Green_ID PK,FK
    }

    Dimension_Table_Shipping_Cost {
        int Warehouse_ID PK,FK
        int Site_ID PK,FK
        decimal Cost
    }

    Fact_Table_Inventory {
        int Site_ID PK,FK
        int Green_Material_ID PK,FK
        decimal Quantity_Available
        decimal Minimum_Threshold
        varchar Unit_of_Measurement
        date Updated_Date
    }

    Fact_Table_Orders {
        int Order_Number PK
        int Site_ID FK
        varchar Order_Type
        int FG_Material_ID
        varchar FG_Material_Description
        varchar Brand
        varchar Brand_Type
        int Green_Material_ID FK
        decimal Order_Quantity
        varchar Unit_of_Measurement
        int Final_Green_ID FK
        int Selected_Option_ID
        date Schedule_Start_Date
        date Delivery_Target_Date
        varchar Status
        text Rejection_Reason
        boolean Is_Closed
        jsonb Timeline_History
        timestamptz Created_At
        date Updated_Date
    }

    Fact_Table_Optimization_Table {
        int Option_ID PK
        int Order_Number PK,FK
        int Green_Material_ID FK
        int Site_ID FK
        varchar Source_Type
        int Source_Site_ID FK
        int Selected_Green_ID FK
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
        int Shipment_ID PK
        int Order_Number FK
        int Replenishment_ID
        int Site_ID FK
        int From_Warehouse_ID FK
        int Green_Material_ID FK
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

    Fact_Table_Notifications {
        int Notification_ID PK
        int Site_ID FK
        int User_ID FK
        varchar Severity
        varchar Type
        varchar Title
        text Message
        varchar Action_Label
        varchar Action_URL
        boolean Is_Read
        timestamptz Created_At
    }

    Fact_Table_Audit_Logs {
        int Log_ID PK
        int User_ID FK
        varchar Action_Type
        varchar Target_Entity
        int Target_ID
        jsonb Details
        timestamptz Created_At
    }
```
