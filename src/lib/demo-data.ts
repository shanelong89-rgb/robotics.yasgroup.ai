import {
  Fleet,
  Asset,
  Alert,
  Claim,
  ClaimEvidence,
  Payout,
  CoveragePolicy,
  TelemetryEvent,
  ReservePool,
  PremiumTransaction,
  TreasuryMovement,
  EventStreamEntry,
  RiskScoreSnapshot,
} from "@/types";

// FLEETS
export const fleets: Fleet[] = [
  {
    id: "fleet-hk-alpha",
    name: "HK Robotics Alpha",
    operatorId: "op-001",
    geography: "hong_kong",
    assetCount: 24,
    healthScore: 87,
    coverageRatio: 0.92,
    premiumMonthly: 148000,
    createdAt: "2024-01-15",
  },
  {
    id: "fleet-sz-ev",
    name: "Shenzhen EV Grid",
    operatorId: "op-002",
    geography: "shenzhen",
    assetCount: 22,
    healthScore: 79,
    coverageRatio: 0.85,
    premiumMonthly: 112000,
    createdAt: "2024-03-01",
  },
  {
    id: "fleet-tky-av",
    name: "Tokyo AV Pilot",
    operatorId: "op-003",
    geography: "tokyo",
    assetCount: 18,
    healthScore: 93,
    coverageRatio: 1.0,
    premiumMonthly: 195000,
    createdAt: "2024-06-10",
  },
  {
    id: "fleet-sg-log",
    name: "Singapore Logistics",
    operatorId: "op-004",
    geography: "singapore",
    assetCount: 20,
    healthScore: 91,
    coverageRatio: 0.95,
    premiumMonthly: 133000,
    createdAt: "2024-02-20",
  },
];

// HK ASSETS (delivery bots, warehouse bots)
const hkAssets: Asset[] = [
  { id: "hk-001", name: "HK-BOT-001", type: "robot", fleetId: "fleet-hk-alpha", status: "active", lat: 22.3193, lng: 114.1694, riskScore: 23, batteryLevel: 87, healthPercent: 96, operatingHours: 2847, lastEvent: "Waypoint reached", lastEventTime: "2 min ago", premiumBurnRate: 12.4, geography: "hong_kong" },
  { id: "hk-002", name: "HK-BOT-002", type: "robot", fleetId: "fleet-hk-alpha", status: "warning", lat: 22.3268, lng: 114.1634, riskScore: 61, batteryLevel: 34, healthPercent: 78, operatingHours: 1923, lastEvent: "Battery low alert", lastEventTime: "8 min ago", premiumBurnRate: 18.7, geography: "hong_kong" },
  { id: "hk-003", name: "HK-BOT-003", type: "robot", fleetId: "fleet-hk-alpha", status: "critical", lat: 22.3094, lng: 114.1749, riskScore: 88, batteryLevel: 12, healthPercent: 55, operatingHours: 3201, lastEvent: "Collision detected", lastEventTime: "1 min ago", premiumBurnRate: 31.2, geography: "hong_kong" },
  { id: "hk-004", name: "HK-BOT-004", type: "robot", fleetId: "fleet-hk-alpha", status: "active", lat: 22.3371, lng: 114.1783, riskScore: 18, batteryLevel: 92, healthPercent: 99, operatingHours: 842, lastEvent: "Delivery completed", lastEventTime: "5 min ago", premiumBurnRate: 10.8, geography: "hong_kong" },
  { id: "hk-005", name: "HK-BOT-005", type: "robot", fleetId: "fleet-hk-alpha", status: "active", lat: 22.3145, lng: 114.1621, riskScore: 31, batteryLevel: 76, healthPercent: 91, operatingHours: 1564, lastEvent: "Route optimized", lastEventTime: "12 min ago", premiumBurnRate: 13.1, geography: "hong_kong" },
  { id: "hk-006", name: "HK-WH-001", type: "robot", fleetId: "fleet-hk-alpha", status: "idle", lat: 22.3222, lng: 114.1702, riskScore: 15, batteryLevel: 100, healthPercent: 98, operatingHours: 2103, lastEvent: "Charging complete", lastEventTime: "30 min ago", premiumBurnRate: 9.2, geography: "hong_kong" },
  { id: "hk-007", name: "HK-WH-002", type: "robot", fleetId: "fleet-hk-alpha", status: "active", lat: 22.3311, lng: 114.1756, riskScore: 27, batteryLevel: 68, healthPercent: 88, operatingHours: 1788, lastEvent: "Picking task started", lastEventTime: "3 min ago", premiumBurnRate: 11.9, geography: "hong_kong" },
  { id: "hk-008", name: "HK-BOT-006", type: "robot", fleetId: "fleet-hk-alpha", status: "warning", lat: 22.3051, lng: 114.1812, riskScore: 52, batteryLevel: 41, healthPercent: 72, operatingHours: 4102, lastEvent: "Sensor anomaly", lastEventTime: "6 min ago", premiumBurnRate: 22.4, geography: "hong_kong" },
];

