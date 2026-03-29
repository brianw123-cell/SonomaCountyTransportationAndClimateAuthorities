"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Funding {
  fnd_id: string;
  fnd_name: string;
  fnd_amount: number | null;
  fnd_source: string | null;
  fnd_type: string | null;
  fnd_start: string | null;
  fnd_end: string | null;
  fnd_status: string | null;
  fnd_url: string | null;
  fnd_notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  Open: "bg-green-100 text-green-800",
  Active: "bg-[#8ccacf]/20 text-[#2a8a8f]",
  Upcoming: "bg-[#f3d597]/40 text-[#8a6d1b]",
  Closed: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "Unknown";
  const colors = STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors}`}>
      {s}
    </span>
  );
}

function formatCurrency(amount: number | null): string {
  if (amount == null) return "TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function FundingPage() {
  const [funding, setFunding] = useState<Funding[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    async function fetchFunding() {
      const { data, error } = await supabase
        .from("funding")
        .select("*")
        .order("fnd_name");
      if (!error && data) setFunding(data);
      setLoading(false);
    }
    fetchFunding();
  }, []);

  const statuses = ["All", ...Array.from(new Set(funding.map((f) => f.fnd_status ?? "Unknown")))];

  const filtered =
    activeFilter === "All"
      ? funding
      : funding.filter((f) => (f.fnd_status ?? "Unknown") === activeFilter);

  return (
    <div>
      {/* Hero -- compact */}
      <section className="bg-[#8ccacf] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Climate Funding Tracker
          </h2>
          <p className="mt-1 text-sm text-white/80 font-medium">
            Available funding resources and opportunities
          </p>
          <div className="mt-2 w-12 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading funding data...</div>
        ) : funding.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8ccacf]/10 mb-4">
              <svg className="w-8 h-8 text-[#8ccacf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#313131]">No funding records yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Funding opportunities will be added by SCTCA staff as they become available.
            </p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-[#8ccacf]">{funding.length}</p>
                <p className="text-xs text-gray-500 font-medium">Total Sources</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {funding.filter((f) => f.fnd_status === "Open").length}
                </p>
                <p className="text-xs text-gray-500 font-medium">Open</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-[#2a8a8f]">
                  {funding.filter((f) => f.fnd_status === "Active").length}
                </p>
                <p className="text-xs text-gray-500 font-medium">Active</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-[#e75425]">
                  {formatCurrency(
                    funding.reduce((sum, f) => sum + (f.fnd_amount ?? 0), 0)
                  )}
                </p>
                <p className="text-xs text-gray-500 font-medium">Total Funding</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    activeFilter === s
                      ? "bg-[#8ccacf] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#8ccacf]/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Funding cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((f) => (
                <div
                  key={f.fnd_id}
                  className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-[#313131] text-sm leading-tight">
                      {f.fnd_name}
                    </h3>
                    <StatusBadge status={f.fnd_status} />
                  </div>

                  <p className="text-2xl font-bold text-[#8ccacf] mb-2">
                    {formatCurrency(f.fnd_amount)}
                  </p>

                  {f.fnd_source && (
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-medium text-gray-600">Source:</span> {f.fnd_source}
                    </p>
                  )}
                  {f.fnd_type && (
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-medium text-gray-600">Type:</span> {f.fnd_type}
                    </p>
                  )}
                  {(f.fnd_start || f.fnd_end) && (
                    <p className="text-xs text-gray-500 mb-1">
                      <span className="font-medium text-gray-600">Period:</span>{" "}
                      {formatDate(f.fnd_start)}
                      {f.fnd_start && f.fnd_end ? " - " : ""}
                      {formatDate(f.fnd_end)}
                    </p>
                  )}
                  {f.fnd_notes && (
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{f.fnd_notes}</p>
                  )}

                  {f.fnd_url && (
                    <a
                      href={f.fnd_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 text-xs font-medium text-[#8ccacf] hover:text-[#6ab0b5] transition-colors"
                    >
                      View Details &rarr;
                    </a>
                  )}
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm">
                No funding sources match the selected filter.
              </p>
            )}
          </>
        )}
      </section>

      {/* Footer note */}
      <div className="text-center text-xs text-gray-400 pb-6">Powered by Supabase</div>
    </div>
  );
}
