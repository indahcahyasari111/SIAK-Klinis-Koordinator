export enum AgentType {
  COORDINATOR = 'COORDINATOR',
  CLINICAL = 'CLINICAL',
  BILLING = 'BILLING',
  OPERATIONAL = 'OPERATIONAL'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachment?: {
    type: 'image';
    data: string; // base64
  };
  isError?: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  uv?: number; // Secondary metric
}

export const AGENT_DESCRIPTIONS = {
  [AgentType.COORDINATOR]: "Pusat Komando & Perutean",
  [AgentType.CLINICAL]: "Rekam Medis & AI Diagnosis",
  [AgentType.BILLING]: "Penagihan, BLU & BPJS",
  [AgentType.OPERATIONAL]: "Jadwal & Operasional RS"
};

export const AGENT_COLORS = {
  [AgentType.COORDINATOR]: "bg-slate-800",
  [AgentType.CLINICAL]: "bg-emerald-600",
  [AgentType.BILLING]: "bg-blue-600",
  [AgentType.OPERATIONAL]: "bg-amber-600"
};