// SZ ASSETS (EV cargo vans, patrol units)
const szAssets: Asset[] = [
  { id: "sz-001", name: "SZ-EV-001", type: "ev", fleetId: "fleet-sz-ev", status: "active", lat: 22.5431, lng: 114.0579, riskScore: 34, batteryLevel: 79, healthPercent: 94, operatingHours: 3412, lastEvent: "Route checkpoint", lastEventTime: "4 min ago", premiumBurnRate: 15.6, geography: "shenzhen" },
  { id: "sz-002", name: "SZ-EV-002", type: "ev", fleetId: "fleet-sz-ev", status: "warning", lat: 22.5621, lng: 114.0736, riskScore: 58, batteryLevel: 22, healthPercent: 81, operatingHours: 5187, lastEvent: "Range low warning", lastEventTime: "2 min ago", premiumBurnRate: 24.1, geography: "shenzhen" },
  { id: "sz-003", name: "SZ-EV-003", type: "ev", fleetId: "fleet-sz-ev", status: "active", lat: 22.5289, lng: 114.0621, riskScore: 29, batteryLevel: 91, healthPercent: 97, operatingHours: 1834, lastEvent: "Cargo delivered", lastEventTime: "9 min ago", premiumBurnRate: 13.8, geography: "shenzhen" },
  { id: "sz-004", name: "SZ-PAT-001", type: "ev", fleetId: "fleet-sz-ev", status: "critical", lat: 22.5512, lng: 114.0489, riskScore: 82, batteryLevel: 8, healthPercent: 63, operatingHours: 6203, lastEvent: "Fault detected", lastEventTime: "30 sec ago", premiumBurnRate: 38.7, geography: "shenzhen" },
  { id: "sz-005", name: "SZ-EV-004", type: "ev", fleetId: "fleet-sz-ev", status: "active", lat: 22.5378, lng: 114.0834, riskScore: 41, batteryLevel: 65, healthPercent: 89, operatingHours: 2891, lastEvent: "Traffic delay", lastEventTime: "7 min ago", premiumBurnRate: 16.9, geography: "shenzhen" },
  { id: "sz-006", name: "SZ-PAT-002", type: "ev", fleetId: "fleet-sz-ev", status: "active", lat: 22.5687, lng: 114.0612, riskScore: 22, batteryLevel: 88, healthPercent: 96, operatingHours: 1203, lastEvent: "Perimeter check", lastEventTime: "15 min ago", premiumBurnRate: 11.2, geography: "shenzhen" },
  { id: "sz-007", name: "SZ-EV-005", type: "ev", fleetId: "fleet-sz-ev", status: "idle", lat: 22.5441, lng: 114.0698, riskScore: 19, batteryLevel: 100, healthPercent: 100, operatingHours: 987, lastEvent: "Charging", lastEventTime: "25 min ago", premiumBurnRate: 8.4, geography: "shenzhen" },
  { id: "sz-008", name: "SZ-EV-006", type: "ev", fleetId: "fleet-sz-ev", status: "warning", lat: 22.5334, lng: 114.0751, riskScore: 67, batteryLevel: 31, healthPercent: 74, operatingHours: 4891, lastEvent: "Battery degradation", lastEventTime: "18 min ago", premiumBurnRate: 27.3, geography: "shenzhen" },
];

