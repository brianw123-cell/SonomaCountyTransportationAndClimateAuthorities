import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {/* Header */}
        <header className="bg-[#1a472a] text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
              <div>
                <Link href="/" className="hover:opacity-90 transition-opacity">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    SCTCA Climate Action Tracker
                  </h1>
                  <p className="text-green-200 text-sm mt-0.5">
                    Sonoma County Transportation and Climate Authorities
                  </p>
                </Link>
              </div>
              <nav className="mt-3 sm:mt-0 flex gap-6 text-sm font-medium">
                <Link
                  href="/"
                  className="hover:text-green-200 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/organizations"
                  className="hover:text-green-200 transition-colors"
                >
                  Organizations
                </Link>
                <Link
                  href="/documents"
                  className="hover:text-green-200 transition-colors"
                >
                  Documents
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-[#1a472a] text-green-200 text-center py-4 text-sm">
          <p>Proof of Concept &mdash; Petaluma MVP</p>
        </footer>
      </body>
    </html>
  );
}
