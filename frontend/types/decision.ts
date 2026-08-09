// types/decision.ts

export interface SafetyCheck {
  is_safe: boolean;
  reason: string;
  min_safe_temp: number;
  max_safe_temp: number;
  storage_temp: number | null;
}

export interface RiskInfo {
  inventory_kg: number;
  expected_demand_kg: number;
  at_risk_kg: number;
  excess_percentage: number;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export interface ActionEvaluation {
  net_value: number;
  waste_kg: number;
  feasible: boolean;
  reason: string;
}

export interface Recommendation {
  action: string;
  net_value: number;
  waste_kg: number;
  reason: string;
}

export interface DecisionResponse {
  batch_id: number;
  batch_identifier: string;
  commodity: string;           // 🟢 Mango → Amber, Avocado → Green, etc.
  variety: string;
  location: string;
  remaining_life_days: number;
  quality_index: number;
  current_temperature: number | null;
  risk: RiskInfo;
  safety_check: SafetyCheck;
  actions: Record<string, ActionEvaluation>;
  recommendation: Recommendation | null;
  explanation: string;
}