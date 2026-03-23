export type Role = "admin" | "operator" | "analyst" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  operatorId?: string;
}

export interface Operator {
  id: string;
  name: string;
  country: string;
  contactEmail: string;
  fleetIds: string[];
}

export type AssetType = "robot" | "ev" | "av";
export type AssetStatus = "active" | "idle" | "warning" | "critical" | "offline";
export type Geography = "hong_kong" | "shenzhen" | "tokyo" | "singapore";

export interface Fleet {
  id: string;
  name: string;
  operatorId: string;
  geography: Geography;
  assetCount: number;
  healthScore: number;
  coverageRatio: number;
  premiumMonthly: number;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  fleetId: string;
  status: AssetStatus;
  lat: number;
  lng: number;
  riskScore: number;
  batteryLevel: number;
  healthPercent: number;
  operatingHours: number;
  lastEvent: string;
  lastEventTime: string;
  coveragePolicyId?: string;
  premiumBurnRate: number; // HKD/hour
  geography: Geography;
}

export interface RobotAsset extends Asset {
  type: "robot";
  robotModel: string;
  payloadCapacity: number;
  sensorArray: string[];
}

export interface EVAsset extends Asset {
  type: "ev";
  vehicleModel: string;
  range: number;
  chargeStatus: "charging" | "discharging" | "idle";
}

export interface AVAsset extends Asset {
  type: "av";
  autonomyLevel: number; // SAE level 0-5
  passengerCapacity: number;
  safetyScore: number;
}

export interface TelemetryEvent {
  id: string;
  assetId: string;
  timestamp: string;
  type: "position" | "battery" | "collision" | "fault" | "anomaly" | "heartbeat" | "speed" | "sensor";
  value: number | string;
  unit?: string;
  severity: "info" | "warning" | "critical";
}

export type AlertType = "collision" | "battery_critical" | "fault_detected" | "anomaly" | "geofence_breach" | "system_failure";
export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface Alert {
  id: string;
  assetId: string;
  fleetId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  resolvedAt?: string;
}

export interface RiskScoreSnapshot {
  assetId: string;
  timestamp: string;
  score: number;
  factors: {
    operatingEnvironment: number;
    driverBehavior: number;
    vehicleHealth: number;
    weatherConditions: number;
    trafficDensity: number;
  };
}

export interface CoveragePolicy {
  id: string;
  assetId: string;
  fleetId: string;
  coverageType: "comprehensive" | "third_party" | "collision" | "parametric";
  startDate: string;
  endDate: string;
  premiumMonthly: number;
  coverageLimit: number;
  deductible: number;
  status: "active" | "pending" | "expired" | "suspended";
  riskMultiplier: number;
}

export interface PricingPlan {
  id: string;
  name: string;
  baseRate: number;
  riskMultiplier: number;
  coverageTypes: string[];
  minRiskScore: number;
  maxRiskScore: number;
}

export interface PremiumTransaction {
  id: string;
  policyId: string;
  assetId: string;
  fleetId: string;
  amount: number;
  currency: string;
  timestamp: string;
  type: "accrual" | "payment" | "refund" | "adjustment";
  period: string;
}

export interface ReservePool {
  id: string;
  name: string;
  type: "first_loss" | "shared";
  balance: number;
  currency: string;
  utilizationPct: number;
  maxCapacity: number;
  allocations: PoolAllocation[];
}

export interface PoolAllocation {
  id: string;
  poolId: string;
  fleetId: string;
  amount: number;
  allocationPct: number;
  purpose: string;
}

export type ClaimStatus = "submitted" | "under_review" | "evidence_requested" | "approved" | "rejected" | "paid";
export type ClaimSeverity = "minor" | "moderate" | "major" | "catastrophic";

export interface Claim {
  id: string;
  assetId: string;
  fleetId: string;
  policyId: string;
  alertId?: string;
  status: ClaimStatus;
  severity: ClaimSeverity;
  title: string;
  description: string;
  submittedAt: string;
  updatedAt: string;
  estimatedLoss: number;
  approvedAmount?: number;
  currency: string;
  evidenceIds: string[];
  payoutId?: string;
}

export interface ClaimEvidence {
  id: string;
  claimId: string;
  type: "telemetry_snapshot" | "video_clip" | "sensor_log" | "gps_trace" | "photo";
  url?: string;
  description: string;
  uploadedAt: string;
  verified: boolean;
}

export interface Payout {
  id: string;
  claimId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  initiatedAt: string;
  completedAt?: string;
  poolId: string;
  transactionRef: string;
}

export interface TreasuryMovement {
  id: string;
  poolId: string;
  type: "premium_inflow" | "claim_payout" | "reserve_top_up" | "yield" | "withdrawal";
  amount: number;
  currency: string;
  timestamp: string;
  description: string;
  balanceAfter: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

export interface EventStreamEntry {
  id: string;
  type: "alert" | "claim" | "payout" | "telemetry" | "reserve";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  timestamp: string;
  assetId?: string;
  fleetId?: string;
}
