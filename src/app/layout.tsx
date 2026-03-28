import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
              <div className="flex items-center gap-4">
                <Link href="/" className="hover:opacity-90 transition-opacity flex items-center gap-4">
                  <Image
                    src="https://sctca.ca.gov/wp-content/uploads/2025/10/SCTCA-2025-full-color400.png"
                    alt="SCTCA Logo"
                    width={200}
                    height={60}
                    className="h-auto w-[200px]"
                    priority
                  />
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#313131]">
                    Climate Action Tracker
                  </h1>
                </Link>
              </div>
              <nav className="mt-3 sm:mt-0 flex gap-6 text-sm font-medium">
                <Link
                  href="/"
                  className="text-[#313131] hover:text-[#8ccacf] active:text-[#e75425] transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/organizations"
                  className="text-[#313131] hover:text-[#8ccacf] active:text-[#e75425] transition-colors"
                >
                  Organizations
                </Link>
                <Link
                  href="/documents"
                  className="text-[#313131] hover:text-[#8ccacf] active:text-[#e75425] transition-colors"
                >
                  Documents
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Orange accent line */}
        <div className="h-[1px] bg-[#e75425]" />

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-[#8ccacf] to-[#f3d597] text-white text-center py-6 text-sm">
          <p className="font-medium">Proof of Concept &mdash; Petaluma MVP</p>
          <p className="mt-1 opacity-90">
            411 King Street, Santa Rosa, CA 95404 | 707.565.5373
          </p>
        </footer>
      </body>
    </html>
  );
}
