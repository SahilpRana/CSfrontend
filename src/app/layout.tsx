import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarbonSync - AI-Powered Location Intelligence",
  description: "Advanced AI-powered location intelligence that analyzes environmental, economic, and social factors to identify optimal locations for any region and time period.",
  keywords: ["AI", "location intelligence", "carbon footprint", "climate analysis", "business location", "environmental data"],
  authors: [{ name: "CarbonSync Team" }],
  openGraph: {
    title: "CarbonSync - AI-Powered Location Intelligence",
    description: "Discover optimal locations with advanced AI analysis of environmental, economic, and social factors.",
    type: "website",
    siteName: "CarbonSync",
  },
  twitter: {
    card: "summary_large_image",
    title: "CarbonSync - AI-Powered Location Intelligence",
    description: "Discover optimal locations with advanced AI analysis of environmental, economic, and social factors.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-white`}
      >
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}