// Data contracts now live in the @anicca/ui design-system library. This module
// re-exports them (so existing `@/data/traffic` type imports keep working) and
// provides the actual seed data + helpers.
import type {
  CameraFeed,
  Metric,
  TableRow,
  VehicleBucket,
  ViolationBucket
} from "@anicca/ui";

export type {
  CameraFeed,
  CountItem,
  Metric,
  TableRow,
  VehicleBucket,
  VideoAnalysis,
  ViolationBucket
} from "@anicca/ui";

// Counts and timelines below are derived from the actual video files in one
// YOLOv8s + ByteTrack pass per clip (sampling every 2nd frame). Each unique
// track is attributed to the time bucket in which it first appears, so the
// per-camera timelines sum to the headline counts. Vehicle / heavy / pedestrian
// counts and the AI confidence score are measured directly. Violation
// breakdowns are video-grounded heuristics: illegal parking = present >=3s with
// near-zero net movement; speed = above a high normalized speed threshold;
// wrong lane = moving against the scene's dominant flow; stop/yield = moving but
// never slowing; infiltration = pedestrians crossing the roadway. Plate strings
// in tableRows are real EasyOCR reads tied to a tracked vehicle; speed is shown
// as "--" because pixel->kmph needs per-camera calibration we do not have.
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
    violations: 20,
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
        { label: "Illegal Parking", value: 20 },
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
    vehicles: 70,
    violations: 13,
    confidence: 62,
    highlight: "Restricted bay activity",
    analysis: {
      pedestrianLaneCrossings: 62,
      heavyMotorVehicles: 11,
      wrongLaneVehicles: 2,
      vehicleClassifications: [
        { label: "Cars", value: 43 },
        { label: "Motorcycles", value: 16 },
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
    vehicles: 54,
    violations: 21,
    confidence: 69,
    highlight: "Plate OCR sample",
    analysis: {
      pedestrianLaneCrossings: 21,
      heavyMotorVehicles: 5,
      wrongLaneVehicles: 3,
      vehicleClassifications: [
        { label: "Cars", value: 37 },
        { label: "Motorcycles", value: 5 },
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

// Real per-camera timelines: vehicle entries bucketed across each clip's
// duration (labels are elapsed time, m:ss).
export const vehicleTimelineByFeed: Record<string, VehicleBucket[]> = {
  "bangalore-flow": [
    { label: "0:00", car: 5, motorcycle: 0, truck: 1, bus: 0, bicycle: 0 },
    { label: "1:24", car: 11, motorcycle: 0, truck: 10, bus: 1, bicycle: 0 },
    { label: "2:49", car: 3, motorcycle: 0, truck: 1, bus: 3, bicycle: 1 },
    { label: "4:13", car: 3, motorcycle: 0, truck: 0, bus: 1, bicycle: 0 },
    { label: "5:38", car: 2, motorcycle: 0, truck: 1, bus: 1, bicycle: 0 },
    { label: "7:02", car: 3, motorcycle: 0, truck: 4, bus: 0, bicycle: 0 },
    { label: "8:27", car: 2, motorcycle: 0, truck: 3, bus: 2, bicycle: 0 },
    { label: "9:51", car: 6, motorcycle: 0, truck: 2, bus: 0, bicycle: 0 }
  ],
  "congestion": [
    { label: "0:00", car: 27, motorcycle: 0, truck: 3, bus: 0, bicycle: 0 },
    { label: "0:04", car: 7, motorcycle: 0, truck: 0, bus: 0, bicycle: 0 },
    { label: "0:08", car: 9, motorcycle: 0, truck: 0, bus: 2, bicycle: 0 },
    { label: "0:12", car: 18, motorcycle: 0, truck: 2, bus: 0, bicycle: 0 },
    { label: "0:16", car: 10, motorcycle: 0, truck: 1, bus: 0, bicycle: 0 },
    { label: "0:21", car: 4, motorcycle: 0, truck: 0, bus: 3, bicycle: 0 },
    { label: "0:25", car: 4, motorcycle: 0, truck: 1, bus: 2, bicycle: 0 },
    { label: "0:29", car: 8, motorcycle: 0, truck: 2, bus: 1, bicycle: 0 }
  ],
  "no-parking": [
    { label: "0:00", car: 6, motorcycle: 2, truck: 2, bus: 0, bicycle: 0 },
    { label: "0:02", car: 4, motorcycle: 1, truck: 0, bus: 1, bicycle: 0 },
    { label: "0:03", car: 3, motorcycle: 2, truck: 1, bus: 0, bicycle: 0 },
    { label: "0:05", car: 5, motorcycle: 1, truck: 1, bus: 0, bicycle: 0 },
    { label: "0:07", car: 2, motorcycle: 1, truck: 2, bus: 0, bicycle: 0 },
    { label: "0:08", car: 7, motorcycle: 4, truck: 2, bus: 0, bicycle: 0 },
    { label: "0:10", car: 11, motorcycle: 5, truck: 1, bus: 0, bicycle: 0 },
    { label: "0:12", car: 5, motorcycle: 0, truck: 0, bus: 1, bicycle: 0 }
  ],
  "plate-capture": [
    { label: "0:00", car: 11, motorcycle: 2, truck: 1, bus: 0, bicycle: 3 },
    { label: "0:02", car: 4, motorcycle: 1, truck: 0, bus: 0, bicycle: 2 },
    { label: "0:05", car: 0, motorcycle: 0, truck: 0, bus: 1, bicycle: 2 },
    { label: "0:07", car: 4, motorcycle: 2, truck: 0, bus: 1, bicycle: 0 },
    { label: "0:10", car: 5, motorcycle: 0, truck: 0, bus: 1, bicycle: 0 },
    { label: "0:12", car: 5, motorcycle: 0, truck: 1, bus: 0, bicycle: 0 },
    { label: "0:14", car: 3, motorcycle: 0, truck: 0, bus: 0, bicycle: 0 },
    { label: "0:17", car: 5, motorcycle: 0, truck: 0, bus: 0, bicycle: 0 }
  ],
  "junction-eight": [
    { label: "0:00", car: 2, motorcycle: 0, truck: 0, bus: 1, bicycle: 0 },
    { label: "0:03", car: 2, motorcycle: 0, truck: 0, bus: 0, bicycle: 0 },
    { label: "0:05", car: 1, motorcycle: 0, truck: 0, bus: 2, bicycle: 0 },
    { label: "0:08", car: 3, motorcycle: 0, truck: 1, bus: 2, bicycle: 0 },
    { label: "0:10", car: 6, motorcycle: 0, truck: 0, bus: 2, bicycle: 0 },
    { label: "0:13", car: 3, motorcycle: 0, truck: 0, bus: 3, bicycle: 0 },
    { label: "0:16", car: 7, motorcycle: 0, truck: 0, bus: 2, bicycle: 0 },
    { label: "0:18", car: 0, motorcycle: 0, truck: 0, bus: 2, bicycle: 0 }
  ]
};

export const violationTimelineByFeed: Record<string, ViolationBucket[]> = {
  "bangalore-flow": [
    { label: "0:00", parking: 3, wrongLane: 0, stop: 0, speed: 0, infiltration: 3 },
    { label: "1:24", parking: 4, wrongLane: 0, stop: 1, speed: 1, infiltration: 0 },
    { label: "2:49", parking: 0, wrongLane: 1, stop: 0, speed: 0, infiltration: 1 },
    { label: "4:13", parking: 0, wrongLane: 1, stop: 0, speed: 2, infiltration: 1 },
    { label: "5:38", parking: 0, wrongLane: 1, stop: 0, speed: 1, infiltration: 3 },
    { label: "7:02", parking: 1, wrongLane: 0, stop: 1, speed: 1, infiltration: 0 },
    { label: "8:27", parking: 1, wrongLane: 0, stop: 0, speed: 0, infiltration: 1 },
    { label: "9:51", parking: 1, wrongLane: 0, stop: 1, speed: 2, infiltration: 0 }
  ],
  "congestion": [
    { label: "0:00", parking: 10, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:04", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:08", parking: 2, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:12", parking: 1, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:16", parking: 4, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:21", parking: 2, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:25", parking: 1, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:29", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 }
  ],
  "no-parking": [
    { label: "0:00", parking: 1, wrongLane: 0, stop: 0, speed: 0, infiltration: 2 },
    { label: "0:02", parking: 0, wrongLane: 1, stop: 0, speed: 0, infiltration: 1 },
    { label: "0:03", parking: 1, wrongLane: 0, stop: 0, speed: 0, infiltration: 1 },
    { label: "0:05", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 3 },
    { label: "0:07", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 1 },
    { label: "0:08", parking: 0, wrongLane: 1, stop: 0, speed: 1, infiltration: 0 },
    { label: "0:10", parking: 0, wrongLane: 0, stop: 0, speed: 2, infiltration: 0 },
    { label: "0:12", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 }
  ],
  "plate-capture": [
    { label: "0:00", parking: 6, wrongLane: 2, stop: 1, speed: 2, infiltration: 3 },
    { label: "0:02", parking: 0, wrongLane: 1, stop: 0, speed: 1, infiltration: 1 },
    { label: "0:05", parking: 0, wrongLane: 0, stop: 0, speed: 1, infiltration: 0 },
    { label: "0:07", parking: 0, wrongLane: 0, stop: 0, speed: 1, infiltration: 1 },
    { label: "0:10", parking: 1, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:12", parking: 1, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:14", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 1 },
    { label: "0:17", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 1 }
  ],
  "junction-eight": [
    { label: "0:00", parking: 0, wrongLane: 1, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:03", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:05", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:08", parking: 0, wrongLane: 0, stop: 1, speed: 0, infiltration: 0 },
    { label: "0:10", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:13", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 },
    { label: "0:16", parking: 0, wrongLane: 0, stop: 0, speed: 1, infiltration: 0 },
    { label: "0:18", parking: 0, wrongLane: 0, stop: 0, speed: 0, infiltration: 0 }
  ]
};

export const tableRows: TableRow[] = [
  {
    feedId: "plate-capture",
    plate: "593YB",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:00 AM",
    ocrConfidence: 0.99
  },
  {
    feedId: "plate-capture",
    plate: "AK396Y",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:08 AM",
    ocrConfidence: 0.96
  },
  {
    feedId: "plate-capture",
    plate: "JEVO7",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:00 AM",
    ocrConfidence: 0.9
  },
  {
    feedId: "plate-capture",
    plate: "BA23717",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:17 AM",
    ocrConfidence: 0.88
  },
  {
    feedId: "plate-capture",
    plate: "KAX639",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:05 AM",
    ocrConfidence: 0.85
  },
  {
    feedId: "plate-capture",
    plate: "KEW0208",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:15 AM",
    ocrConfidence: 0.67
  },
  {
    feedId: "plate-capture",
    plate: "3528E",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:09 AM",
    ocrConfidence: 0.66
  },
  {
    feedId: "plate-capture",
    plate: "A931N9",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:00 AM",
    ocrConfidence: 0.64
  },
  {
    feedId: "plate-capture",
    plate: "A63668",
    vehicle: "Bus",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:09 AM",
    ocrConfidence: 0.64
  },
  {
    feedId: "plate-capture",
    plate: "FEVOZ7",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:01 AM",
    ocrConfidence: 0.63
  },
  {
    feedId: "plate-capture",
    plate: "AS28EY",
    vehicle: "Car",
    violation: "No violation",
    speed: "--",
    camera: "License Plate Capture",
    timestamp: "06/20/2026 09:00:15 AM",
    ocrConfidence: 0.61
  },
  // Market Road (no-parking): two cars detected illegally parked (stationary
  // ~5.7s and ~3.9s). Their plates are not legible at this clip's resolution,
  // so the plate is flagged rather than fabricated.
  {
    feedId: "no-parking",
    plate: "Not legible",
    vehicle: "Car",
    violation: "Illegal parking",
    speed: "--",
    camera: "No Parking Detection",
    timestamp: "06/20/2026 09:00:00 AM",
    ocrConfidence: 0
  },
  {
    feedId: "no-parking",
    plate: "Not legible",
    vehicle: "Car",
    violation: "Illegal parking",
    speed: "--",
    camera: "No Parking Detection",
    timestamp: "06/20/2026 09:00:04 AM",
    ocrConfidence: 0
  }
];
