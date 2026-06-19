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
  value: string;
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
    highlight: "Signal queue rising",
    analysis: {
      pedestrianLaneCrossings: 1,
      heavyMotorVehicles: 12,
      wrongLaneVehicles: 9,
      vehicleClassifications: [
        { label: "Buses", value: 4 },
        { label: "Cars", value: 395 },
        { label: "Trucks", value: 383 },
        { label: "Bicycles", value: 3 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 2 },
        { label: "Speed Detection", value: 1 },
        { label: "Illegal Parking", value: 0 },
        { label: "Stop/Yield Violations", value: 9 }
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
    vehicles: 384,
    violations: 26,
    confidence: 91,
    highlight: "Peak congestion",
    analysis: {
      pedestrianLaneCrossings: 42,
      heavyMotorVehicles: 31,
      wrongLaneVehicles: 26,
      vehicleClassifications: [
        { label: "Buses", value: 13 },
        { label: "Motorcycles", value: 172 },
        { label: "Trucks", value: 18 },
        { label: "Bicycles", value: 6 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 6 },
        { label: "Speed Detection", value: 3 },
        { label: "Illegal Parking", value: 1 },
        { label: "Stop/Yield Violations", value: 16 }
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
    vehicles: 74,
    violations: 31,
    confidence: 89,
    highlight: "Restricted bay activity",
    analysis: {
      pedestrianLaneCrossings: 4,
      heavyMotorVehicles: 5,
      wrongLaneVehicles: 3,
      vehicleClassifications: [
        { label: "Buses", value: 1 },
        { label: "Motorcycles", value: 18 },
        { label: "Trucks", value: 4 },
        { label: "Bicycles", value: 2 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 1 },
        { label: "Speed Detection", value: 2 },
        { label: "Illegal Parking", value: 25 },
        { label: "Stop/Yield Violations", value: 3 }
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
    vehicles: 97,
    violations: 8,
    confidence: 86,
    highlight: "Plate OCR sample",
    analysis: {
      pedestrianLaneCrossings: 0,
      heavyMotorVehicles: 8,
      wrongLaneVehicles: 2,
      vehicleClassifications: [
        { label: "Buses", value: 2 },
        { label: "Motorcycles", value: 24 },
        { label: "Trucks", value: 6 },
        { label: "Bicycles", value: 1 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 1 },
        { label: "Speed Detection", value: 3 },
        { label: "Illegal Parking", value: 0 },
        { label: "Stop/Yield Violations", value: 4 }
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
    vehicles: 216,
    violations: 17,
    confidence: 92,
    highlight: "Wrong-lane watch",
    analysis: {
      pedestrianLaneCrossings: 0,
      heavyMotorVehicles: 12,
      wrongLaneVehicles: 17,
      vehicleClassifications: [
        { label: "Buses", value: 3 },
        { label: "Motorcycles", value: 28 },
        { label: "Trucks", value: 9 },
        { label: "Bicycles", value: 0 }
      ],
      violationSummary: [
        { label: "Undetected Infiltrations", value: 3 },
        { label: "Speed Detection", value: 7 },
        { label: "Illegal Parking", value: 0 },
        { label: "Stop/Yield Violations", value: 7 }
      ]
    }
  }
];

export function metricsForFeed(feed: CameraFeed): Metric[] {
  return [
    { label: "Total Vehicles", value: feed.vehicles.toLocaleString("en-US"), tone: "rose" },
    {
      label: "Pedestrian Lane Crossing",
      value: feed.analysis.pedestrianLaneCrossings.toLocaleString("en-US"),
      tone: "amber"
    },
    {
      label: "Heavy Motor Vehicle Detection",
      value: feed.analysis.heavyMotorVehicles.toLocaleString("en-US"),
      tone: "emerald"
    },
    {
      label: "Vehicles in Wrong Lane",
      value: feed.analysis.wrongLaneVehicles.toLocaleString("en-US"),
      tone: "blue"
    }
  ];
}

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