// TOKYO ASSETS (AV shuttles, last-mile pods)
const tokyoAssets: Asset[] = [
  { id: "tky-001", name: "TKY-AV-001", type: "av", fleetId: "fleet-tky-av", status: "active", lat: 35.6762, lng: 139.6503, riskScore: 12, batteryLevel: 94, healthPercent: 99, operatingHours: 1247, lastEvent: "Passenger dropoff", lastEventTime: "3 min ago", premiumBurnRate: 28.4, geography: "tokyo" },
  { id: "tky-002", name: "TKY-AV-002", type: "av", fleetId: "fleet-tky-av", status: "active", lat: 35.6892, lng: 139.6623, riskScore: 18, batteryLevel: 78, healthPercent: 97, operatingHours: 2103, lastEvent: "Route calculation", lastEventTime: "1 min ago", premiumBurnRate: 31.7, geography: "tokyo" },
  { id: "tky-003", name: "TKY-POD-001", type: "av", fleetId: "fleet-tky-av", status: "active", lat: 35.6634, lng: 139.6712, riskScore: 21, batteryLevel: 82, healthPercent: 95, operatingHours: 891, lastEvent: "Zone entry", lastEventTime: "5 min ago", premiumBurnRate: 26.9, geography: "tokyo" },
  { id: "tky-004", name: "TKY-AV-003", type: "av", fleetId: "fleet-tky-av", status: "warning", lat: 35.6723, lng: 139.6389, riskScore: 43, batteryLevel: 51, healthPercent: 88, operatingHours: 3421, lastEvent: "Sensor calibration", lastEventTime: "10 min ago", premiumBurnRate: 42.1, geography: "tokyo" },
  { id: "tky-005", name: "TKY-POD-002", type: "av", fleetId: "fleet-tky-av", status: "active", lat: 35.6801, lng: 139.6547, riskScore: 15, batteryLevel: 89, healthPercent: 98, operatingHours: 1563, lastEvent: "Pickup requested", lastEventTime: "2 min ago", premiumBurnRate: 29.8, geography: "tokyo" },
  { id: "tky-006", name: "TKY-AV-004", type: "av", fleetId: "fleet-tky-av", status: "idle", lat: 35.6698, lng: 139.6601, riskScore: 11, batteryLevel: 100, healthPercent: 100, operatingHours: 634, lastEvent: "Maintenance complete", lastEventTime: "1 hr ago", premiumBurnRate: 22.3, geography: "tokyo" },
];

// SINGAPORE ASSETS (logistics mix)
const sgAssets: Asset[] = [
  { id: "sg-001", name: "SG-BOT-001", type: "robot", fleetId: "fleet-sg-log", status: "active", lat: 1.3521, lng: 103.8198, riskScore: 25, batteryLevel: 84, healthPercent: 93, operatingHours: 2341, lastEvent: "Package scanned", lastEventTime: "4 min ago", premiumBurnRate: 12.8, geography: "singapore" },
  { id: "sg-002", name: "SG-EV-001", type: "ev", fleetId: "fleet-sg-log", status: "active", lat: 1.3612, lng: 103.8301, riskScore: 31, batteryLevel: 72, healthPercent: 91, operatingHours: 3102, lastEvent: "Delivery zone", lastEventTime: "6 min ago", premiumBurnRate: 14.7, geography: "singapore" },
  { id: "sg-003", name: "SG-AV-001", type: "av", fleetId: "fleet-sg-log", status: "active", lat: 1.3429, lng: 103.8089, riskScore: 19, batteryLevel: 91, healthPercent: 98, operatingHours: 1203, lastEvent: "Route optimized", lastEventTime: "3 min ago", premiumBurnRate: 33.4, geography: "singapore" },
  { id: "sg-004", name: "SG-BOT-002", type: "robot", fleetId: "fleet-sg-log", status: "critical", lat: 1.3578, lng: 103.8234, riskScore: 79, batteryLevel: 15, healthPercent: 58, operatingHours: 4892, lastEvent: "Obstacle collision", lastEventTime: "45 sec ago", premiumBurnRate: 41.2, geography: "singapore" },
  { id: "sg-005", name: "SG-EV-002", type: "ev", fleetId: "fleet-sg-log", status: "warning", lat: 1.3489, lng: 103.8156, riskScore: 55, batteryLevel: 28, healthPercent: 76, operatingHours: 5621, lastEvent: "Battery alert", lastEventTime: "11 min ago", premiumBurnRate: 23.8, geography: "singapore" },
  { id: "sg-006", name: "SG-BOT-003", type: "robot", fleetId: "fleet-sg-log", status: "active", lat: 1.3634, lng: 103.8267, riskScore: 28, batteryLevel: 79, healthPercent: 94, operatingHours: 1891, lastEvent: "Waypoint cleared", lastEventTime: "8 min ago", premiumBurnRate: 11.9, geography: "singapore" },
  { id: "sg-007", name: "SG-AV-002", type: "av", fleetId: "fleet-sg-log", status: "active", lat: 1.3501, lng: 103.8312, riskScore: 22, batteryLevel: 86, healthPercent: 96, operatingHours: 892, lastEvent: "Passenger pickup", lastEventTime: "2 min ago", premiumBurnRate: 30.1, geography: "singapore" },
  { id: "sg-008", name: "SG-EV-003", type: "ev", fleetId: "fleet-sg-log", status: "idle", lat: 1.3456, lng: 103.8123, riskScore: 14, batteryLevel: 100, healthPercent: 100, operatingHours: 712, lastEvent: "Charging", lastEventTime: "45 min ago", premiumBurnRate: 8.1, geography: "singapore" },
];

