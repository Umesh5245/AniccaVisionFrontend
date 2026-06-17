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
};

export type Metric = {
  label: string;
  value: string;
  tone: "rose" | "amber" | "emerald" | "blue";
};

export type TableRow = {
  plate: string;
  vehicle: string;
  violation: string;
  speed: string;
  camera: string;
  timestamp: string;
};

export const cameraFeeds: CameraFeed[] = [
  {
    id: "bangalore-flow",
    title: "Bangalore Traffic Flow",
    area: "Main Street",
    file: "demo_bangalore_traffic_h264.mp4",
    format: "mp4",
    status: "Live",
    vehicles: 128,
    violations: 12,
    confidence: 94,
    highlight: "Signal queue rising"
  },
  {
    id: "congestion",
    title: "Congestion Monitoring",
    area: "City Center",
    file: "Congestion_h264.mp4",
    format: "mp4",
    status: "Live",
    vehicles: 384,
    violations: 26,
    confidence: 91,
    highlight: "Peak congestion"
  },
  {
    id: "no-parking",
    title: "No Parking Detection",
    area: "Market Road",
    file: "no_parking_h264.mp4",
    format: "mp4",
    status: "Review",
    vehicles: 74,
    violations: 31,
    confidence: 89,
    highlight: "Restricted bay activity"
  },
  {
    id: "plate-capture",
    title: "License Plate Capture",
    area: "Toll Junction",
    file: "license_number.mp4",
    format: "mp4",
    status: "Review",
    vehicles: 97,
    violations: 8,
    confidence: 86,
    highlight: "Plate OCR sample"
  },
  {
    id: "junction-eight",
    title: "Junction Camera 8",
    area: "Ring Road",
    file: "media8_h264.mp4",
    format: "mp4",
    status: "Live",
    vehicles: 216,
    violations: 17,
    confidence: 92,
    highlight: "Wrong-lane watch"
  }
];

export const metrics: Metric[] = [
  { label: "Total Vehicles", value: "899", tone: "rose" },
  { label: "Pedestrian Lane Crossing", value: "30", tone: "amber" },
  { label: "Heavy Motor Vehicle Detection", value: "84", tone: "emerald" },
  { label: "Vehicles in Wrong Lane", value: "41", tone: "blue" }
];

export const vehicleClassifications = [
  { label: "Buses", value: 42 },
  { label: "Motorcycles", value: 118 },
  { label: "Trucks", value: 65 },
  { label: "Bicycles", value: 23 }
];

export const violationSummary = [
  { label: "Undetected Infiltrations", value: 14 },
  { label: "Speed Detection", value: 28 },
  { label: "Illegal Parking", value: 31 },
  { label: "Stop/Yield Violations", value: 19 }
];

export const vehicleChart = [
  { label: "1:00", bicycle: 12, motorcycle: 5, trucks: 8, buses: 17 },
  { label: "1:15", bicycle: 18, motorcycle: 6, trucks: 15, buses: 9 },
  { label: "1:30", bicycle: 13, motorcycle: 9, trucks: 22, buses: 11 },
  { label: "1:45", bicycle: 18, motorcycle: 10, trucks: 5, buses: 8 }
];

export const violationChart = [
  { label: "1:00", parking: 11, wrongLane: 9, stop: 10, speed: 3, infiltration: 2 },
  { label: "1:15", parking: 12, wrongLane: 20, stop: 8, speed: 4, infiltration: 1 },
  { label: "1:30", parking: 15, wrongLane: 34, stop: 11, speed: 8, infiltration: 5 },
  { label: "1:45", parking: 19, wrongLane: 28, stop: 7, speed: 6, infiltration: 8 }
];

export const tableRows: TableRow[] = [
  {
    plate: "KA 07 GT 2872",
    vehicle: "Truck",
    violation: "Wrong lane",
    speed: "42 kmph",
    camera: "Bangalore Traffic Flow",
    timestamp: "01/05/2026 12:02 PM"
  },
  {
    plate: "KA 03 MN 7714",
    vehicle: "Motorcycle",
    violation: "Speed detection",
    speed: "75 kmph",
    camera: "Congestion Monitoring",
    timestamp: "01/05/2026 12:06 PM"
  },
  {
    plate: "KA 51 HC 4490",
    vehicle: "Car",
    violation: "Illegal parking",
    speed: "0 kmph",
    camera: "No Parking Detection",
    timestamp: "01/05/2026 12:10 PM"
  },
  {
    plate: "KA 01 AB 2291",
    vehicle: "Bus",
    violation: "Stop/Yield violation",
    speed: "18 kmph",
    camera: "Junction Camera 8",
    timestamp: "01/05/2026 12:13 PM"
  },
  {
    plate: "KA 09 ZT 1208",
    vehicle: "Truck",
    violation: "Undetected infiltration",
    speed: "31 kmph",
    camera: "License Plate Capture",
    timestamp: "01/05/2026 12:17 PM"
  },
  {
    plate: "KA 04 LP 8055",
    vehicle: "Car",
    violation: "Wrong lane",
    speed: "39 kmph",
    camera: "Ring Road",
    timestamp: "01/05/2026 12:22 PM"
  }
];
