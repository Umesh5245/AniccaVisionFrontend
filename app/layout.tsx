import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anicca Vision Traffic Analytics",
  description: "Traffic analytics dashboard for video-based road monitoring"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f3f7fb] font-sans text-slate-950">{children}</body>
    </html>
  );
}
