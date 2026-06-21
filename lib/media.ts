// App-owned media URL helpers (the Next API route + public posters live here,
// not in the design-system library).
export function videoSource(file: string) {
  return `/api/video/${encodeURIComponent(file)}`;
}

export function posterSource(file: string) {
  return `/posters/${encodeURIComponent(file)}.jpg`;
}
