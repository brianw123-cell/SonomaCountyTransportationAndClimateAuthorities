"use client";

import Link from "next/link";
import { useState } from "react";
import type { YearTotal, SectorTotal, PerCapitaMetrics } from "@/lib/ghg-queries";

const SECTOR_COLORS: Record<string, string> = {
  Transportation: "#e75425",
  Buildings: "#8ccacf",
  "Solid Waste": "#22c55e",
  Water: "#06b6d4",
  Agriculture: "#ca8a04",
};

function sectorColor(name: string): string {
  for (const [key, color] of Object.entries(SECTOR_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return "#9ca3af";
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}

interface JurisdictionData {
  trend: YearTotal[];
  sectors: SectorTotal[];
  perCapita: PerCapitaMetrics;
  baselineYear: number;
  latestYear: number;
  baselineTotal: number;
  latestTotal: number;
  changePercent: number;
}

interface Props {
  jurisdictions: string[];
  allData: Record<string, JurisdictionData>;
}

export default function EmissionsClient({ jurisdictions, allData }: Props) {
  const [selected, setSelected] = useState("Petaluma");
  const data = allData[selected];

  if (!data) return null;

  const { trend, sectors, perCapita, baselineYear, latestYear, baselineTotal, latestTotal, changePercent } = data;
  const maxBar = Math.max(...trend.map((t) => t.total), 1);
  const dominantSector = sectors.length > 0 ? sectors[0] : null;

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Greenhouse Gas Emissions
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/80 font-medium">
            Sonoma County Community Inventory
          </p>
          <div className="mt-2 w-14 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12 space-y-8">
        {/* Source note */}
        <p className="text-xs text-gray-400 text-center">
          Source: RCPA Community GHG Inventory Update 2022 (Last updated May 2024)
        </p>

        {/* Jurisdiction selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {jurisdictions.map((j) => {
            const isActive = j === selected;
            const isProminent = j === "Countywide" || j === "Petaluma";
            return (
              <button
                key={j}
                onClick={() => setSelected(j)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#8ccacf] text-white shadow-sm"
                    : isProminent
                      ? "bg-[#8ccacf]/15 text-[#313131] hover:bg-[#8ccacf]/30 ring-1 ring-[#8ccacf]/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {j}
              </button>
            );
          })}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label={`${baselineYear} Baseline`}
            value={fmt(baselineTotal)}
            unit="MTCO2e"
          />
          <MetricCard
            label={`${latestYear} Total`}
            value={fmt(latestTotal)}
            unit="MTCO2e"
          />
          <MetricCard
            label="Change"
            value={`${changePercent > 0 ? "+" : ""}${changePercent.toFixed(1)}%`}
            unit={`since ${baselineYear}`}
            colorClass={changePercent <= 0 ? "text-green-600" : "text-red-600"}
          />
          <MetricCard
            label="Dominant Sector"
            value={dominantSector ? dominantSector.sector : "N/A"}
            unit={dominantSector ? `${dominantSector.percent.toFixed(0)}% of total` : ""}
          />
        </div>

        {/* Emissions trend bar chart */}
        <section>
          <h3 className="text-lg font-bold text-[#313131] mb-3">
            Emissions Trend &mdash; {selected}
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="text-xs text-gray-400 mb-1">MTCO2e</div>
            <div className="relative" style={{ height: 280 }}>
              {/* Baseline dashed line */}
              {trend.length > 0 && (
                <>
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300 z-10"
                    style={{ bottom: `${(trend[0].total / maxBar) * 100}%` }}
                  />
                  <span
                    className="absolute right-0 text-[10px] text-gray-400 z-10"
                    style={{ bottom: `${(trend[0].total / maxBar) * 100 + 1}%` }}
                  >
                    {baselineYear} baseline
                  </span>
                </>
              )}

              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map((frac) => (
                <div
                  key={frac}
                  className="absolute left-0 right-0 border-t border-gray-100"
                  style={{ bottom: `${frac * 100}%` }}
                />
              ))}

              {/* Bars */}
              <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
                {trend.map((d) => {
                  const heightPct = (d.total / maxBar) * 100;
                  return (
                    <div
                      key={d.year}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <div className="text-[10px] sm:text-xs text-gray-500 mb-1 font-medium">
                        {fmt(d.total)}
                      </div>
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${heightPct}%`,
                          backgroundColor: "#8ccacf",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex gap-2 sm:gap-3 mt-2">
              {trend.map((d) => (
                <div
                  key={d.year}
                  className="flex-1 text-center text-xs text-gray-500 font-medium"
                >
                  {d.year}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-[#8ccacf]" />
                Inventory Year
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 border-t-2 border-dashed border-gray-300" />
                Baseline
              </span>
            </div>
          </div>
        </section>

        {/* Sector breakdown */}
        <section>
          <h3 className="text-lg font-bold text-[#313131] mb-3">
            Sector Breakdown &mdash; {latestYear}
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3">
            {sectors.map((s) => (
              <Link
                key={s.sector}
                href={`/emissions/detail?jurisdiction=${encodeURIComponent(selected)}&year=${latestYear}&sector=${encodeURIComponent(s.sector)}`}
                className="flex items-center gap-3 group hover:bg-gray-50 rounded-lg px-2 py-1 -mx-2 transition-colors"
              >
                <div className="w-36 sm:w-48 text-sm text-[#313131] truncate shrink-0 group-hover:text-[#8ccacf] transition-colors">
                  {s.sector}
                </div>
                <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(s.percent, 2)}%`,
                      backgroundColor: sectorColor(s.sector),
                    }}
                  />
                </div>
                <div className="w-28 text-right text-xs text-gray-600 shrink-0">
                  {fmt(s.total)}{" "}
                  <span className="text-gray-400">({s.percent.toFixed(1)}%)</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Per capita metrics */}
        {(perCapita.perCapita != null || perCapita.perHousehold != null || perCapita.perEmployment != null) && (
          <section>
            <h3 className="text-lg font-bold text-[#313131] mb-3">
              Per Capita Metrics &mdash; {latestYear}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {perCapita.perCapita != null && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Per Capita
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#313131]">
                    {perCapita.perCapita.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">MTCO2e / person</p>
                </div>
              )}
              {perCapita.perHousehold != null && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Per Household
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#313131]">
                    {perCapita.perHousehold.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">MTCO2e / household</p>
                </div>
              )}
              {perCapita.perEmployment != null && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Per Employment
                  </p>
                  <p className="mt-1 text-2xl font-bold text-[#313131]">
                    {perCapita.perEmployment.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">MTCO2e / job</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/emissions/compare"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-[#8ccacf] text-white text-sm font-medium hover:bg-[#7ab8bd] transition-colors"
          >
            Compare All Jurisdictions
          </Link>
          <Link
            href={`/emissions/detail?jurisdiction=${encodeURIComponent(selected)}`}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-[#e75425] text-white text-sm font-medium hover:bg-[#d04a20] transition-colors"
          >
            View Detailed Data
          </Link>
        </div>

        {/* Footer source */}
        <p className="text-xs text-gray-400 text-center">
          Data from RCPA Community GHG Inventory Update 2022
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  colorClass,
}: {
  label: string;
  value: string;
  unit: string;
  colorClass?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`mt-1 text-2xl sm:text-3xl font-bold ${colorClass ?? "text-[#313131]"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{unit}</p>
    </div>
  );
}
