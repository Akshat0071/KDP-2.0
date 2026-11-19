import fs from 'fs';
import path from 'path';

const WIDTH = 4400;
const HEIGHT = 1850;

// Escape XML helper
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate the SVG content
function generateSvg() {
  const svgParts = [];

  // 1. Root & Defs
  svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Gradients -->
    <linearGradient id="headerGrad" x1="0" y1="0" x2="${WIDTH}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#30272B"/>
      <stop offset="50%" stop-color="#4A263D"/>
      <stop offset="100%" stop-color="#1A1417"/>
    </linearGradient>

    <linearGradient id="dimGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>

    <linearGradient id="factGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#D83F79"/>
      <stop offset="100%" stop-color="#BE185D"/>
    </linearGradient>

    <linearGradient id="engineGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6B46C1"/>
      <stop offset="100%" stop-color="#4C1D95"/>
    </linearGradient>

    <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#FDFBFC"/>
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="shadowSm" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#30272B" flood-opacity="0.06"/>
    </filter>

    <filter id="shadowMd" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#30272B" flood-opacity="0.09"/>
    </filter>

    <filter id="shadowLg" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#30272B" flood-opacity="0.12"/>
    </filter>

    <!-- Arrow Markers -->
    <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
      <path d="M0,2 L8,5 L0,8 Z" fill="#0284C7"/>
    </marker>
    <marker id="arrowRose" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
      <path d="M0,2 L8,5 L0,8 Z" fill="#D83F79"/>
    </marker>
    <marker id="arrowPurple" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
      <path d="M0,2 L8,5 L0,8 Z" fill="#6B46C1"/>
    </marker>
    <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
      <path d="M0,2 L8,5 L0,8 Z" fill="#16A34A"/>
    </marker>
    <marker id="arrowAmber" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto">
      <path d="M0,2 L8,5 L0,8 Z" fill="#D97706"/>
    </marker>
  </defs>

  <!-- Canvas Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#F8F5F7"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#canvasPattern)" opacity="0.4"/>
`);

  // 2. Global Header Banner
  svgParts.push(`
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <!-- TOP PRESENTATION HEADER BANNER -->
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <g id="Header_Banner">
    <rect x="0" y="0" width="${WIDTH}" height="140" fill="url(#headerGrad)"/>
    <line x1="0" y1="140" x2="${WIDTH}" y2="140" stroke="#D83F79" stroke-width="4"/>

    <!-- Left Branding -->
    <rect x="40" y="32" width="76" height="76" rx="14" fill="#D83F79"/>
    <text x="78" y="77" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" text-anchor="middle">KDP</text>

    <text x="135" y="62" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="800" letter-spacing="-0.5">Keurig Dr Pepper — GreenSource Enterprise</text>
    <text x="135" y="92" fill="#E6DCE2" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="500">
      Full Architectural Presentation: 3NF Relational Database Schema ➔ Sourcing Optimization Engine ➔ Frontend UI Component Data Mapping
    </text>

    <!-- Architecture Highlights & Key Badges -->
    <g transform="translate(1420, 48)">
      <!-- Badge 1: 3NF Normalization -->
      <rect x="0" y="0" width="220" height="44" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>
      <circle cx="20" cy="22" r="5" fill="#38BDF8"/>
      <text x="35" y="27" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Strict 3NF Schema</text>
      <text x="35" y="39" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10">Zero Redundancy / Pure Keys</text>

      <!-- Badge 2: Central Inventory DB Access -->
      <rect x="235" y="0" width="250" height="44" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>
      <circle cx="255" cy="22" r="5" fill="#4ADE80"/>
      <text x="270" y="27" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Direct Central DB Visibility</text>
      <text x="270" y="39" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10">Central Stock in Fact_Table_Inventory</text>

      <!-- Badge 3: Automated Optimization -->
      <rect x="500" y="0" width="260" height="44" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>
      <circle cx="520" cy="22" r="5" fill="#C084FC"/>
      <text x="535" y="27" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Automated Optimizer Badges</text>
      <text x="535" y="39" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10">Cost-Optimal &amp; Fastest Lead Times</text>

      <!-- Badge 4: Warehouse One-Click Approval -->
      <rect x="775" y="0" width="230" height="44" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/>
      <circle cx="795" cy="22" r="5" fill="#FB923C"/>
      <text x="810" y="27" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Direct Warehouse Approval</text>
      <text x="810" y="39" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10">No RFQ Broadcast Bidding</text>
    </g>

    <!-- Right Presentation Meta -->
    <g transform="translate(3900, 48)">
      <text x="440" y="26" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="700" text-anchor="end">Production &amp; Replenishment Flow</text>
      <text x="440" y="44" fill="#E6DCE2" font-family="system-ui, sans-serif" font-size="11" text-anchor="end">Architecture Review Board · Version 2.4</text>
    </g>
  </g>
`);

  // 3. Zone Dividers & Swimlane Headers
  svgParts.push(`
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <!-- 3 MAIN ARCHITECTURAL SWIMLANES -->
  <!-- ══════════════════════════════════════════════════════════════════════════ -->

  <!-- ZONE 1: DATABASE RELATIONAL TABLES (Left: 40 to 1180px) -->
  <g id="Zone1_Header">
    <rect x="40" y="160" width="1140" height="48" rx="8" fill="#FFFFFF" stroke="#E6DCE2" filter="url(#shadowSm)"/>
    <rect x="40" y="160" width="6" height="48" rx="3" fill="#0284C7"/>
    <text x="60" y="190" fill="#30272B" font-family="system-ui, sans-serif" font-size="16" font-weight="800">
      ZONE 1: Master Relational Database Schema (PostgreSQL Data Model)
    </text>
    <text x="600" y="190" fill="#71656B" font-family="system-ui, sans-serif" font-size="12" font-weight="500">
      10 Normalized Tables: 5 Dimension Tables + 5 Fact Tables (Central Stock Included)
    </text>
  </g>

  <!-- ZONE 2: OPTIMIZATION ENGINE & DATA PIPELINES (Middle: 1210 to 2260px) -->
  <g id="Zone2_Header">
    <rect x="1210" y="160" width="1050" height="48" rx="8" fill="#FFFFFF" stroke="#E6DCE2" filter="url(#shadowSm)"/>
    <rect x="1210" y="160" width="6" height="48" rx="3" fill="#6B46C1"/>
    <text x="1230" y="190" fill="#30272B" font-family="system-ui, sans-serif" font-size="16" font-weight="800">
      ZONE 2: Transformation, Business Logic &amp; Sourcing Optimization Engine
    </text>
    <text x="1780" y="190" fill="#71656B" font-family="system-ui, sans-serif" font-size="12" font-weight="500">
      Evaluates 5 Scenarios across Central &amp; Local Inventory
    </text>
  </g>

  <!-- ZONE 3: FRONTEND UI COMPONENTS & VIEWS (Right: 2290 to 4360px) -->
  <g id="Zone3_Header">
    <rect x="2290" y="160" width="2070" height="48" rx="8" fill="#FFFFFF" stroke="#E6DCE2" filter="url(#shadowSm)"/>
    <rect x="2290" y="160" width="6" height="48" rx="3" fill="#D83F79"/>
    <text x="2310" y="190" fill="#30272B" font-family="system-ui, sans-serif" font-size="16" font-weight="800">
      ZONE 3: GreenSource Frontend Presentation Layer (UI Cards, Charts, Steppers &amp; Tables)
    </text>
    <text x="3100" y="190" fill="#71656B" font-family="system-ui, sans-serif" font-size="12" font-weight="500">
      Exact visual widgets mapped to underlying joined SQL queries
    </text>
  </g>
`);

  // Helper function to render a Database Table Box
  function renderDbTable({ id, title, type, category, x, y, width, height, columns, color = '#0284C7' }) {
    const isFact = category === 'FACT';
    const headerBg = isFact ? '#BE185D' : '#0369A1';
    const badgeBg = isFact ? '#FCE7F3' : '#E0F2FE';
    const badgeColor = isFact ? '#9D174D' : '#0369A1';

    let colY = y + 54;
    const colsSvg = columns.map(col => {
      const isPk = col.isPk;
      const isFk = col.isFk;
      const keyLabel = isPk && isFk ? 'PK,FK' : isPk ? 'PK' : isFk ? 'FK' : '';
      const keyBadge = keyLabel ? `
        <rect x="${x + width - 52}" y="${colY - 11}" width="44" height="15" rx="3" fill="${isPk ? '#FEF3C7' : '#EFF6FF'}" stroke="${isPk ? '#F59E0B' : '#60A5FA'}"/>
        <text x="${x + width - 30}" y="${colY}" fill="${isPk ? '#92400E' : '#1D4ED8'}" font-family="monospace" font-size="9" font-weight="700" text-anchor="middle">${keyLabel}</text>
      ` : '';

      const line = `
        <text x="${x + 14}" y="${colY}" fill="#64748B" font-family="monospace" font-size="10.5">${esc(col.type)}</text>
        <text x="${x + 95}" y="${colY}" fill="${isPk ? '#0F172A' : '#334155'}" font-family="system-ui, sans-serif" font-size="11" font-weight="${isPk ? '700' : '500'}">${esc(col.name)}</text>
        ${keyBadge}
        <line x1="${x + 10}" y1="${colY + 5}" x2="${x + width - 10}" y2="${colY + 5}" stroke="#F1F5F9" stroke-width="1"/>
      `;
      colY += 20;
      return line;
    }).join('');

    return `
      <!-- Table: ${title} -->
      <g id="${id}" filter="url(#shadowSm)">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
        <!-- Header -->
        <rect x="${x}" y="${y}" width="${width}" height="36" rx="10" fill="${headerBg}"/>
        <rect x="${x}" y="${y + 26}" width="${width}" height="10" fill="${headerBg}"/>
        <text x="${x + 14}" y="${y + 22}" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800">${esc(title)}</text>
        
        <!-- Category Badge -->
        <rect x="${x + width - 68}" y="${y + 8}" width="56" height="20" rx="4" fill="${badgeBg}"/>
        <text x="${x + width - 40}" y="${y + 22}" fill="${badgeColor}" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">${esc(category)}</text>

        <!-- Columns -->
        ${colsSvg}
      </g>
    `;
  }

  // 4. ZONE 1 TABLES: 5 Dimension Tables + 5 Fact Tables
  // Dimension tables column (Left sub-col: x = 60, width = 510)
  svgParts.push(`
  <!-- ────────────────────────────────────────────────────────────────────────── -->
  <!-- ZONE 1: 5 DIMENSION TABLES (BLUE CATEGORY) -->
  <!-- ────────────────────────────────────────────────────────────────────────── -->
  `);

  // Table 1: Dimension_Table_Site
  svgParts.push(renderDbTable({
    id: 'Table_Dimension_Site',
    title: 'Dimension_Table_Site',
    category: 'DIMENSION',
    x: 60,
    y: 230,
    width: 510,
    height: 140,
    columns: [
      { name: 'Site_ID', type: 'int', isPk: true },
      { name: 'Site_Name', type: 'varchar(100)' },
      { name: 'Facility_Type', type: 'varchar(50)' }, // 'ROASTING_PLANT' | 'CENTRAL_WAREHOUSE'
      { name: 'Location', type: 'varchar(150)' },
    ],
  }));

  // Table 2: Dimension_Table_User_Info
  svgParts.push(renderDbTable({
    id: 'Table_Dimension_User',
    title: 'Dimension_Table_User_Info',
    category: 'DIMENSION',
    x: 60,
    y: 390,
    width: 510,
    height: 180,
    columns: [
      { name: 'User_ID', type: 'int', isPk: true },
      { name: 'Site_ID', type: 'int', isFk: true },
      { name: 'Email', type: 'varchar(150)' },
      { name: 'Name', type: 'varchar(100)' },
      { name: 'Role', type: 'varchar(50)' }, // 'BUYER' | 'WAREHOUSE_MANAGER'
      { name: 'Created_At', type: 'timestamptz' },
    ],
  }));

  // Table 3: Dimension_Table_Green_Materials
  svgParts.push(renderDbTable({
    id: 'Table_Dimension_Green_Materials',
    title: 'Dimension_Table_Green_Materials',
    category: 'DIMENSION',
    x: 60,
    y: 590,
    width: 510,
    height: 140,
    columns: [
      { name: 'Green_Material_ID', type: 'int', isPk: true },
      { name: 'Green_Material_Description', type: 'varchar(150)' },
      { name: 'Price', type: 'decimal(10,2)' },
    ],
  }));

  // Table 4: Dimension_Table_Green_Material_Alternate
  svgParts.push(renderDbTable({
    id: 'Table_Dimension_Green_Material_Alternate',
    title: 'Dimension_Table_Green_Material_Alternate',
    category: 'DIMENSION',
    x: 60,
    y: 750,
    width: 510,
    height: 130,
    columns: [
      { name: 'Green_Material_ID', type: 'int', isPk: true, isFk: true },
      { name: 'Alternate_Green_ID', type: 'int', isPk: true, isFk: true },
    ],
  }));

  // Table 5: Dimension_Table_Shipping_Cost (With Lead_Time_Days!)
  svgParts.push(renderDbTable({
    id: 'Table_Dimension_Shipping_Cost',
    title: 'Dimension_Table_Shipping_Cost',
    category: 'DIMENSION',
    x: 60,
    y: 900,
    width: 510,
    height: 165,
    columns: [
      { name: 'Warehouse_ID', type: 'int', isPk: true, isFk: true },
      { name: 'Site_ID', type: 'int', isPk: true, isFk: true },
      { name: 'Cost', type: 'decimal(10,2)' },
      { name: 'Lead_Time_Days', type: 'int' }, // 2 days WH 1055, 4 days WH 1020, 6 days WH 1021
    ],
  }));

  // Table 6: Fact_Table_Notifications (Moved to left col lower)
  svgParts.push(renderDbTable({
    id: 'Table_Fact_Notifications',
    title: 'Fact_Table_Notifications',
    category: 'FACT',
    x: 60,
    y: 1085,
    width: 510,
    height: 220,
    columns: [
      { name: 'Notification_ID', type: 'int', isPk: true },
      { name: 'Site_ID', type: 'int', isFk: true },
      { name: 'User_ID', type: 'int', isFk: true },
      { name: 'Severity', type: 'varchar(20)' }, // 'CRITICAL' | 'WARN' | 'INFO'
      { name: 'Type', type: 'varchar(50)' }, // 'LOW_STOCK' | 'DISPATCHED' | 'DELIVERY'
      { name: 'Title', type: 'varchar(150)' },
      { name: 'Message', type: 'text' },
      { name: 'Action_Label', type: 'varchar(100)' },
      { name: 'Action_URL', type: 'varchar(255)' },
    ],
  }));

  // Table 7: Fact_Table_Audit_Logs
  svgParts.push(renderDbTable({
    id: 'Table_Fact_Audit_Logs',
    title: 'Fact_Table_Audit_Logs',
    category: 'FACT',
    x: 60,
    y: 1325,
    width: 510,
    height: 190,
    columns: [
      { name: 'Log_ID', type: 'int', isPk: true },
      { name: 'User_ID', type: 'int', isFk: true },
      { name: 'Action_Type', type: 'varchar(100)' }, // 'APPROVE' | 'DISPATCH' | 'RECEIVE'
      { name: 'Target_Entity', type: 'varchar(100)' }, // 'ORDER' | 'INVENTORY' | 'SHIPMENT'
      { name: 'Target_ID', type: 'int' },
      { name: 'Details', type: 'jsonb' },
      { name: 'Created_At', type: 'timestamptz' },
    ],
  }));

  // Fact tables column (Right sub-col: x = 600, width = 550)
  svgParts.push(`
  <!-- ────────────────────────────────────────────────────────────────────────── -->
  <!-- ZONE 1: CORE FACT TABLES (ROSE / INDIGO CATEGORY) -->
  <!-- ────────────────────────────────────────────────────────────────────────── -->
  `);

  // Table 8: Fact_Table_Inventory (Now stores BOTH Roasting Sites + Central Warehouses!)
  svgParts.push(renderDbTable({
    id: 'Table_Fact_Inventory',
    title: 'Fact_Table_Inventory (All Facilities Stock)',
    category: 'FACT',
    x: 600,
    y: 230,
    width: 550,
    height: 200,
    columns: [
      { name: 'Site_ID', type: 'int', isPk: true, isFk: true },
      { name: 'Green_Material_ID', type: 'int', isPk: true, isFk: true },
      { name: 'Quantity_Available', type: 'decimal(12,2)' }, // Pure Physical Ground Truth
      { name: 'Minimum_Threshold', type: 'decimal(12,2)' }, // Baseline Safety Cap
      { name: 'Unit_of_Measurement', type: 'varchar(20)' }, // 'kg'
      { name: 'Updated_Date', type: 'date' },
    ],
  }));

  // Table 9: Fact_Table_Orders (Clean 3NF with Selected_Option_ID FK)
  svgParts.push(renderDbTable({
    id: 'Table_Fact_Orders',
    title: 'Fact_Table_Orders (Production & Replenishments)',
    category: 'FACT',
    x: 600,
    y: 450,
    width: 550,
    height: 310,
    columns: [
      { name: 'Order_Number', type: 'int', isPk: true },
      { name: 'Site_ID', type: 'int', isFk: true },
      { name: 'Order_Type', type: 'varchar(50)' }, // 'PRODUCTION' (1000-2999) | 'REPLENISHMENT' (3000-4999)
      { name: 'FG_Material_ID', type: 'int' },
      { name: 'FG_Material_Description', type: 'varchar(150)' },
      { name: 'Brand', type: 'varchar(100)' },
      { name: 'Green_Material_ID', type: 'int', isFk: true },
      { name: 'Order_Quantity', type: 'decimal(12,2)' },
      { name: 'Selected_Option_ID', type: 'int', isFk: true }, // Links to Fact_Table_Optimization_Table
      { name: 'Schedule_Start_Date', type: 'date' },
      { name: 'Delivery_Target_Date', type: 'date' },
      { name: 'Status', type: 'varchar(50)' }, // 9 canonical statuses
      { name: 'Timeline_History', type: 'jsonb' },
      { name: 'Created_At', type: 'timestamptz' },
    ],
  }));

  // Table 10: Fact_Table_Optimization_Table (Stores ALL candidate options evaluated!)
  svgParts.push(renderDbTable({
    id: 'Table_Fact_Optimization',
    title: 'Fact_Table_Optimization_Table (Persisted Options)',
    category: 'FACT',
    x: 600,
    y: 780,
    width: 550,
    height: 330,
    columns: [
      { name: 'Option_ID', type: 'int', isPk: true },
      { name: 'Order_Number', type: 'int', isPk: true, isFk: true },
      { name: 'Green_Material_ID', type: 'int', isFk: true },
      { name: 'Source_Site_ID', type: 'int', isFk: true }, // 1054 Local or 1055/1020 Central
      { name: 'Selected_Green_ID', type: 'int', isFk: true }, // Exact bean or approved alternate
      { name: 'Allocated_Quantity', type: 'decimal(12,2)' },
      { name: 'Green_Unit_Price', type: 'decimal(10,2)' },
      { name: 'Shipping_Cost', type: 'decimal(10,2)' }, // Freight cost
      { name: 'Total_Cost', type: 'decimal(12,2)' }, // Landed delivered cost
      { name: 'Lead_Time_Days', type: 'int' }, // Transit days (0 for local, 2 for WH 1055)
      { name: 'Is_Feasible', type: 'boolean' }, // Sufficient uncommitted stock?
      { name: 'Is_Selected', type: 'boolean' }, // Approved by Buyer
      { name: 'Procurement_Required', type: 'boolean' }, // True if Central Warehouse transfer
    ],
  }));

  // Table 11: Fact_Table_Shipment_Details
  svgParts.push(renderDbTable({
    id: 'Table_Fact_Shipment_Details',
    title: 'Fact_Table_Shipment_Details (Logistics Freight)',
    category: 'FACT',
    x: 600,
    y: 1130,
    width: 550,
    height: 290,
    columns: [
      { name: 'Shipment_ID', type: 'int', isPk: true },
      { name: 'Order_Number', type: 'int', isFk: true },
      { name: 'From_Site_ID', type: 'int', isFk: true }, // Warehouse
      { name: 'To_Site_ID', type: 'int', isFk: true }, // Roasting Dock
      { name: 'Green_Material_ID', type: 'int', isFk: true },
      { name: 'Shipment_Quantity', type: 'decimal(12,2)' },
      { name: 'Shipped_Date', type: 'date' },
      { name: 'Estimated_Arrival_Date', type: 'date' },
      { name: 'Delivery_Date', type: 'date' },
      { name: 'Shipping_Cost', type: 'decimal(10,2)' },
      { name: 'Shipment_Status', type: 'varchar(50)' }, // 'STAGED' | 'IN_TRANSIT' | 'DELIVERED'
      { name: 'Carrier_Name', type: 'varchar(100)' },
      { name: 'Tracking_Number', type: 'varchar(100)' },
    ],
  }));

  // 5. ZONE 2: TRANSFORMATION & OPTIMIZATION ENGINE PIPELINE (Middle Swimlane: x = 1210 to 2260)
  svgParts.push(`
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <!-- ZONE 2: ENGINE CARDS & DATA TRANSFORMATIONS -->
  <!-- ══════════════════════════════════════════════════════════════════════════ -->

  <!-- ENGINE CARD 1: P0 OPTIMIZATION ENGINE -->
  <g id="Engine_Optimization_Core" filter="url(#shadowMd)">
    <rect x="1230" y="230" width="1010" height="420" rx="14" fill="#FFFFFF" stroke="#E9D8FD" stroke-width="2"/>
    <rect x="1230" y="230" width="1010" height="46" rx="14" fill="url(#engineGrad)"/>
    <rect x="1230" y="260" width="1010" height="16" fill="url(#engineGrad)"/>

    <text x="1255" y="260" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="16" font-weight="800">
      ⚡ P0 SOURCING OPTIMIZATION ENGINE (Direct Central DB Stock Evaluation)
    </text>
    <text x="2100" y="260" fill="#E9D8FD" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="end">
      Autonomous Evaluation · Zero Manual Bidding
    </text>

    <!-- Sub-boxes showing the 5 Scenarios Evaluated -->
    <g transform="translate(1255, 295)">
      <!-- Input Data Feeds Banner -->
      <rect x="0" y="0" width="960" height="40" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="15" y="25" fill="#475569" font-family="system-ui, sans-serif" font-size="12" font-weight="700">
        Data Inputs: Fact_Table_Inventory (Sites 1054, 1055, 1020, 1021) ⨝ Dimension_Table_Shipping_Cost (Freight &amp; Lead Time Days)
      </text>

      <!-- Scenario 1 Box -->
      <rect x="0" y="55" width="465" height="66" rx="8" fill="#F0FDF4" stroke="#86EFAC"/>
      <text x="15" y="78" fill="#166534" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Scenario 1: Local Site · Same Green</text>
      <text x="15" y="96" fill="#15803D" font-family="system-ui, sans-serif" font-size="11">Site 1054 on-hand stock · $0 freight · 0 days lead time</text>
      <rect x="360" y="68" width="90" height="20" rx="4" fill="#DCFCE7"/>
      <text x="405" y="82" fill="#166534" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">LEAST COST</text>

      <!-- Scenario 2 Box -->
      <rect x="495" y="55" width="465" height="66" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="510" y="78" fill="#334155" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Scenario 2: Local Site · Alternate Green</text>
      <text x="510" y="96" fill="#64748B" font-family="system-ui, sans-serif" font-size="11">Substitute from Dimension_Table_Green_Material_Alternate ($0 freight)</text>

      <!-- Scenario 3 Box (Optimal Hub!) -->
      <rect x="0" y="132" width="465" height="90" rx="8" fill="#FAF5FF" stroke="#C084FC" stroke-width="1.5"/>
      <text x="15" y="155" fill="#581C87" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Scenario 3: Central Warehouse · Same Green</text>
      <text x="15" y="174" fill="#6B21A8" font-family="system-ui, sans-serif" font-size="11">Direct check of Hub 1055 (5,200 kg) · Contract freight $589 · 2-day lead time</text>
      <text x="15" y="195" fill="#7E22CE" font-family="monospace" font-size="10.5">Calculates: MIN(Total_Cost) ➔ Tags [COST-OPTIMAL]</text>
      <rect x="340" y="145" width="110" height="22" rx="4" fill="#E9D8FD"/>
      <text x="395" y="160" fill="#6B21A8" font-family="system-ui, sans-serif" font-size="10" font-weight="800" text-anchor="middle">COST-OPTIMAL</text>

      <!-- Scenario 4 Box -->
      <rect x="495" y="132" width="465" height="90" rx="8" fill="#FAF5FF" stroke="#E9D8FD"/>
      <text x="510" y="155" fill="#3B0764" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Scenario 4: Central Warehouse · Alternate Green</text>
      <text x="510" y="174" fill="#6B21A8" font-family="system-ui, sans-serif" font-size="11">Evaluates alternative bean availability across regional central hubs</text>
      <text x="510" y="195" fill="#7E22CE" font-family="monospace" font-size="10.5">Calculates: MIN(Lead_Time_Days) ➔ Tags [FASTEST]</text>
      <rect x="850" y="145" width="95" height="22" rx="4" fill="#FEF3C7"/>
      <text x="897" y="160" fill="#B45309" font-family="system-ui, sans-serif" font-size="10" font-weight="800" text-anchor="middle">FASTEST (2d)</text>

      <!-- Scenario 5 Box: Split Order -->
      <rect x="0" y="232" width="960" height="52" rx="8" fill="#FFFBEB" stroke="#FDE68A"/>
      <text x="15" y="254" fill="#92400E" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Scenario 5: Split Fulfillment (Local Immediate Partial + Warehouse Remaining Balance)</text>
      <text x="15" y="272" fill="#B45309" font-family="system-ui, sans-serif" font-size="11">Allocates on-site bins immediately ($0 freight) + transfers remaining balance from Hub 1055 to prevent plant stoppage</text>

      <!-- Output Banner: Persisting Options -->
      <rect x="0" y="295" width="960" height="42" rx="8" fill="#EFF6FF" stroke="#93C5FD"/>
      <text x="15" y="320" fill="#1E40AF" font-family="monospace" font-size="11" font-weight="700">
        OUTPUT: Inserts rows into Fact_Table_Optimization_Table ➔ Buyer selects Option_ID ➔ Updates Orders.Selected_Option_ID
      </text>
    </g>
  </g>

  <!-- ENGINE CARD 2: SAFETY THRESHOLD & STOCKOUT LOGIC -->
  <g id="Engine_Stock_Health" filter="url(#shadowMd)">
    <rect x="1230" y="675" width="1010" height="210" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="1230" y="675" width="1010" height="40" rx="14" fill="#BE123C"/>
    <rect x="1230" y="700" width="1010" height="15" fill="#BE123C"/>
    <text x="1255" y="701" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="15" font-weight="800">
      🚨 INVENTORY THRESHOLD BREACH &amp; SHORTAGE EVALUATOR (No Projected Balance)
    </text>

    <g transform="translate(1255, 730)">
      <rect x="0" y="0" width="960" height="60" rx="8" fill="#FFF1F2" stroke="#FECDD3"/>
      <text x="15" y="25" fill="#9F1239" font-family="system-ui, sans-serif" font-size="12" font-weight="700">
        Pure Physical Stock Logic: Fact_Table_Inventory.Quantity_Available &lt;= Fact_Table_Inventory.Minimum_Threshold
      </text>
      <text x="15" y="45" fill="#BE123C" font-family="system-ui, sans-serif" font-size="11">
        • If Quantity &lt;= 50% Threshold ➔ CRITICAL SHORTAGE ➔ Inserts Fact_Table_Notifications alert + feeds "Immediate Actions Needed"
      </text>
      <text x="15" y="62" fill="#BE123C" font-family="system-ui, sans-serif" font-size="11">
        • If 50% &lt; Quantity &lt;= 100% ➔ TIGHT BUFFER ➔ Generates Safety Replenishment Requisition (Order_Type = 'REPLENISHMENT')
      </text>

      <rect x="0" y="75" width="960" height="60" rx="8" fill="#F0FDF4" stroke="#BBF7D0"/>
      <text x="15" y="98" fill="#166534" font-family="system-ui, sans-serif" font-size="12" font-weight="700">
        Automated Restock Order Placement:
      </text>
      <text x="15" y="118" fill="#15803D" font-family="system-ui, sans-serif" font-size="11">
        Generates Order_Number (3000 series) ➔ Runs Optimizer ➔ Routes directly to Warehouse Manager for instant allocation
      </text>
    </g>
  </g>

  <!-- ENGINE CARD 3: LOGISTICS DISPATCH & STEPPER PIPELINE -->
  <g id="Engine_Logistics_Pipeline" filter="url(#shadowMd)">
    <rect x="1230" y="910" width="1010" height="250" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="1230" y="910" width="1010" height="40" rx="14" fill="#0369A1"/>
    <rect x="1230" y="935" width="1010" height="15" fill="#0369A1"/>
    <text x="1255" y="936" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="15" font-weight="800">
      🚚 WAREHOUSE APPROVAL, DISPATCH &amp; 9-STAGE ORDER LIFECYCLE
    </text>

    <g transform="translate(1255, 965)">
      <!-- 9 Lifecycle Pills -->
      <g transform="translate(0, 10)">
        <!-- Step 1: new -->
        <rect x="0" y="0" width="90" height="32" rx="6" fill="#FAF5FF" stroke="#D8B4FE"/>
        <text x="45" y="20" fill="#6B21A8" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">1. new</text>

        <text x="96" y="20" fill="#94A3B8">→</text>

        <!-- Step 2: requested -->
        <rect x="110" y="0" width="95" height="32" rx="6" fill="#EFF6FF" stroke="#93C5FD"/>
        <text x="157" y="20" fill="#1D4ED8" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">2. requested</text>

        <text x="211" y="20" fill="#94A3B8">→</text>

        <!-- Step 3: accepted -->
        <rect x="225" y="0" width="95" height="32" rx="6" fill="#F0FDF4" stroke="#86EFAC"/>
        <text x="272" y="20" fill="#15803D" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">3. accepted</text>

        <text x="326" y="20" fill="#94A3B8">→</text>

        <!-- Step 4: dispatched -->
        <rect x="340" y="0" width="105" height="32" rx="6" fill="#FFFBEB" stroke="#FDE68A"/>
        <text x="392" y="20" fill="#B45309" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">4. dispatched</text>

        <text x="451" y="20" fill="#94A3B8">→</text>

        <!-- Step 5: in transit -->
        <rect x="465" y="0" width="105" height="32" rx="6" fill="#FAF5FF" stroke="#C084FC"/>
        <text x="517" y="20" fill="#7E22CE" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">5. in transit</text>

        <text x="576" y="20" fill="#94A3B8">→</text>

        <!-- Step 6: delivered -->
        <rect x="590" y="0" width="100" height="32" rx="6" fill="#FDF2F8" stroke="#F472B6"/>
        <text x="640" y="20" fill="#BE185D" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">6. delivered</text>

        <text x="696" y="20" fill="#94A3B8">→</text>

        <!-- Step 7: received -->
        <rect x="710" y="0" width="95" height="32" rx="6" fill="#ECFDF5" stroke="#6EE7B7"/>
        <text x="757" y="20" fill="#047857" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">7. received</text>

        <text x="811" y="20" fill="#94A3B8">→</text>

        <!-- Step 8: closed -->
        <rect x="825" y="0" width="120" height="32" rx="6" fill="#F1F5F9" stroke="#94A3B8"/>
        <text x="885" y="20" fill="#334155" font-family="system-ui, sans-serif" font-size="10.5" font-weight="800" text-anchor="middle">8. closed</text>
      </g>

      <!-- Explanation -->
      <g transform="translate(0, 60)">
        <rect x="0" y="0" width="960" height="110" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="15" y="24" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          • Warehouse Manager Action: Only clicks "Approve &amp; Allocate" (no quotes/bids) ➔ Staging Bay Assigned
        </text>
        <text x="15" y="46" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          • On Dispatch: Fact_Table_Shipment_Details record generated with assigned Carrier &amp; Tracking_Number
        </text>
        <text x="15" y="68" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          • Carrier Arrival: Status transitions to 'delivered' ➔ Local Dock Buyer inspects and marks 'received'
        </text>
        <text x="15" y="90" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          • On Close: Fact_Table_Inventory automatically credited with new beans, updating plant on-hand stock
        </text>
      </g>
    </g>
  </g>

  <!-- ENGINE CARD 4: AUDIT LOGGING & COMPLIANCE JOIN -->
  <g id="Engine_Audit_Pipeline" filter="url(#shadowMd)">
    <rect x="1230" y="1185" width="1010" height="180" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="1230" y="1185" width="1010" height="38" rx="14" fill="#334155"/>
    <rect x="1230" y="1208" width="1010" height="15" fill="#334155"/>
    <text x="1255" y="1210" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="15" font-weight="800">
      🛡️ IMMUTABLE AUDIT LOGGING &amp; COMPLIANCE PIPELINE
    </text>

    <g transform="translate(1255, 1238)">
      <text x="0" y="20" fill="#1E293B" font-family="system-ui, sans-serif" font-size="12" font-weight="700">
        Polymorphic Activity Streaming: (Target_Entity, Target_ID) Pattern
      </text>
      <text x="0" y="40" fill="#475569" font-family="system-ui, sans-serif" font-size="11">
        Whenever a Buyer approves an option, a Manager dispatches stock, or QA inspects beans, an immutable row is appended to Fact_Table_Audit_Logs.
      </text>
      <rect x="0" y="55" width="960" height="56" rx="6" fill="#F1F5F9"/>
      <text x="15" y="78" fill="#0F172A" font-family="monospace" font-size="11">
        SELECT a.Log_ID, u.Name, a.Action_Type, a.Target_Entity, a.Target_ID, a.Details, a.Created_At
      </text>
      <text x="15" y="96" fill="#0F172A" font-family="monospace" font-size="11">
        FROM Fact_Table_Audit_Logs a JOIN Dimension_Table_User_Info u ON a.User_ID = u.User_ID ORDER BY a.Created_At DESC
      </text>
    </g>
  </g>
`);

  // 6. ZONE 3: FRONTEND UI COMPONENTS & EXACT CARD REPRESENTATIONS (Right Swimlane: x = 2290 to 4360)
  svgParts.push(`
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <!-- ZONE 3: FRONTEND UI PRESENTATION COMPONENTS -->
  <!-- ══════════════════════════════════════════════════════════════════════════ -->

  <!-- UI COMPONENT 1: DASHBOARD KPI DECK & GAUGES (Top Left: x = 2310, y = 230) -->
  <g id="UI_Dashboard_KPIs" filter="url(#shadowMd)">
    <rect x="2310" y="230" width="650" height="340" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="2310" y="230" width="650" height="42" rx="14" fill="#30272B"/>
    <rect x="2310" y="256" width="650" height="16" fill="#30272B"/>
    <text x="2330" y="258" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="800">
      📊 DASHBOARD OVERVIEW &amp; KPI SUMMARY DECK
    </text>
    <rect x="2840" y="238" width="110" height="24" rx="4" fill="rgba(255,255,255,0.15)"/>
    <text x="2895" y="254" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">UI COMPONENT</text>

    <!-- 4 KPI Cards -->
    <g transform="translate(2330, 290)">
      <!-- KPI 1 -->
      <rect x="0" y="0" width="140" height="90" rx="8" fill="#FAF5FF" stroke="#E9D8FD"/>
      <text x="12" y="24" fill="#6B21A8" font-family="system-ui, sans-serif" font-size="10" font-weight="700">TOTAL ON-HAND</text>
      <text x="12" y="52" fill="#581C87" font-family="system-ui, sans-serif" font-size="20" font-weight="800">3,700 kg</text>
      <text x="12" y="74" fill="#7E22CE" font-family="system-ui, sans-serif" font-size="9.5">Across 5 Silo Lots</text>

      <!-- KPI 2 -->
      <rect x="155" y="0" width="140" height="90" rx="8" fill="#EFF6FF" stroke="#BFDBFE"/>
      <text x="167" y="24" fill="#1D4ED8" font-family="system-ui, sans-serif" font-size="10" font-weight="700">OPEN DEMAND</text>
      <text x="167" y="52" fill="#1E40AF" font-family="system-ui, sans-serif" font-size="20" font-weight="800">4,700 kg</text>
      <text x="167" y="74" fill="#2563EB" font-family="system-ui, sans-serif" font-size="9.5">Production Schedule</text>

      <!-- KPI 3 -->
      <rect x="310" y="0" width="140" height="90" rx="8" fill="#FFFBEB" stroke="#FDE68A"/>
      <text x="322" y="24" fill="#B45309" font-family="system-ui, sans-serif" font-size="10" font-weight="700">IN TRANSIT</text>
      <text x="322" y="52" fill="#92400E" font-family="system-ui, sans-serif" font-size="20" font-weight="800">1,800 kg</text>
      <text x="322" y="74" fill="#D97706" font-family="system-ui, sans-serif" font-size="9.5">3 Active Shipments</text>

      <!-- KPI 4 -->
      <rect x="465" y="0" width="145" height="90" rx="8" fill="#FFF1F2" stroke="#FECDD3"/>
      <text x="477" y="24" fill="#BE123C" font-family="system-ui, sans-serif" font-size="10" font-weight="700">SHORTAGE RISKS</text>
      <text x="477" y="52" fill="#9F1239" font-family="system-ui, sans-serif" font-size="20" font-weight="800">2 Items</text>
      <text x="477" y="74" fill="#E11D48" font-family="system-ui, sans-serif" font-size="9.5">Gc-04 &amp; Gc-11</text>
    </g>

    <!-- Source Tables Mapping Box -->
    <g transform="translate(2330, 395)">
      <rect x="0" y="0" width="610" height="155" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="22" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11" font-weight="800">
        DATABASE TABLES JOINED FOR DASHBOARD DECK:
      </text>
      <text x="14" y="42" fill="#334155" font-family="monospace" font-size="10">
        1. Fact_Table_Inventory (SUM Quantity_Available WHERE Site_ID = 1054)
      </text>
      <text x="14" y="60" fill="#334155" font-family="monospace" font-size="10">
        2. Fact_Table_Orders (SUM Order_Quantity WHERE Status NOT IN ('closed', 'received'))
      </text>
      <text x="14" y="78" fill="#334155" font-family="monospace" font-size="10">
        3. Fact_Table_Shipment_Details (SUM Shipment_Quantity WHERE Shipment_Status = 'IN_TRANSIT')
      </text>
      <text x="14" y="96" fill="#334155" font-family="monospace" font-size="10">
        4. Dimension_Table_Green_Materials (JOIN to display Material Name &amp; Unit Price)
      </text>
      <rect x="14" y="112" width="580" height="30" rx="4" fill="#EDF7F1"/>
      <text x="24" y="132" fill="#166534" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">
        ✓ Real-Time Sync: Updating inventory immediately reflects across all KPI cards.
      </text>
    </g>
  </g>

  <!-- UI COMPONENT 2: IMMEDIATE ACTIONS NEEDED CARD (Top Center: x = 2990, y = 230) -->
  <g id="UI_Immediate_Actions" filter="url(#shadowMd)">
    <rect x="2990" y="230" width="670" height="340" rx="14" fill="#FFFFFF" stroke="#FECDD3" stroke-width="2"/>
    <rect x="2990" y="230" width="670" height="42" rx="14" fill="#BE123C"/>
    <rect x="2990" y="256" width="670" height="16" fill="#BE123C"/>
    <text x="3010" y="258" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="800">
      ⚠️ IMMEDIATE ACTIONS NEEDED (Critical Buyer Action Queue)
    </text>
    <rect x="3530" y="238" width="115" height="24" rx="4" fill="rgba(255,255,255,0.2)"/>
    <text x="3587" y="254" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">PRIORITY QUEUE</text>

    <!-- Action Items -->
    <g transform="translate(3010, 285)">
      <!-- Action 1: Stockout Alert -->
      <rect x="0" y="0" width="630" height="66" rx="8" fill="#FFF1F2" stroke="#F43F5E"/>
      <circle cx="20" cy="33" r="10" fill="#E11D48"/>
      <text x="20" y="37" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="11" font-weight="900" text-anchor="middle">!</text>
      <text x="40" y="26" fill="#9F1239" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Critical Stockout Shortage: Gc-04 (Colombia Supremo)</text>
      <text x="40" y="44" fill="#BE123C" font-family="system-ui, sans-serif" font-size="11">Available: 800 kg &lt; Min Threshold: 1,200 kg · Open Demand: 2,000 kg</text>
      <rect x="520" y="16" width="95" height="32" rx="6" fill="#E11D48"/>
      <text x="567" y="36" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Order Restock ➔</text>

      <!-- Action 2: Unassigned Order -->
      <rect x="0" y="78" width="630" height="66" rx="8" fill="#FFFBEB" stroke="#F59E0B"/>
      <circle cx="20" cy="111" r="10" fill="#D97706"/>
      <text x="20" y="115" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="11" font-weight="900" text-anchor="middle">?</text>
      <text x="40" y="104" fill="#92400E" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Unapproved Demand Order: #2846 (1,200 kg Colombia Supremo)</text>
      <text x="40" y="122" fill="#B45309" font-family="system-ui, sans-serif" font-size="11">Need by Oct 28 · Optimizer evaluated Hub 1055 as Cost-Optimal</text>
      <rect x="510" y="94" width="105" height="32" rx="6" fill="#D97706"/>
      <text x="562" y="114" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">Review Options ➔</text>
    </g>

    <!-- Source Tables Joined -->
    <g transform="translate(3010, 440)">
      <rect x="0" y="0" width="630" height="110" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="22" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11" font-weight="800">
        TABLES JOINED TO POWER THIS COMPONENT:
      </text>
      <text x="14" y="42" fill="#334155" font-family="monospace" font-size="10">
        • Fact_Table_Inventory ⨝ Dimension_Table_Green_Materials (WHERE Quantity_Available &lt;= Minimum_Threshold)
      </text>
      <text x="14" y="60" fill="#334155" font-family="monospace" font-size="10">
        • Fact_Table_Orders ⨝ Fact_Table_Optimization_Table (WHERE Orders.Status = 'new')
      </text>
      <text x="14" y="78" fill="#334155" font-family="monospace" font-size="10">
        • Fact_Table_Notifications (Alert severity, action labels, deep-link router URLs)
      </text>
    </g>
  </g>

  <!-- UI COMPONENT 3: RECENT ACTIONS & AUDIT STREAM (Top Right: x = 3690, y = 230) -->
  <g id="UI_Recent_Actions" filter="url(#shadowMd)">
    <rect x="3690" y="230" width="670" height="340" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="3690" y="230" width="670" height="42" rx="14" fill="#475569"/>
    <rect x="3690" y="256" width="670" height="16" fill="#475569"/>
    <text x="3710" y="258" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="800">
      🕒 RECENT ACTIONS &amp; COMPLIANCE AUDIT STREAM
    </text>
    <rect x="4240" y="238" width="105" height="24" rx="4" fill="rgba(255,255,255,0.2)"/>
    <text x="4292" y="254" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">LIVE FEED</text>

    <!-- Activity Stream -->
    <g transform="translate(3710, 285)">
      <rect x="0" y="0" width="630" height="42" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
      <circle cx="16" cy="21" r="5" fill="#16A34A"/>
      <text x="32" y="25" fill="#1E293B" font-family="system-ui, sans-serif" font-size="11" font-weight="700">
        Maya Torres (Local Buyer) approved WH 1055 transfer for Order #2843 (1,200 kg)
      </text>
      <text x="615" y="25" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">12m ago</text>

      <rect x="0" y="48" width="630" height="42" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
      <circle cx="16" cy="69" r="5" fill="#0284C7"/>
      <text x="32" y="73" fill="#1E293B" font-family="system-ui, sans-serif" font-size="11" font-weight="700">
        Warehouse 1020 staged Shipment SH-7828 at Outbound Bay 3
      </text>
      <text x="615" y="73" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">45m ago</text>

      <rect x="0" y="96" width="630" height="42" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
      <circle cx="16" cy="117" r="5" fill="#6B46C1"/>
      <text x="32" y="121" fill="#1E293B" font-family="system-ui, sans-serif" font-size="11" font-weight="700">
        Site 1054 receiving dock checked in 1,200 kg Gc-04 · Closed Order #2842
      </text>
      <text x="615" y="121" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="10" text-anchor="end">2h ago</text>
    </g>

    <!-- Source Tables Joined -->
    <g transform="translate(3710, 440)">
      <rect x="0" y="0" width="630" height="110" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="22" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11" font-weight="800">
        TABLES JOINED TO POWER THIS COMPONENT:
      </text>
      <text x="14" y="42" fill="#334155" font-family="monospace" font-size="10">
        • Fact_Table_Audit_Logs (Target_Entity = 'ORDER', Action_Type, Details JSONB)
      </text>
      <text x="14" y="60" fill="#334155" font-family="monospace" font-size="10">
        • Dimension_Table_User_Info (User_ID ➔ Buyer / Warehouse Manager Name &amp; Role)
      </text>
      <text x="14" y="78" fill="#334155" font-family="monospace" font-size="10">
        • Fact_Table_Orders.Timeline_History (Chronological audit history JSONB)
      </text>
    </g>
  </g>

  <!-- UI COMPONENT 4: SOURCING OPTION SELECTION MODAL / CARD (Bottom Left: x = 2310, y = 595) -->
  <g id="UI_Optimization_Card" filter="url(#shadowMd)">
    <rect x="2310" y="595" width="650" height="420" rx="14" fill="#FFFFFF" stroke="#E9D8FD" stroke-width="2"/>
    <rect x="2310" y="595" width="650" height="42" rx="14" fill="#6B46C1"/>
    <rect x="2310" y="621" width="650" height="16" fill="#6B46C1"/>
    <text x="2330" y="623" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="800">
      🎯 OPTIMIZER SOURCING OPTIONS COMPARISON MODAL
    </text>
    <rect x="2830" y="603" width="120" height="24" rx="4" fill="rgba(255,255,255,0.2)"/>
    <text x="2890" y="619" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">OPTION PICKER</text>

    <!-- Option Cards -->
    <g transform="translate(2330, 650)">
      <!-- Option Card 1: Warehouse 1055 (WINNER) -->
      <rect x="0" y="0" width="610" height="96" rx="8" fill="#FAF5FF" stroke="#A855F7" stroke-width="2"/>
      <rect x="15" y="12" width="105" height="20" rx="4" fill="#6B46C1"/>
      <text x="67" y="26" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">COST-OPTIMAL</text>
      
      <rect x="130" y="12" width="90" height="20" rx="4" fill="#FEF3C7"/>
      <text x="175" y="26" fill="#92400E" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">FASTEST (2d)</text>

      <text x="15" y="52" fill="#3B0764" font-family="system-ui, sans-serif" font-size="13" font-weight="800">
        Option 3: Warehouse 1055 (Windsor Hub) ➔ 1,200 kg Colombia Supremo
      </text>
      <text x="15" y="70" fill="#6B21A8" font-family="system-ui, sans-serif" font-size="11">
        Bean Cost: $4,680 · Freight: $589 · Total Landed: $5,269 ($4.39/kg) · ETA: 2 Business Days
      </text>

      <rect x="480" y="28" width="120" height="38" rx="6" fill="#16A34A"/>
      <text x="540" y="52" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Approve &amp; Order ✓</text>

      <!-- Option Card 2: Warehouse 1020 -->
      <rect x="0" y="106" width="610" height="74" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
      <text x="15" y="132" fill="#334155" font-family="system-ui, sans-serif" font-size="12" font-weight="700">
        Option 4: Warehouse 1020 (Sumner Hub) ➔ 1,200 kg ($1,000 freight · 4-day lead time)
      </text>
      <text x="15" y="152" fill="#64748B" font-family="system-ui, sans-serif" font-size="11">
        Landed Cost: $5,680 ($4.73/kg) · Cross-country transit · Secondary Feasible Hub
      </text>
    </g>

    <!-- Source Tables Joined -->
    <g transform="translate(2330, 850)">
      <rect x="0" y="0" width="610" height="145" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="22" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11" font-weight="800">
        TABLES JOINED &amp; MERGED FOR THIS COMPONENT:
      </text>
      <text x="14" y="42" fill="#334155" font-family="monospace" font-size="10">
        • Fact_Table_Optimization_Table opt
      </text>
      <text x="14" y="58" fill="#334155" font-family="monospace" font-size="10">
        • JOIN Dimension_Table_Shipping_Cost sc ON opt.Source_Site_ID = sc.Warehouse_ID
      </text>
      <text x="14" y="74" fill="#334155" font-family="monospace" font-size="10">
        • JOIN Dimension_Table_Site s ON opt.Source_Site_ID = s.Site_ID
      </text>
      <text x="14" y="90" fill="#334155" font-family="monospace" font-size="10">
        • JOIN Dimension_Table_Green_Materials gm ON opt.Selected_Green_ID = gm.Green_Material_ID
      </text>
      <text x="14" y="112" fill="#15803D" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">
        ➔ On Buyer Approval: SET Orders.Selected_Option_ID = opt.Option_ID, Status = 'requested'
      </text>
    </g>
  </g>

  <!-- UI COMPONENT 5: LIVE INVENTORY REPLENISHMENT TABLE (Bottom Center: x = 2990, y = 595) -->
  <g id="UI_Inventory_Table" filter="url(#shadowMd)">
    <rect x="2990" y="595" width="670" height="420" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="2990" y="595" width="670" height="42" rx="14" fill="#0284C7"/>
    <rect x="2990" y="621" width="670" height="16" fill="#0284C7"/>
    <text x="3010" y="623" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="800">
      📦 LIVE INVENTORY &amp; REPLENISHMENT TABLE
    </text>
    <rect x="3530" y="603" width="115" height="24" rx="4" fill="rgba(255,255,255,0.2)"/>
    <text x="3587" y="619" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">PLANO SITE 1054</text>

    <!-- Table Header & Rows -->
    <g transform="translate(3010, 650)">
      <rect x="0" y="0" width="630" height="28" fill="#F1F5F9" rx="4"/>
      <text x="12" y="19" fill="#475569" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">BEAN ID &amp; NAME</text>
      <text x="210" y="19" fill="#475569" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">AVAILABLE</text>
      <text x="310" y="19" fill="#475569" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">THRESHOLD</text>
      <text x="410" y="19" fill="#475569" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">ALTERNATE</text>
      <text x="540" y="19" fill="#475569" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">STATUS</text>

      <!-- Row 1: Gc-04 -->
      <rect x="0" y="34" width="630" height="38" fill="#FFF1F2" rx="4"/>
      <text x="12" y="58" fill="#9F1239" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Gc-04 · Colombia Supremo</text>
      <text x="210" y="58" fill="#BE123C" font-family="monospace" font-size="11" font-weight="800">800 kg</text>
      <text x="310" y="58" fill="#64748B" font-family="monospace" font-size="11">1,200 kg</text>
      <text x="410" y="58" fill="#334155" font-family="system-ui, sans-serif" font-size="11">Gc-12 (2,400kg)</text>
      <rect x="535" y="42" width="80" height="22" rx="11" fill="#FEE2E2"/>
      <text x="575" y="57" fill="#991B1B" font-family="system-ui, sans-serif" font-size="10" font-weight="800" text-anchor="middle">CRITICAL</text>

      <!-- Row 2: Gc-14 -->
      <rect x="0" y="78" width="630" height="38" fill="#F0FDF4" rx="4"/>
      <text x="12" y="102" fill="#14532D" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Gc-14 · Guatemala Antigua</text>
      <text x="210" y="102" fill="#15803D" font-family="monospace" font-size="11" font-weight="800">1,300 kg</text>
      <text x="310" y="102" fill="#64748B" font-family="monospace" font-size="11">1,000 kg</text>
      <text x="410" y="102" fill="#334155" font-family="system-ui, sans-serif" font-size="11">Gc-22 (900kg)</text>
      <rect x="535" y="86" width="80" height="22" rx="11" fill="#DCFCE7"/>
      <text x="575" y="101" fill="#166534" font-family="system-ui, sans-serif" font-size="10" font-weight="800" text-anchor="middle">COVERED</text>
    </g>

    <!-- Source Tables Joined -->
    <g transform="translate(3010, 790)">
      <rect x="0" y="0" width="630" height="205" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="24" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11" font-weight="800">
        TABLES JOINED &amp; RESOLVED FOR INVENTORY TABLE:
      </text>
      <text x="14" y="46" fill="#334155" font-family="monospace" font-size="10">
        SELECT i.Green_Material_ID, m.Green_Material_Description, i.Quantity_Available, i.Minimum_Threshold,
      </text>
      <text x="14" y="64" fill="#334155" font-family="monospace" font-size="10">
               alt_m.Green_Material_Description AS Alternate_Name, alt_i.Quantity_Available AS Alt_Available
      </text>
      <text x="14" y="82" fill="#334155" font-family="monospace" font-size="10">
        FROM Fact_Table_Inventory i
      </text>
      <text x="14" y="100" fill="#334155" font-family="monospace" font-size="10">
        JOIN Dimension_Table_Green_Materials m ON i.Green_Material_ID = m.Green_Material_ID
      </text>
      <text x="14" y="118" fill="#334155" font-family="monospace" font-size="10">
        LEFT JOIN Dimension_Table_Green_Material_Alternate alt ON i.Green_Material_ID = alt.Green_Material_ID
      </text>
      <text x="14" y="136" fill="#334155" font-family="monospace" font-size="10">
        LEFT JOIN Dimension_Table_Green_Materials alt_m ON alt.Alternate_Green_ID = alt_m.Green_Material_ID
      </text>
      <text x="14" y="154" fill="#334155" font-family="monospace" font-size="10">
        LEFT JOIN Fact_Table_Inventory alt_i ON alt.Alternate_Green_ID = alt_i.Green_Material_ID AND alt_i.Site_ID = 1054
      </text>
      <text x="14" y="172" fill="#334155" font-family="monospace" font-size="10">
        WHERE i.Site_ID = 1054
      </text>
      <text x="14" y="194" fill="#0284C7" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">
        ➔ No Projected Balance logic: Pure physical stock on-hand compared directly against threshold.
      </text>
    </g>
  </g>

  <!-- UI COMPONENT 6: ORDER HISTORY & PURCHASE HISTORY MODULES (Bottom Right: x = 3690, y = 595) -->
  <g id="UI_History_Modules" filter="url(#shadowMd)">
    <rect x="3690" y="595" width="670" height="420" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="3690" y="595" width="670" height="42" rx="14" fill="#D83F79"/>
    <rect x="3690" y="621" width="670" height="16" fill="#D83F79"/>
    <text x="3710" y="623" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="800">
      📑 ORDER HISTORY vs. PURCHASE HISTORY (Dual Mode Architecture)
    </text>
    <rect x="4240" y="603" width="105" height="24" rx="4" fill="rgba(255,255,255,0.2)"/>
    <text x="4292" y="619" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">UNIFIED INT</text>

    <!-- Tab Filter Display -->
    <g transform="translate(3710, 650)">
      <!-- Tab 1: Order History -->
      <rect x="0" y="0" width="300" height="36" rx="6" fill="#30272B"/>
      <text x="150" y="23" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" text-anchor="middle">
        Order History (Production Demand)
      </text>

      <!-- Tab 2: Purchase History -->
      <rect x="320" y="0" width="310" height="36" rx="6" fill="#F1F5F9" stroke="#CBD5E1"/>
      <text x="475" y="23" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700" text-anchor="middle">
        Purchase History (Safety Replenishments)
      </text>
    </g>

    <!-- Comparison Breakdown Cards -->
    <g transform="translate(3710, 700)">
      <!-- Box Left: Order History -->
      <rect x="0" y="0" width="300" height="110" rx="8" fill="#FDF2F8" stroke="#FBCFE8"/>
      <text x="12" y="22" fill="#9D174D" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800">ORDER HISTORY VIEW</text>
      <text x="12" y="42" fill="#BE185D" font-family="monospace" font-size="10.5">WHERE Order_Type = 'PRODUCTION'</text>
      <text x="12" y="62" fill="#334155" font-family="system-ui, sans-serif" font-size="10.5">Finished Goods demand to roast (IDs 1000–2999)</text>
      <text x="12" y="80" fill="#334155" font-family="system-ui, sans-serif" font-size="10.5">Orders received &amp; fulfilled through plant silos</text>
      <text x="12" y="98" fill="#831843" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">Display: FG SKU, Brand, Roasting Run Date</text>

      <!-- Box Right: Purchase History -->
      <rect x="320" y="0" width="310" height="110" rx="8" fill="#ECFDF5" stroke="#A7F3D0"/>
      <text x="332" y="22" fill="#065F46" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800">PURCHASE HISTORY VIEW</text>
      <text x="332" y="42" fill="#047857" font-family="monospace" font-size="10.5">WHERE Order_Type = 'REPLENISHMENT'</text>
      <text x="332" y="62" fill="#334155" font-family="system-ui, sans-serif" font-size="10.5">Bean restock orders placed by plant (IDs 3000–4999)</text>
      <text x="332" y="80" fill="#334155" font-family="system-ui, sans-serif" font-size="10.5">Inter-facility transfers from Central Hubs</text>
      <text x="332" y="98" fill="#065F46" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">Display: Sourcing Hub, Freight Cost, Dock ETA</text>
    </g>

    <!-- Source Tables Joined -->
    <g transform="translate(3710, 830)">
      <rect x="0" y="0" width="630" height="165" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="14" y="22" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11" font-weight="800">
        DATABASE JOIN ARCHITECTURE (Strict 3NF — Same PK Format):
      </text>
      <text x="14" y="42" fill="#334155" font-family="monospace" font-size="10">
        SELECT o.Order_Number, o.Order_Type, o.Order_Quantity, o.Status,
      </text>
      <text x="14" y="58" fill="#334155" font-family="monospace" font-size="10">
               s.Site_Name AS Fulfilling_Site, opt.Total_Cost, opt.Lead_Time_Days, sh.Tracking_Number
      </text>
      <text x="14" y="74" fill="#334155" font-family="monospace" font-size="10">
        FROM Fact_Table_Orders o
      </text>
      <text x="14" y="90" fill="#334155" font-family="monospace" font-size="10">
        JOIN Fact_Table_Optimization_Table opt ON o.Order_Number = opt.Order_Number AND o.Selected_Option_ID = opt.Option_ID
      </text>
      <text x="14" y="106" fill="#334155" font-family="monospace" font-size="10">
        JOIN Dimension_Table_Site s ON opt.Source_Site_ID = s.Site_ID
      </text>
      <text x="14" y="122" fill="#334155" font-family="monospace" font-size="10">
        LEFT JOIN Fact_Table_Shipment_Details sh ON o.Order_Number = sh.Order_Number
      </text>
      <text x="14" y="146" fill="#BE185D" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700">
        ✓ Eliminates duplicate tables: One unified table partitioned logically by Order_Type.
      </text>
    </g>
  </g>

  <!-- UI COMPONENT 7: SHIPMENT DETAILS & LOGISTICS TRACKER (Bottom Strip: x = 2310 to 4360, y = 1035) -->
  <g id="UI_Shipment_Tracker" filter="url(#shadowMd)">
    <rect x="2310" y="1035" width="2050" height="280" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
    <rect x="2310" y="1035" width="2050" height="42" rx="14" fill="#0369A1"/>
    <rect x="2310" y="1061" width="2050" height="16" fill="#0369A1"/>
    <text x="2330" y="1063" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="800">
      🚛 INBOUND SHIPMENT &amp; LOGISTICS DOCK CHECK-IN (Physical Freight Movement)
    </text>
    <rect x="4220" y="1043" width="125" height="24" rx="4" fill="rgba(255,255,255,0.2)"/>
    <text x="4282" y="1059" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="10.5" font-weight="700" text-anchor="middle">CARRIER TRACKING</text>

    <!-- Inbound Logistics Content -->
    <g transform="translate(2330, 1095)">
      <rect x="0" y="0" width="1000" height="195" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="18" y="28" fill="#0F172A" font-family="system-ui, sans-serif" font-size="12.5" font-weight="800">
        Shipment #SH-7828 · Warehouse 1055 (Windsor Hub) ➔ Site 1054 Plano Dock
      </text>

      <!-- 4 Badges -->
      <g transform="translate(18, 45)">
        <rect x="0" y="0" width="180" height="48" rx="6" fill="#FFFFFF" stroke="#E2E8F0"/>
        <text x="12" y="20" fill="#64748B" font-family="system-ui, sans-serif" font-size="10">CARRIER</text>
        <text x="12" y="38" fill="#0F172A" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Old Dominion Freight</text>

        <rect x="195" y="0" width="180" height="48" rx="6" fill="#FFFFFF" stroke="#E2E8F0"/>
        <text x="207" y="20" fill="#64748B" font-family="system-ui, sans-serif" font-size="10">TRACKING NO</text>
        <text x="207" y="38" fill="#0F172A" font-family="monospace" font-size="12" font-weight="700">ODFL-984210</text>

        <rect x="390" y="0" width="180" height="48" rx="6" fill="#FFFFFF" stroke="#E2E8F0"/>
        <text x="402" y="20" fill="#64748B" font-family="system-ui, sans-serif" font-size="10">DISPATCH DATE</text>
        <text x="402" y="38" fill="#0F172A" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Oct 26, 2026</text>

        <rect x="585" y="0" width="180" height="48" rx="6" fill="#FFFFFF" stroke="#E2E8F0"/>
        <text x="597" y="20" fill="#64748B" font-family="system-ui, sans-serif" font-size="10">DOCK ETA</text>
        <text x="597" y="38" fill="#15803D" font-family="system-ui, sans-serif" font-size="12" font-weight="800">Oct 28 (On-Time)</text>

        <rect x="780" y="0" width="180" height="48" rx="6" fill="#FAF5FF" stroke="#C084FC"/>
        <text x="792" y="20" fill="#7E22CE" font-family="system-ui, sans-serif" font-size="10">TRANSIT STATUS</text>
        <text x="792" y="38" fill="#6B21A8" font-family="system-ui, sans-serif" font-size="12" font-weight="800">IN TRANSIT 🚚</text>
      </g>

      <!-- Bottom action -->
      <g transform="translate(18, 110)">
        <rect x="0" y="0" width="960" height="65" rx="6" fill="#EFF6FF" stroke="#BFDBFE"/>
        <text x="16" y="28" fill="#1E40AF" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          Dock Arrival Workflow: Truck arrives ➔ System marks 'delivered' ➔ Buyer performs moisture check ➔ Marks 'received'
        </text>
        <text x="16" y="48" fill="#1D4ED8" font-family="system-ui, sans-serif" font-size="11">
          Instant Inventory Reconcile: +1,200 kg credited to Fact_Table_Inventory(Site_ID=1054, Green_ID=4) with 0 latency.
        </text>
      </g>
    </g>

    <!-- Source Tables Joined -->
    <g transform="translate(3360, 1095)">
      <rect x="0" y="0" width="980" height="195" rx="8" fill="#F8FAFC" stroke="#CBD5E1"/>
      <text x="16" y="26" fill="#0F172A" font-family="system-ui, sans-serif" font-size="11.5" font-weight="800">
        SQL JOIN QUERY TO POWER INCOMING LOGISTICS &amp; SHIPMENTS:
      </text>
      <text x="16" y="48" fill="#334155" font-family="monospace" font-size="10.5">
        SELECT s.Shipment_ID, s.Order_Number, orig.Site_Name AS Origin_Warehouse, dest.Site_Name AS Destination_Plant,
      </text>
      <text x="16" y="68" fill="#334155" font-family="monospace" font-size="10.5">
               gm.Green_Material_Description, s.Shipment_Quantity, s.Shipped_Date, s.Estimated_Arrival_Date,
      </text>
      <text x="16" y="88" fill="#334155" font-family="monospace" font-size="10.5">
               s.Carrier_Name, s.Tracking_Number, s.Shipment_Status, sc.Lead_Time_Days
      </text>
      <text x="16" y="108" fill="#334155" font-family="monospace" font-size="10.5">
        FROM Fact_Table_Shipment_Details s
      </text>
      <text x="16" y="128" fill="#334155" font-family="monospace" font-size="10.5">
        JOIN Dimension_Table_Site orig ON s.From_Site_ID = orig.Site_ID
      </text>
      <text x="16" y="148" fill="#334155" font-family="monospace" font-size="10.5">
        JOIN Dimension_Table_Site dest ON s.To_Site_ID = dest.Site_ID
      </text>
      <text x="16" y="168" fill="#334155" font-family="monospace" font-size="10.5">
        JOIN Dimension_Table_Shipping_Cost sc ON s.From_Site_ID = sc.Warehouse_ID AND s.To_Site_ID = sc.Site_ID
      </text>
    </g>
  </g>
`);

  // 7. SLEEK SVG CONNECTOR PATHS WITH DATA JOIN BADGES
  svgParts.push(`
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <!-- DYNAMIC DATA FLOW CONNECTOR ARROWS & JOIN CALLOUT BADGES -->
  <!-- ══════════════════════════════════════════════════════════════════════════ -->

  <!-- Flow 1: Fact_Table_Inventory + Shipping_Cost ➔ Optimization Engine -->
  <path d="M1150 330 C 1180 330, 1195 330, 1230 330" fill="none" stroke="#6B46C1" stroke-width="3" marker-end="url(#arrowPurple)"/>
  <rect x="1150" y="305" width="80" height="20" rx="4" fill="#F3E8FF" stroke="#C084FC"/>
  <text x="1190" y="319" fill="#581C87" font-family="system-ui, sans-serif" font-size="9" font-weight="700" text-anchor="middle">Stock Feeds</text>

  <!-- Flow 2: Shipping Cost ➔ Optimization Engine (Lead Times) -->
  <path d="M570 980 C 850 980, 950 480, 1230 480" fill="none" stroke="#0284C7" stroke-width="2.5" stroke-dasharray="5,5" marker-end="url(#arrowBlue)"/>
  <rect x="850" y="700" width="130" height="22" rx="4" fill="#E0F2FE" stroke="#7DD3FC"/>
  <text x="915" y="715" fill="#0369A1" font-family="system-ui, sans-serif" font-size="9.5" font-weight="700" text-anchor="middle">Freight + Lead Days</text>

  <!-- Flow 3: Optimization Engine ➔ Fact_Table_Optimization_Table (Persist) -->
  <path d="M1230 520 C 1190 520, 1180 850, 1150 850" fill="none" stroke="#BE185D" stroke-width="2.5" marker-end="url(#arrowRose)"/>
  <rect x="1150" y="710" width="85" height="20" rx="4" fill="#FCE7F3" stroke="#F472B6"/>
  <text x="1192" y="724" fill="#9D174D" font-family="system-ui, sans-serif" font-size="9" font-weight="700" text-anchor="middle">Persist Rows</text>

  <!-- Flow 4: Optimization Engine ➔ Sourcing Options UI Card -->
  <path d="M2240 400 C 2270 400, 2270 650, 2310 650" fill="none" stroke="#6B46C1" stroke-width="3" marker-end="url(#arrowPurple)"/>
  <rect x="2230" y="515" width="95" height="22" rx="4" fill="#F3E8FF" stroke="#C084FC"/>
  <text x="2277" y="530" fill="#581C87" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">Render Cards</text>

  <!-- Flow 5: Threshold Evaluator ➔ Immediate Actions Card -->
  <path d="M2240 780 C 2550 780, 2600 370, 2990 370" fill="none" stroke="#E11D48" stroke-width="3" marker-end="url(#arrowRose)"/>
  <rect x="2570" y="560" width="125" height="22" rx="4" fill="#FFE4E6" stroke="#FDA4AF"/>
  <text x="2632" y="575" fill="#9F1239" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">Alert Breaches ➔</text>

  <!-- Flow 6: Inventory Table ➔ UI Inventory Table -->
  <path d="M1150 280 C 1800 280, 2100 750, 2990 750" fill="none" stroke="#0284C7" stroke-width="3" marker-end="url(#arrowBlue)"/>
  <rect x="2030" y="500" width="135" height="22" rx="4" fill="#E0F2FE" stroke="#7DD3FC"/>
  <text x="2097" y="515" fill="#0369A1" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">Live Stock Joins ➔</text>

  <!-- Flow 7: Orders + Options ➔ History Pages -->
  <path d="M1150 600 C 2000 600, 2800 800, 3690 800" fill="none" stroke="#D83F79" stroke-width="3" marker-end="url(#arrowRose)"/>
  <rect x="2400" y="695" width="135" height="22" rx="4" fill="#FCE7F3" stroke="#F472B6"/>
  <text x="2467" y="710" fill="#9D174D" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">History Resolution</text>

  <!-- Flow 8: Shipment Details ➔ Incoming Logistics UI -->
  <path d="M1150 1260 C 1700 1260, 2000 1150, 2310 1150" fill="none" stroke="#0369A1" stroke-width="3" marker-end="url(#arrowBlue)"/>
  <rect x="1700" y="1195" width="125" height="22" rx="4" fill="#E0F2FE" stroke="#7DD3FC"/>
  <text x="1762" y="1210" fill="#0369A1" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">Inbound Tracking</text>

  <!-- Flow 9: Audit Logs ➔ Recent Actions Stream -->
  <path d="M570 1420 C 1800 1420, 2900 1420, 3950 570" fill="none" stroke="#475569" stroke-width="2.5" stroke-dasharray="6,6"/>
  <rect x="2200" y="1405" width="145" height="22" rx="4" fill="#F1F5F9" stroke="#94A3B8"/>
  <text x="2272" y="1420" fill="#334155" font-family="system-ui, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">Audit Stream Feeds</text>
`);

  // 8. Footer Legend & Architectural Principles Bar (Full Width at Bottom: y = 1680)
  svgParts.push(`
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <!-- ARCHITECTURAL FOOTER & COMPLIANCE PRINCIPLES -->
  <!-- ══════════════════════════════════════════════════════════════════════════ -->
  <g id="Footer_Architecture_Summary" transform="translate(40, 1550)">
    <rect x="0" y="0" width="${WIDTH - 80}" height="240" rx="14" fill="#FFFFFF" stroke="#E6DCE2" filter="url(#shadowMd)"/>
    <rect x="0" y="0" width="${WIDTH - 80}" height="42" rx="14" fill="#30272B"/>
    <rect x="0" y="26" width="${WIDTH - 80}" height="16" fill="#30272B"/>

    <text x="24" y="27" fill="#FFFFFF" font-family="system-ui, sans-serif" font-size="14" font-weight="800">
      ARCHITECTURAL INTEGRITY &amp; MENTOR REVIEW NOTES — 4 KEY PRINCIPLES OF GREENSOURCE
    </text>

    <!-- 4 Architectural Summary Columns -->
    <g transform="translate(24, 60)">
      <!-- Col 1 -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="1020" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="18" y="26" fill="#0F172A" font-family="system-ui, sans-serif" font-size="13" font-weight="800">
          1. Direct Central DB Visibility (Zero Bidding Delay)
        </text>
        <text x="18" y="50" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Roasting sites no longer broadcast RFQ transfer quotes to 3 warehouses and wait for manual responses.
        </text>
        <text x="18" y="70" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Central Warehouse stock is tracked directly in Fact_Table_Inventory across Hubs 1055, 1020, and 1021.
        </text>
        <text x="18" y="90" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • The system optimizer autonomously checks live availability and calculates exact landed delivered costs.
        </text>
        <text x="18" y="110" fill="#15803D" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          ➔ Warehouse Manager simply clicks "Approve &amp; Allocate" — zero back-and-forth communication needed.
        </text>
      </g>

      <!-- Col 2 -->
      <g transform="translate(1045, 0)">
        <rect x="0" y="0" width="1020" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="18" y="26" fill="#0F172A" font-family="system-ui, sans-serif" font-size="13" font-weight="800">
          2. Dynamic Optimizer Badging &amp; Sourcing Logic
        </text>
        <text x="18" y="50" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Cost-Optimal Badge: Calculated dynamically via MIN(Total_Cost) across feasible options.
        </text>
        <text x="18" y="70" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Fastest Delivery Badge: Calculated dynamically via MIN(Lead_Time_Days) from Dimension_Table_Shipping_Cost.
        </text>
        <text x="18" y="90" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Every evaluated candidate scenario is persisted in Fact_Table_Optimization_Table for audit explainability.
        </text>
        <text x="18" y="110" fill="#6B21A8" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          ➔ Fact_Table_Orders links directly via Selected_Option_ID FK with 0 data redundancy.
        </text>
      </g>

      <!-- Col 3 -->
      <g transform="translate(2090, 0)">
        <rect x="0" y="0" width="1020" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="18" y="26" fill="#0F172A" font-family="system-ui, sans-serif" font-size="13" font-weight="800">
          3. Pure Physical Inventory On-Hand (No Projected Balance)
        </text>
        <text x="18" y="50" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Projected Balance and simulated future demand curves are completely removed from Fact_Table_Inventory.
        </text>
        <text x="18" y="70" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Fact_Table_Inventory strictly holds Quantity_Available (physical uncommitted kg) and Minimum_Threshold.
        </text>
        <text x="18" y="90" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Threshold Replenishment triggers deterministically whenever Quantity_Available &lt;= Minimum_Threshold.
        </text>
        <text x="18" y="110" fill="#0284C7" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          ➔ Avoids stock volatility and provides reliable replenishment triggers across all facilities.
        </text>
      </g>

      <!-- Col 4 -->
      <g transform="translate(3135, 0)">
        <rect x="0" y="0" width="1120" height="150" rx="8" fill="#F8FAFC" stroke="#E2E8F0"/>
        <text x="18" y="26" fill="#0F172A" font-family="system-ui, sans-serif" font-size="13" font-weight="800">
          4. Order History vs. Purchase History Architecture
        </text>
        <text x="18" y="50" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Order History: Finished Goods Production Demands received by the roasting site (Order_Type = 'PRODUCTION', 1000s).
        </text>
        <text x="18" y="70" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Purchase History: Green Bean Replenishment Requisitions placed to Central Warehouses (Order_Type = 'REPLENISHMENT', 3000s).
        </text>
        <text x="18" y="90" fill="#475569" font-family="system-ui, sans-serif" font-size="11.5">
          • Both utilize identical integer Order_Number PKs, identical 9-step lifecycles, and shared shipment tracking.
        </text>
        <text x="18" y="110" fill="#BE185D" font-family="system-ui, sans-serif" font-size="11.5" font-weight="700">
          ➔ Unified data model with clean UI tab partitioning — optimal enterprise architecture.
        </text>
      </g>
    </g>
  </g>
`);

  svgParts.push('</svg>');
  return svgParts.join('\n');
}

const svgContent = generateSvg();
const outputPath = path.resolve('docs/ERD_TO_UI_DATA_MAPPING_PRESENTATION.svg');
const rootPath = path.resolve('ERD_TO_UI_DATA_MAPPING_PRESENTATION.svg');

fs.writeFileSync(outputPath, svgContent, 'utf8');
fs.writeFileSync(rootPath, svgContent, 'utf8');

console.log(`Successfully generated ultra-wide presentation SVG!`);
console.log(`Saved to: ${outputPath} and ${rootPath}`);