export const assets: Asset[] = [
  ...hkAssets,
  ...szAssets,
  ...tokyoAssets,
  ...sgAssets,
  // Additional fill assets
  { id: "hk-009", name: "HK-BOT-007", type: "robot", fleetId: "fleet-hk-alpha", status: "active", lat: 22.3180, lng: 114.1722, riskScore: 32, batteryLevel: 71, healthPercent: 89, operatingHours: 1234, lastEvent: "Task assigned", lastEventTime: "14 min ago", premiumBurnRate: 13.4, geography: "hong_kong" },
  { id: "hk-010", name: "HK-WH-003", type: "robot", fleetId: "fleet-hk-alpha", status: "active", lat: 22.3247, lng: 114.1668, riskScore: 20, batteryLevel: 83, healthPercent: 95, operatingHours: 2100, lastEvent: "Scan complete", lastEventTime: "22 min ago", premiumBurnRate: 10.1, geography: "hong_kong" },
  { id: "sz-009", name: "SZ-EV-007", type: "ev", fleetId: "fleet-sz-ev", status: "active", lat: 22.5499, lng: 114.0601, riskScore: 26, batteryLevel: 81, healthPercent: 92, operatingHours: 2310, lastEvent: "Hub arrived", lastEventTime: "9 min ago", premiumBurnRate: 14.2, geography: "shenzhen" },
  { id: "tky-007", name: "TKY-AV-005", type: "av", fleetId: "fleet-tky-av", status: "active", lat: 35.6745, lng: 139.6489, riskScore: 16, batteryLevel: 87, healthPercent: 97, operatingHours: 1100, lastEvent: "Intersection cleared", lastEventTime: "5 min ago", premiumBurnRate: 27.1, geography: "tokyo" },
  { id: "sg-009", name: "SG-BOT-004", type: "robot", fleetId: "fleet-sg-log", status: "active", lat: 1.3592, lng: 103.8288, riskScore: 30, batteryLevel: 77, healthPercent: 91, operatingHours: 1543, lastEvent: "Sorting complete", lastEventTime: "7 min ago", premiumBurnRate: 12.3, geography: "singapore" },
];

// ALERTS
export const alerts: Alert[] = [
  {
    id: "alert-001",
    assetId: "hk-003",
    fleetId: "fleet-hk-alpha",
    type: "collision",
    severity: "critical",
    title: "Collision Detected",
    description: "HK-BOT-003 detected frontal collision at Wan Chai delivery point. Sensors halted. Emergency protocol engaged.",
    timestamp: new Date(Date.now() - 90000).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-002",
    assetId: "sz-004",
    fleetId: "fleet-sz-ev",
    type: "fault_detected",
    severity: "critical",
    title: "System Fault",
    description: "SZ-PAT-001 motor controller fault detected. Vehicle unable to proceed. Roadside assistance notified.",
    timestamp: new Date(Date.now() - 45000).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-003",
    assetId: "sg-004",
    fleetId: "fleet-sg-log",
    type: "collision",
    severity: "critical",
    title: "Obstacle Collision",
    description: "SG-BOT-002 impacted static obstacle at Jurong warehouse entrance. Damage assessment in progress.",
    timestamp: new Date(Date.now() - 55000).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-004",
    assetId: "hk-002",
    fleetId: "fleet-hk-alpha",
    type: "battery_critical",
    severity: "high",
    title: "Battery Low Alert",
    description: "HK-BOT-002 battery at 34%. Returning to charging station. ETA 8 minutes.",
    timestamp: new Date(Date.now() - 480000).toISOString(),
    acknowledged: true,
  },
  {
    id: "alert-005",
    assetId: "sz-002",
    fleetId: "fleet-sz-ev",
    type: "battery_critical",
    severity: "high",
    title: "Range Critical",
    description: "SZ-EV-002 range below safe threshold. Rerouted to nearest charging depot.",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    acknowledged: false,
  },
  {
    id: "alert-006",
    assetId: "tky-004",
    fleetId: "fleet-tky-av",
    type: "anomaly",
    severity: "medium",
    title: "Sensor Calibration Required",
    description: "TKY-AV-003 LIDAR array drift detected. Scheduled calibration override triggered.",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    acknowledged: true,
  },
];

