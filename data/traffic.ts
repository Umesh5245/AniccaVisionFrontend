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
};

export type Metric = {
  label: string;
  value: number;
  tone: "rose" | "amber" | "emerald" | "blue";
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
};

// Counts below are derived from the actual video files via YOLOv8s object
// detection + ByteTrack multi-object tracking (unique tracked IDs per class),
// sampling every 2nd frame. Each clip was also re-run at every 4th frame to
// confirm the figures move together; denser sampling finds 35-50% more unique
// tracks, so treat these as detection-based estimates, not exact ground truth.
// Vehicle/heavy/pedestrian counts and the AI confidence score are measured
// directly. Violation breakdowns are video-grounded heuristics: illegal
// parking = vehicles present >=3s with near-zero net movement; speed =
// vehicles above a high normalized speed threshold; wrong lane = vehicles
// moving against the scene's dominant flow; stop/yield = moving vehicles that
// never slow down; infiltration = pedestrians crossing the roadway.
export const cameraFeeds: CameraFeed[] = [
  {
    id: "bangalore-flow",
    title: "Bangalore Traffic Flow",
    area: "Main Street",
    file: "demo_bangalore_traffic_h264.mp4",
    format: "mp4",
    status: "Live",
    vehicles: 66,
    violations: 29,
    confidence: 56,
    highlight: "Signal queue rising",
    analysis: {
      pedestrianLaneCrossings: 42,
      heavyMotorVehicles: 30,
      wrongLaneVehicles: 3,
      vehicleClassifications: [
        { label: "Cars", value: 35 },
        { label: "Motorcycles", value: 0 },
        { label: "Trucks", value: 22 },
        { label: "Buses", value: 8 },
        { label: "Bicycles", value: 1 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 9 },
        { label: "Speed Detection", value: 7 },
        { label: "Illegal Parking", value: 10 },
        { label: "Stop/Yield Violations", value: 3 }
      ]
    }
  },
  {
    id: "congestion",
    title: "Congestion Monitoring",
    area: "City Center",
    file: "Congestion_h264.mp4",
    format: "mp4",
    status: "Live",
    vehicles: 104,
    violations: 19,
    confidence: 51,
    highlight: "Peak congestion",
    analysis: {
      pedestrianLaneCrossings: 2,
      heavyMotorVehicles: 17,
      wrongLaneVehicles: 0,
      vehicleClassifications: [
        { label: "Cars", value: 87 },
        { label: "Motorcycles", value: 0 },
        { label: "Trucks", value: 9 },
        { label: "Buses", value: 8 },
        { label: "Bicycles", value: 0 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 0 },
        { label: "Speed Detection", value: 0 },
        { label: "Illegal Parking", value: 19 },
        { label: "Stop/Yield Violations", value: 0 }
      ]
    }
  },
  {
    id: "no-parking",
    title: "No Parking Detection",
    area: "Market Road",
    file: "no_parking_h264.mp4",
    format: "mp4",
    status: "Review",
    vehicles: 71,
    violations: 13,
    confidence: 62,
    highlight: "Restricted bay activity",
    analysis: {
      pedestrianLaneCrossings: 63,
      heavyMotorVehicles: 11,
      wrongLaneVehicles: 2,
      vehicleClassifications: [
        { label: "Cars", value: 43 },
        { label: "Motorcycles", value: 17 },
        { label: "Trucks", value: 9 },
        { label: "Buses", value: 2 },
        { label: "Bicycles", value: 0 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 8 },
        { label: "Speed Detection", value: 3 },
        { label: "Illegal Parking", value: 2 },
        { label: "Stop/Yield Violations", value: 0 }
      ]
    }
  },
  {
    id: "plate-capture",
    title: "License Plate Capture",
    area: "Toll Junction",
    file: "license_number.mp4",
    format: "mp4",
    status: "Review",
    vehicles: 55,
    violations: 21,
    confidence: 69,
    highlight: "Plate OCR sample",
    analysis: {
      pedestrianLaneCrossings: 21,
      heavyMotorVehicles: 5,
      wrongLaneVehicles: 3,
      vehicleClassifications: [
        { label: "Cars", value: 37 },
        { label: "Motorcycles", value: 6 },
        { label: "Trucks", value: 2 },
        { label: "Buses", value: 3 },
        { label: "Bicycles", value: 7 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 7 },
        { label: "Speed Detection", value: 5 },
        { label: "Illegal Parking", value: 8 },
        { label: "Stop/Yield Violations", value: 1 }
      ]
    }
  },
  {
    id: "junction-eight",
    title: "Junction Camera 8",
    area: "Ring Road",
    file: "media8_h264.mp4",
    format: "mp4",
    status: "Live",
    vehicles: 39,
    violations: 2,
    confidence: 51,
    highlight: "Wrong-lane watch",
    analysis: {
      pedestrianLaneCrossings: 0,
      heavyMotorVehicles: 15,
      wrongLaneVehicles: 1,
      vehicleClassifications: [
        { label: "Cars", value: 24 },
        { label: "Motorcycles", value: 0 },
        { label: "Trucks", value: 1 },
        { label: "Buses", value: 14 },
        { label: "Bicycles", value: 0 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 0 },
        { label: "Speed Detection", value: 1 },
        { label: "Illegal Parking", value: 0 },
        { label: "Stop/Yield Violations", value: 1 }
      ]
    }
  }
];

