"use client";

import Link from "next/link";
import { useState } from "react";

interface EnrichedSummary {
  jurisdiction: string;
  latestYear: number;
  latestTotal: number;
  baselineTotal: number;
  changePercent: number;
  dominantSector: string;
  perCapita: number | null;
}

type SortKey = "jurisdiction" | "baselineTotal" | "latestTotal" | "changePercent" | "dominantSector" | "perCapita";

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}

export default function CompareClient({ summaries }: { summaries: EnrichedSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("latestTotal");
  const [sortAsc, setSortAsc] = useState(false);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "jurisdiction");
    }
  }

  const sorted = [...summaries].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "jurisdiction":
        cmp = a.jurisdiction.localeCompare(b.jurisdiction);
        break;
      case "baselineTotal":
        cmp = a.baselineTotal - b.baselineTotal;
        break;
      case "latestTotal":
        cmp = a.latestTotal - b.latestTotal;
        break;
      case "changePercent":
        cmp = a.changePercent - b.changePercent;
        break;
      case "dominantSector":
        cmp = a.dominantSector.localeCompare(b.dominantSector);
        break;
      case "perCapita":
        cmp = (a.perCapita ?? 0) - (b.perCapita ?? 0);
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const maxLatest = Math.max(...summaries.map((s) => s.latestTotal), 1);
  const maxPerCapita = Math.max(...summaries.map((s) => s.perCapita ?? 0), 1);

  // For the horizontal bar charts, sort by value descending
  const sortedByTotal = [...summaries].sort((a, b) => b.latestTotal - a.latestTotal);
  const sortedByPerCapita = [...summaries]
    .filter((s) => s.perCapita != null)
    .sort((a, b) => (b.perCapita ?? 0) - (a.perCapita ?? 0));

  function sortArrow(key: SortKey) {
    if (sortKey !== key) return "";
    return sortAsc ? " \u25B2" : " \u25BC";
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Jurisdiction Comparison
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/80 font-medium">
            Sonoma County GHG Inventory
          </p>
          <div className="mt-2 w-14 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12 space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/emissions"
            className="text-sm text-[#8ccacf] hover:text-[#7ab8bd] font-medium transition-colors"
          >
            &larr; Back to Emissions
          </Link>
          <p className="text-xs text-gray-400">
            Source: RCPA Community GHG Inventory Update 2022
          </p>
        </div>

        {/* Comparison table */}
        <section>
          <h3 className="text-lg font-bold text-[#313131] mb-3">
            All Jurisdictions
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <Th onClick={() => handleSort("jurisdiction")}>
                    Jurisdiction{sortArrow("jurisdiction")}
                  </Th>
                  <Th onClick={() => handleSort("baselineTotal")} align="right">
                    1990 Baseline{sortArrow("baselineTotal")}
                  </Th>
                  <Th onClick={() => handleSort("latestTotal")} align="right">
                    Latest Total{sortArrow("latestTotal")}
                  </Th>
                  <Th onClick={() => handleSort("changePercent")} align="right">
                    Change %{sortArrow("changePercent")}
                  </Th>
                  <Th onClick={() => handleSort("dominantSector")}>
                    Dominant Sector{sortArrow("dominantSector")}
                  </Th>
                  <Th onClick={() => handleSort("perCapita")} align="right">
                    Per Capita{sortArrow("perCapita")}
                  </Th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s) => (
                  <tr key={s.jurisdiction} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-[#313131]">
                      <Link
                        href={`/emissions?jurisdiction=${encodeURIComponent(s.jurisdiction)}`}
                        className="hover:text-[#8ccacf] transition-colors"
                      >
                        {s.jurisdiction}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-600">
                      {fmt(s.baselineTotal)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-600">
                      {fmt(s.latestTotal)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-medium ${
                        s.changePercent <= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {s.changePercent > 0 ? "+" : ""}{s.changePercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{s.dominantSector}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">
                      {s.perCapita != null ? s.perCapita.toFixed(1) : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Total emissions bar chart */}
        <section>
          <h3 className="text-lg font-bold text-[#313131] mb-3">
            Total Emissions by Jurisdiction (Latest Year)
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-2">
            {sortedByTotal.map((s) => {
              const widthPct = (s.latestTotal / maxLatest) * 100;
              return (
                <div key={s.jurisdiction} className="flex items-center gap-3">
                  <div className="w-28 sm:w-36 text-sm text-[#313131] truncate shrink-0 text-right">
                    {s.jurisdiction}
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#8ccacf] transition-all"
                      style={{ width: `${Math.max(widthPct, 1)}%` }}
                    />
                  </div>
                  <div className="w-24 text-right text-xs text-gray-600 shrink-0">
                    {fmt(s.latestTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Per capita bar chart */}
        {sortedByPerCapita.length > 0 && (
          <section>
            <h3 className="text-lg font-bold text-[#313131] mb-3">
              Per Capita Emissions (MTCO2e / person)
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-2">
              {sortedByPerCapita.map((s) => {
                const widthPct = ((s.perCapita ?? 0) / maxPerCapita) * 100;
                return (
                  <div key={s.jurisdiction} className="flex items-center gap-3">
                    <div className="w-28 sm:w-36 text-sm text-[#313131] truncate shrink-0 text-right">
                      {s.jurisdiction}
                    </div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#e75425] transition-all"
                        style={{ width: `${Math.max(widthPct, 1)}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-xs text-gray-600 shrink-0">
                      {(s.perCapita ?? 0).toFixed(1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <p className="text-xs text-gray-400 text-center">
          Data from RCPA Community GHG Inventory Update 2022
        </p>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  align,
}: {
  children: React.ReactNode;
  onClick: () => void;
  align?: "right";
}) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-[#8ccacf] select-none ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