// CLAIMS
export const claims: Claim[] = [
  {
    id: "claim-001",
    assetId: "hk-003",
    fleetId: "fleet-hk-alpha",
    policyId: "pol-hk-003",
    alertId: "alert-001",
    status: "under_review",
    severity: "major",
    title: "HK-BOT-003 Collision Claim",
    description: "Delivery robot sustained frontal impact damage. Estimated repair cost HK$42,000. No third-party injury.",
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    estimatedLoss: 42000,
    currency: "HKD",
    evidenceIds: ["ev-001", "ev-002"],
  },
  {
    id: "claim-002",
    assetId: "sz-004",
    fleetId: "fleet-sz-ev",
    policyId: "pol-sz-004",
    alertId: "alert-002",
    status: "evidence_requested",
    severity: "moderate",
    title: "SZ-PAT-001 Motor Fault Claim",
    description: "Motor controller failure requiring full unit replacement. Operational downtime: 72hr estimated.",
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    estimatedLoss: 28500,
    currency: "CNY",
    evidenceIds: ["ev-003"],
  },
  {
    id: "claim-003",
    assetId: "sg-004",
    fleetId: "fleet-sg-log",
    policyId: "pol-sg-004",
    alertId: "alert-003",
    status: "submitted",
    severity: "moderate",
    title: "SG-BOT-002 Warehouse Collision",
    description: "Robot collision with fixed infrastructure. Chassis damage and sensor array replacement needed.",
    submittedAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    estimatedLoss: 18700,
    currency: "SGD",
    evidenceIds: ["ev-004", "ev-005"],
  },
  {
    id: "claim-004",
    assetId: "sz-008",
    fleetId: "fleet-sz-ev",
    policyId: "pol-sz-008",
    status: "approved",
    severity: "minor",
    title: "SZ-EV-006 Battery Degradation",
    description: "Premature battery pack degradation below warranty threshold. Parametric replacement trigger.",
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    estimatedLoss: 8900,
    approvedAmount: 7800,
    currency: "CNY",
    evidenceIds: ["ev-006"],
    payoutId: "pay-001",
  },
  {
    id: "claim-005",
    assetId: "hk-008",
    fleetId: "fleet-hk-alpha",
    policyId: "pol-hk-008",
    status: "paid",
    severity: "minor",
    title: "HK-BOT-006 Sensor Anomaly",
    description: "Sensor array replacement following confirmed anomaly detection. Covered under parametric policy.",
    submittedAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    estimatedLoss: 5400,
    approvedAmount: 5400,
    currency: "HKD",
    evidenceIds: ["ev-007"],
    payoutId: "pay-002",
  },
];

// CLAIM EVIDENCE
export const claimEvidence: ClaimEvidence[] = [
  { id: "ev-001", claimId: "claim-001", type: "telemetry_snapshot", description: "Pre-collision telemetry 60s window", uploadedAt: new Date(Date.now() - 3500000).toISOString(), verified: true },
  { id: "ev-002", claimId: "claim-001", type: "gps_trace", description: "GPS trace at impact location", uploadedAt: new Date(Date.now() - 3400000).toISOString(), verified: true },
  { id: "ev-003", claimId: "claim-002", type: "sensor_log", description: "Motor controller fault log export", uploadedAt: new Date(Date.now() - 7000000).toISOString(), verified: false },
  { id: "ev-004", claimId: "claim-003", type: "photo", description: "Post-collision chassis photo", uploadedAt: new Date(Date.now() - 850000).toISOString(), verified: false },
  { id: "ev-005", claimId: "claim-003", type: "video_clip", description: "Warehouse camera footage (15s)", uploadedAt: new Date(Date.now() - 800000).toISOString(), verified: false },
  { id: "ev-006", claimId: "claim-004", type: "telemetry_snapshot", description: "Battery degradation telemetry 30d", uploadedAt: new Date(Date.now() - 86000000).toISOString(), verified: true },
  { id: "ev-007", claimId: "claim-005", type: "sensor_log", description: "Anomaly detection log", uploadedAt: new Date(Date.now() - 172000000).toISOString(), verified: true },
];

