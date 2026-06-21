// Shared data contracts for the Anicca UI components. The library owns the
// component + type contracts; the host app provides the data.

export type CameraFeed = {
  id: string;
  title: string;
  area: string;
  file: string;
  format: "mp4" | "mov" | "avi";
  status: "Live" | "Review";
  vehicles: number;
  violations: number;
  confidence: number;
  highlight: string;
  analysis: VideoAnalysis;
  analyzedAt?: string;
};

export type Metric = {
  label: string;
  value: number;
  tone: "rose" | "amber" | "emerald" | "blue";
  // percent difference vs the fleet average for this metric (computed by the host)
  delta?: number;
};

export type CountItem = {
  label: string;
  value: number;
};

export type VideoAnalysis = {
  pedestrianLaneCrossings: number;
  heavyMotorVehicles: number;
  wrongLaneVehicles: number;
  vehicleClassifications: CountItem[];
  violationSummary: CountItem[];
};

export type TableRow = {
  feedId: CameraFeed["id"];
  plate: string;
  vehicle: string;
  violation: string;
  speed: string;
  camera: string;
  timestamp: string;
  ocrConfidence: number;
};

export type VehicleBucket = {
  label: string;
  car: number;
  motorcycle: number;
  truck: number;
  bus: number;
  bicycle: number;
};

export type ViolationBucket = {
  label: string;
  parking: number;
  wrongLane: number;
  stop: number;
  speed: number;
  infiltration: number;
};