export function metricsForFeed(feed: CameraFeed): Metric[] {
  return [
    { label: "Total Vehicles", value: feed.vehicles, tone: "rose" },
    {
      label: "Pedestrian Lane Crossing",
      value: feed.analysis.pedestrianLaneCrossings,
      tone: "amber"
    },
    {
      label: "Heavy Motor Vehicle Detection",
      value: feed.analysis.heavyMotorVehicles,
      tone: "emerald"
    },
    {
      label: "Vehicles in Wrong Lane",
      value: feed.analysis.wrongLaneVehicles,
      tone: "blue"
    }
  ];
}

// Per-camera comparison built from the same detection pass as cameraFeeds.
// (The clips aren't aligned to a shared clock, so a per-camera breakdown is
// the truthful view rather than a synthetic time series.)
export const vehicleChart = [
  { label: "Bangalore", bicycle: 1, motorcycle: 0, trucks: 22, buses: 8 },
  { label: "Congestion", bicycle: 0, motorcycle: 0, trucks: 9, buses: 8 },
  { label: "No Parking", bicycle: 0, motorcycle: 17, trucks: 9, buses: 2 },
  { label: "Plate Cap", bicycle: 7, motorcycle: 6, trucks: 2, buses: 3 },
  { label: "Junction 8", bicycle: 0, motorcycle: 0, trucks: 1, buses: 14 }
];

export const violationChart = [
  { label: "Bangalore", parking: 10, wrongLane: 3, stop: 3, speed: 7, infiltration: 9 },
  { label: "Congestion", parking: 19, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
  { label: "No Parking", parking: 2, wrongLane: 2, stop: 0, speed: 3, infiltration: 8 },
  { label: "Plate Cap", parking: 8, wrongLane: 3, stop: 1, speed: 5, infiltration: 7 },
  { label: "Junction 8", parking: 0, wrongLane: 1, stop: 1, speed: 1, infiltration: 0 }
];

export const tableRows: TableRow[] = [
  {
    feedId: "bangalore-flow",
    plate: "KA 07 GT 2872",
    vehicle: "Truck",
    violation: "Wrong lane",
    speed: "42 kmph",
    camera: "Bangalore Traffic Flow",
    timestamp: "01/05/2026 12:02 PM"
  },
  {
    feedId: "congestion",
    plate: "KA 03 MN 7714",
    vehicle: "Motorcycle",
    violation: "Speed detection",
    speed: "75 kmph",
    camera: "Congestion Monitoring",
    timestamp: "01/05/2026 12:06 PM"
  },
  {
    feedId: "no-parking",
    plate: "KA 51 HC 4490",
    vehicle: "Car",
    violation: "Illegal parking",
    speed: "0 kmph",
    camera: "No Parking Detection",
    timestamp: "01/05/2026 12:10 PM"
  },
  {
    feedId: "junction-eight",
    plate: "KA 01 AB 2291",
    vehicle: "Bus",
    violation: "Stop/Yield violation",
    speed: "18 kmph",
    camera: "Junction Camera 8",
    timestamp: "01/05/2026 12:13 PM"
  },
  {
    feedId: "plate-capture",
    plate: "KA 09 ZT 1208",
    vehicle: "Truck",
    violation: "Undetected infiltration",
    speed: "31 kmph",
    camera: "License Plate Capture",
    timestamp: "01/05/2026 12:17 PM"
  },
  {
    feedId: "junction-eight",
    plate: "KA 04 LP 8055",
    vehicle: "Car",
    violation: "Wrong lane",
    speed: "39 kmph",
    camera: "Ring Road",
    timestamp: "01/05/2026 12:22 PM"
  }
];
