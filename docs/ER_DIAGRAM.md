# KDP GreenSource — Multi-Warehouse Quoting & Replenishment ER Diagram

## 1. Architectural Changes & Business Flow

### A. Competitive 3-Warehouse Quoting & Awarding Engine
In the enhanced workflow, whenever an order requires external warehouse supply (either an inter-site transfer recommended by the optimizer or an inventory safety stock replenishment):
1. **RFQ Broadcast:** The Green Buyer initiates an RFQ from Site 1003/1054. The transfer request is broadcast to all **3 Central Warehouses** (e.g., Warehouse 1020, 1030, 1040 / 1055, 1021, 1006).
2. **Warehouse Quotes (`Fact_Table_Warehouse_Quotes`):**
   * Each warehouse manager inspects the request in their inbox.
   * Each warehouse responds with their capability:
     * `Supply_Capability`: `'FULL'` (100% of demand), `'PARTIAL'` (committed kg < demand), or `'CANNOT_SUPPLY'` (declined due to zero uncommitted stock or quarantine).
     * `Quoted_Quantity`, `Quoted_Unit_Price`, `Quoted_Shipping_Cost`, and calculated `Total_Quoted_Cost`.
     * `Estimated_Delivery_Date`: By what exact date they commit to deliver to the roasting plant.
     * `Decline_Reason`: If unable to supply.
3. **Buyer Review & Awarding:**
   * The Green Buyer compares all 3 quotes side-by-side.
   * The buyer approves/awards the most optimal quote (`Quote_Status = 'AWARDED'`).
   * The winning `Quote_ID` is recorded on the order (`Awarded_Quote_ID`).
   * An inbound shipment in `Fact_Table_Shipment_Details` is automatically generated for the awarded quote.
   * Competing non-awarded quotes transition to `'REJECTED'`.

---

### B. Removal of `Projected_Balance` in Inventory
* `Projected_Balance` (and its simulated dynamic forecasting calculations) has been **completely removed** from `Fact_Table_Inventory`.
* `Fact_Table_Inventory` strictly records **physical ground truth on-hand**:
  * `Quantity_Available`: Current uncommitted physical kilograms sitting in the plant bins.
  * `Minimum_Threshold`: Static safety baseline threshold (kg).
* **Threshold Logic:** Replenishment is triggered whenever `Quantity_Available <= Minimum_Threshold`, without relying on volatile multi-period projected balances.

---

## 2. Table Classification (Dimension vs. Fact)

| Table Name | Category | Primary Key | Role in Sourcing & Replenishment Flow |
| :--- | :--- | :--- | :--- |
| **`Dimension_Table_Site`** | **Dimension** | `Site_ID` (int) | Roasting facilities and central distribution warehouses. |
| **`Dimension_Table_User_Info`** | **Dimension** | `User_ID` (int) | Buyers, warehouse managers, plant planners, and system roles. |
| **`Dimension_Table_Green_Materials`** | **Dimension** | `Green_Material_ID` (int) | Green coffee bean catalog and standard base prices. |
| **`Dimension_Table_Green_Material_Alternate`** | **Dimension** | `(Green_Material_ID, Alternate_Green_ID)` | Approved bean substitution bridge table. |
| **`Dimension_Table_Shipping_Cost`** | **Dimension** | `(Warehouse_ID, Site_ID)` | Baseline freight rate lookup matrix between facilities. |
| **`Fact_Table_Inventory`** | **Fact** | `(Site_ID, Green_Material_ID)` | **Pure on-hand physical stock snapshot** & safety threshold baseline. *(Zero projected balance)* |
| **`Fact_Table_Orders`** | **Fact** | `Order_Number` (int) | Requisition transactions (production demands & replenishment orders) with JSONB audit trail and link to `Awarded_Quote_ID`. |
| **`Fact_Table_Optimization_Table`** | **Fact** | `(Order_Number, Option_ID)` | Initial system sourcing recommendation scenarios (Direct Local Stock vs Local Alternate vs Warehouse Transfer). |
| **`Fact_Table_Warehouse_Quotes`** | **Fact** | `Quote_ID` (int) | **Multi-warehouse RFQ responses**: Quotes from the 3 central warehouses (full, partial, decline, prices, delivery dates, and awarding). |
| **`Fact_Table_Shipment_Details`** | **Fact** | `Shipment_ID` (int) | Inbound logistics tracking generated from the winning awarded warehouse quote. |
| **`Fact_Table_Notifications`** | **Fact** | `Notification_ID` (int) | System alerts (threshold breaches, quotes received, transit delays). |
| **`Fact_Table_Audit_Logs`** | **Fact** | `Log_ID` (int) | Compliance audit trail recording user and warehouse actions. |

---

## 3. Mermaid ER Diagram Code

```text
erDiagram
    Dimension_Table_Site ||--o{ Dimension_Table_User_Info : "has_users"
    Dimension_Table_Site ||--o{ Fact_Table_Inventory : "has_stock"
    Dimension_Table_Site ||--o{ Fact_Table_Orders : "places_or_receives_orders"
    Dimension_Table_Site ||--o{ Dimension_Table_Shipping_Cost : "origin_warehouse"
    Dimension_Table_Site ||--o{ Dimension_Table_Shipping_Cost : "destination_site"
    Dimension_Table_Site ||--o{ Fact_Table_Shipment_Details : "ships_to_site"
    Dimension_Table_Site ||--o{ Fact_Table_Shipment_Details : "ships_from_warehouse"
    Dimension_Table_Site ||--o{ Fact_Table_Warehouse_Quotes : "quoted_by_warehouse"
    Dimension_Table_Site ||--o{ Fact_Table_Notifications : "site_notifications"

    Dimension_Table_Green_Materials ||--o{ Fact_Table_Inventory : "stocked_in_inventory"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Orders : "requested_green"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Orders : "final_selected_green"
    Dimension_Table_Green_Materials ||--o{ Dimension_Table_Green_Material_Alternate : "base_green"
    Dimension_Table_Green_Materials ||--o{ Dimension_Table_Green_Material_Alternate : "alternate_green"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Shipment_Details : "shipped_material"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Optimization_Table : "optimized_green"
    Dimension_Table_Green_Materials ||--o{ Fact_Table_Warehouse_Quotes : "quoted_material"

    Fact_Table_Orders ||--o{ Fact_Table_Optimization_Table : "evaluates_sourcing_options"
    Fact_Table_Orders ||--o{ Fact_Table_Warehouse_Quotes : "requests_quotes_from_3_warehouses"
    Fact_Table_Orders ||--o{ Fact_Table_Shipment_Details : "generates_shipment"

    Fact_Table_Warehouse_Quotes ||--o| Fact_Table_Shipment_Details : "awarded_quote_creates_shipment"

    Dimension_Table_User_Info ||--o{ Fact_Table_Warehouse_Quotes : "submitted_by_manager"
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
        int Awarded_Quote_ID FK
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

    Fact_Table_Warehouse_Quotes {
        int Quote_ID PK
        int Order_Number FK
        int Warehouse_ID FK
        int Green_Material_ID FK
        varchar Supply_Capability
        decimal Quoted_Quantity
        decimal Quoted_Unit_Price
        decimal Quoted_Shipping_Cost
        decimal Total_Quoted_Cost
        date Estimated_Delivery_Date
        varchar Quote_Status
        text Decline_Reason
        int Responded_By_User_ID FK
        timestamptz Created_At
    }

    Fact_Table_Shipment_Details {
        int Shipment_ID PK
        int Order_Number FK
        int Quote_ID FK
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