// PAYOUTS
export const payouts: Payout[] = [
  {
    id: "pay-001",
    claimId: "claim-004",
    amount: 7800,
    currency: "CNY",
    status: "completed",
    initiatedAt: new Date(Date.now() - 43200000).toISOString(),
    completedAt: new Date(Date.now() - 36000000).toISOString(),
    poolId: "pool-shared",
    transactionRef: "YAS-PAY-20240321-001",
  },
  {
    id: "pay-002",
    claimId: "claim-005",
    amount: 5400,
    currency: "HKD",
    status: "completed",
    initiatedAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 79200000).toISOString(),
    poolId: "pool-first-loss",
    transactionRef: "YAS-PAY-20240320-002",
  },
];

// RESERVE POOLS
export const reservePools: ReservePool[] = [
  {
    id: "pool-first-loss",
    name: "First Loss Pool",
    type: "first_loss",
    balance: 2400000,
    currency: "HKD",
    utilizationPct: 24,
    maxCapacity: 10000000,
    allocations: [
      { id: "alloc-001", poolId: "pool-first-loss", fleetId: "fleet-hk-alpha", amount: 960000, allocationPct: 40, purpose: "Primary coverage buffer" },
      { id: "alloc-002", poolId: "pool-first-loss", fleetId: "fleet-sz-ev", amount: 480000, allocationPct: 20, purpose: "Secondary buffer" },
    ],
  },
  {
    id: "pool-shared",
    name: "Shared Risk Pool",
    type: "shared",
    balance: 8700000,
    currency: "HKD",
    utilizationPct: 41,
    maxCapacity: 21000000,
    allocations: [
      { id: "alloc-003", poolId: "pool-shared", fleetId: "fleet-hk-alpha", amount: 2200000, allocationPct: 25.3, purpose: "Fleet coverage allocation" },
      { id: "alloc-004", poolId: "pool-shared", fleetId: "fleet-sz-ev", amount: 2100000, allocationPct: 24.1, purpose: "Fleet coverage allocation" },
      { id: "alloc-005", poolId: "pool-shared", fleetId: "fleet-tky-av", amount: 2500000, allocationPct: 28.7, purpose: "Fleet coverage allocation" },
      { id: "alloc-006", poolId: "pool-shared", fleetId: "fleet-sg-log", amount: 1900000, allocationPct: 21.8, purpose: "Fleet coverage allocation" },
    ],
  },
];

// COVERAGE POLICIES
export const coveragePolicies: CoveragePolicy[] = [
  { id: "pol-hk-003", assetId: "hk-003", fleetId: "fleet-hk-alpha", coverageType: "comprehensive", startDate: "2024-01-01", endDate: "2025-01-01", premiumMonthly: 3200, coverageLimit: 500000, deductible: 5000, status: "active", riskMultiplier: 1.8 },
  { id: "pol-sz-004", assetId: "sz-004", fleetId: "fleet-sz-ev", coverageType: "collision", startDate: "2024-03-01", endDate: "2025-03-01", premiumMonthly: 2800, coverageLimit: 300000, deductible: 3000, status: "active", riskMultiplier: 1.6 },
  { id: "pol-sg-004", assetId: "sg-004", fleetId: "fleet-sg-log", coverageType: "comprehensive", startDate: "2024-02-15", endDate: "2025-02-15", premiumMonthly: 3500, coverageLimit: 450000, deductible: 4000, status: "active", riskMultiplier: 1.7 },
  { id: "pol-sz-008", assetId: "sz-008", fleetId: "fleet-sz-ev", coverageType: "parametric", startDate: "2024-03-01", endDate: "2025-03-01", premiumMonthly: 1800, coverageLimit: 50000, deductible: 0, status: "active", riskMultiplier: 1.3 },
  { id: "pol-hk-008", assetId: "hk-008", fleetId: "fleet-hk-alpha", coverageType: "parametric", startDate: "2024-01-01", endDate: "2025-01-01", premiumMonthly: 1500, coverageLimit: 30000, deductible: 0, status: "active", riskMultiplier: 1.2 },
];

