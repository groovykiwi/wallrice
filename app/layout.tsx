import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Victor_Mono, Inter } from "next/font/google";
import "./globals.css";

const victorMono = Victor_Mono({
  subsets: ["latin"],
  variable: "--font-victor-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "WallRice",
  description:
    "WallRice is a small utility to colorize your wallpapers with your own color palettes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${victorMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
