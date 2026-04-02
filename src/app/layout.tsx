import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import NavLinks from "@/components/NavLinks";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SCTCA Climate Action Tracker",
  description:
    "Sonoma County Transportation and Climate Authorities - Climate Action Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-[#313131]">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top row: logo + title */}
            <div className="flex items-center gap-4 pt-3 pb-2">
              <Link href="/" className="hover:opacity-90 transition-opacity flex items-center gap-3">
                <Image
                  src="https://sctca.ca.gov/wp-content/uploads/2025/10/SCTCA-2025-full-color400.png"
                  alt="SCTCA Logo"
                  width={160}
                  height={48}
                  className="h-auto w-[140px] sm:w-[160px]"
                  priority
                />
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#8ccacf]">
                  Climate Action Tracker
                </h1>
              </Link>
              <span className="ml-auto text-lg sm:text-xl font-bold tracking-widest text-[#8ccacf]">
                BETA
              </span>
            </div>
            {/* Nav row: full width below logo */}
            <div className="pb-2 -mx-1 overflow-x-auto">
              <NavLinks />
            </div>
          </div>
        </header>

        {/* Orange accent line */}
        <div className="h-[1px] bg-[#e75425]" />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-[#8ccacf] text-white text-center py-8 text-sm">
          <p className="font-semibold text-base">SCTCA Climate Action Tracker</p>
          <p className="mt-1 opacity-90">Proof of Concept &mdash; Petaluma MVP</p>
          <div className="mt-3 w-16 h-[2px] bg-[#f3d597] mx-auto" />
          <p className="mt-3 opacity-80">
            411 King Street, Santa Rosa, CA 95404 | 707.565.5373
          </p>
        </footer>
      </body>
    </html>
  );
}
