# KDP GreenSource — Combined ER Diagram (All IDs as INT)

All Primary Keys, Foreign Keys, Order Numbers, and Identifiers have been unified to `int` (`INTEGER`), ensuring strict relational integrity across tables.

```text
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

    Platform_Table_User_Info ||--o{ Application_Table_Notifications : "receives_alert"
    Platform_Table_User_Info ||--o{ Platform_Table_Audit_Logs : "performed_action"

    Dimension_Table_Site {
        int Site_ID PK
        varchar Site_Name
        varchar Facility_Type
        varchar Location
    }

    Platform_Table_User_Info {
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

    Application_Table_Green_Material_Alternate {
        int Green_Material_ID PK,FK
        int Alternate_Green_ID PK,FK
    }

    Application_Table_Shipping_Cost {
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

    Application_Table_Notifications {
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

    Platform_Table_Audit_Logs {
        int Log_ID PK
        int User_ID FK
        varchar Action_Type
        varchar Target_Entity
        int Target_ID
        jsonb Details
        timestamptz Created_At
    }
```
