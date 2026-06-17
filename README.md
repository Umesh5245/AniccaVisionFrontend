# Anicca Vision Traffic Dashboard

Traffic analytics dashboard built with Next.js, React, Tailwind CSS, and TypeScript.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The app opens with a login screen. The form is prefilled with demo access:

```text
admin@aniccavision.ai
traffic123
```

Any non-empty email and password will sign in for this prototype.

## Assets

The app streams the uploaded videos from the existing `videos` folder through:

```text
/api/video/[filename]
```

The wireframe images in `wireframe` were used as the layout reference.

Browser-ready H.264 MP4 copies were created for playback:

```text
videos/demo_bangalore_traffic_h264.mp4
videos/Congestion_h264.mp4
videos/no_parking_h264.mp4
videos/license_number.mp4
videos/media8_h264.mp4
```
