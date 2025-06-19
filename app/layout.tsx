import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WallRice",
  description:
    "WallRice is a modern web app to transform your images with beautiful color palettes. Upload, select colors, and create stunning colorized wallpapers in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