// TELEMETRY EVENTS (recent)
export const telemetryEvents: TelemetryEvent[] = [
  { id: "tel-001", assetId: "hk-003", timestamp: new Date(Date.now() - 95000).toISOString(), type: "collision", value: "impact_detected", severity: "critical" },
  { id: "tel-002", assetId: "hk-002", timestamp: new Date(Date.now() - 480000).toISOString(), type: "battery", value: 34, unit: "%", severity: "warning" },
  { id: "tel-003", assetId: "sz-004", timestamp: new Date(Date.now() - 48000).toISOString(), type: "fault", value: "motor_ctrl_fail", severity: "critical" },
  { id: "tel-004", assetId: "tky-001", timestamp: new Date(Date.now() - 180000).toISOString(), type: "speed", value: 28, unit: "km/h", severity: "info" },
  { id: "tel-005", assetId: "sg-001", timestamp: new Date(Date.now() - 240000).toISOString(), type: "heartbeat", value: "ok", severity: "info" },
  { id: "tel-006", assetId: "sz-002", timestamp: new Date(Date.now() - 120000).toISOString(), type: "battery", value: 22, unit: "%", severity: "warning" },
  { id: "tel-007", assetId: "hk-001", timestamp: new Date(Date.now() - 120000).toISOString(), type: "position", value: "22.3193,114.1694", severity: "info" },
  { id: "tel-008", assetId: "tky-003", timestamp: new Date(Date.now() - 300000).toISOString(), type: "sensor", value: "lidar_ok", severity: "info" },
];

// PREMIUM TRANSACTIONS (last 30 days)
export const premiumTransactions: PremiumTransaction[] = Array.from({ length: 30 }, (_, i) => ({
  id: `prem-${i}`,
  policyId: `pol-${i % 5}`,
  assetId: assets[i % assets.length].id,
  fleetId: fleets[i % fleets.length].id,
  amount: 15000 + Math.random() * 8000,
  currency: "HKD",
  timestamp: new Date(Date.now() - i * 86400000).toISOString(),
  type: "accrual" as const,
  period: `2024-${String(Math.floor((Date.now() - i * 86400000) / 2592000000) % 12 + 1).padStart(2, "0")}`,
}));

// TREASURY MOVEMENTS (last 30 days)
export const treasuryMovements: TreasuryMovement[] = [
  { id: "tm-001", poolId: "pool-shared", type: "premium_inflow", amount: 148000, currency: "HKD", timestamp: new Date(Date.now() - 86400000).toISOString(), description: "HK Robotics Alpha monthly premium", balanceAfter: 8700000 },
  { id: "tm-002", poolId: "pool-shared", type: "premium_inflow", amount: 112000, currency: "HKD", timestamp: new Date(Date.now() - 172800000).toISOString(), description: "Shenzhen EV Grid monthly premium", balanceAfter: 8552000 },
  { id: "tm-003", poolId: "pool-first-loss", type: "claim_payout", amount: -5400, currency: "HKD", timestamp: new Date(Date.now() - 86400000).toISOString(), description: "HK-BOT-006 sensor claim payout", balanceAfter: 2400000 },
  { id: "tm-004", poolId: "pool-shared", type: "premium_inflow", amount: 195000, currency: "HKD", timestamp: new Date(Date.now() - 259200000).toISOString(), description: "Tokyo AV Pilot monthly premium", balanceAfter: 8440000 },
  { id: "tm-005", poolId: "pool-shared", type: "claim_payout", amount: -7800, currency: "HKD", timestamp: new Date(Date.now() - 43200000).toISOString(), description: "SZ-EV-006 battery claim payout", balanceAfter: 8692200 },
  { id: "tm-006", poolId: "pool-shared", type: "premium_inflow", amount: 133000, currency: "HKD", timestamp: new Date(Date.now() - 345600000).toISOString(), description: "Singapore Logistics monthly premium", balanceAfter: 8245000 },
  { id: "tm-007", poolId: "pool-first-loss", type: "reserve_top_up", amount: 200000, currency: "HKD", timestamp: new Date(Date.now() - 432000000).toISOString(), description: "Reserve top-up from premium surplus", balanceAfter: 2405400 },
  { id: "tm-008", poolId: "pool-shared", type: "yield", amount: 12400, currency: "HKD", timestamp: new Date(Date.now() - 518400000).toISOString(), description: "Treasury yield allocation", balanceAfter: 8112000 },
];

// EVENT STREAM (live feed)
export const initialEventStream: EventStreamEntry[] = [
  { id: "ev-stream-001", type: "alert", severity: "critical", title: "Collision Detected", description: "HK-BOT-003 frontal impact at Wan Chai delivery point", timestamp: new Date(Date.now() - 90000).toISOString(), assetId: "hk-003", fleetId: "fleet-hk-alpha" },
  { id: "ev-stream-002", type: "alert", severity: "critical", title: "System Fault", description: "SZ-PAT-001 motor controller failure detected", timestamp: new Date(Date.now() - 45000).toISOString(), assetId: "sz-004", fleetId: "fleet-sz-ev" },
  { id: "ev-stream-003", type: "claim", severity: "warning", title: "Claim Submitted", description: "New claim filed for HK-BOT-003 collision — est. HK$42,000", timestamp: new Date(Date.now() - 3600000).toISOString(), assetId: "hk-003", fleetId: "fleet-hk-alpha" },
  { id: "ev-stream-004", type: "payout", severity: "info", title: "Payout Completed", description: "HK$5,400 payout completed for HK-BOT-006 sensor anomaly", timestamp: new Date(Date.now() - 86400000).toISOString(), assetId: "hk-008", fleetId: "fleet-hk-alpha" },
  { id: "ev-stream-005", type: "telemetry", severity: "warning", title: "Battery Critical", description: "SZ-EV-002 battery at 22% — rerouted to charging depot", timestamp: new Date(Date.now() - 120000).toISOString(), assetId: "sz-002", fleetId: "fleet-sz-ev" },
  { id: "ev-stream-006", type: "reserve", severity: "info", title: "Premium Inflow", description: "HK$148,000 premium received from HK Robotics Alpha", timestamp: new Date(Date.now() - 86400000).toISOString(), fleetId: "fleet-hk-alpha" },
  { id: "ev-stream-007", type: "alert", severity: "critical", title: "Obstacle Collision", description: "SG-BOT-002 collision at Jurong warehouse", timestamp: new Date(Date.now() - 55000).toISOString(), assetId: "sg-004", fleetId: "fleet-sg-log" },
  { id: "ev-stream-008", type: "telemetry", severity: "info", title: "Route Optimized", description: "TKY-AV-001 route recalculated — ETA -4 min improvement", timestamp: new Date(Date.now() - 180000).toISOString(), assetId: "tky-001", fleetId: "fleet-tky-av" },
];

// RISK SCORE SNAPSHOTS (24h chart data per asset)
export function generateRiskHistory(assetId: string, baseScore: number): RiskScoreSnapshot[] {
  return Array.from({ length: 24 }, (_, i) => ({
    assetId,
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    score: Math.max(5, Math.min(100, baseScore + (Math.random() - 0.5) * 20)),
    factors: {
      operatingEnvironment: Math.random() * 30 + 10,
      driverBehavior: Math.random() * 25 + 5,
      vehicleHealth: Math.random() * 20 + 5,
      weatherConditions: Math.random() * 15 + 5,
      trafficDensity: Math.random() * 25 + 5,
    },
  }));
}

// Premium chart data (30d)
export function generatePremiumChartData() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    inflow: 15000 + Math.random() * 25000,
    outflow: 2000 + Math.random() * 8000,
  }));
}

// Utilization patterns per fleet (24h)
export function generateUtilizationData(fleetId: string) {
  const base = fleetId === "fleet-tky-av" ? 85 : fleetId === "fleet-hk-alpha" ? 78 : 72;
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    utilization: Math.max(20, Math.min(100, base + (Math.random() - 0.5) * 30)),
    assets: Math.floor(Math.random() * 5 + 10),
  }));
}

// KPI summary
export const kpiSummary = {
  totalActiveAssets: assets.filter(a => a.status === "active").length,
  protectedAssets: assets.filter(a => a.coveragePolicyId !== undefined).length + 18,
  criticalAlerts: alerts.filter(a => a.severity === "critical" && !a.acknowledged).length,
  claimsInProgress: claims.filter(c => ["submitted", "under_review", "evidence_requested"].includes(c.status)).length,
  reserveCoverageRatio: 3.42,
  premiumAccruedToday: 47820,
};
