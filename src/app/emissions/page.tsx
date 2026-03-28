"use client";

import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  SAMPLE DATA — placeholder estimates for demonstration only        */
/* ------------------------------------------------------------------ */

const historicalData = [
  { year: 2005, value: 450000 },
  { year: 2010, value: 420000 },
  { year: 2015, value: 385000 },
  { year: 2017, value: 370000 },
  { year: 2019, value: 340000 },
  { year: 2020, value: 310000 },
  { year: 2022, value: 325000 },
  { year: 2024, value: 305000 },
];

const projectedData = [
  { year: 2025, value: 290000 },
  { year: 2027, value: 250000 },
  { year: 2030, value: 200000 },
  { year: 2035, value: 135000 },
  { year: 2040, value: 70000 },
  { year: 2045, value: 0 },
];

const allTrendData = [...historicalData, ...projectedData];
const maxEmissions = 450000;

const sectorData = [
  { name: "Transportation", value: 145000, pct: 47, color: "#e75425" },
  { name: "Buildings (Residential)", value: 65000, pct: 21, color: "#3b82f6" },
  { name: "Buildings (Commercial)", value: 40000, pct: 13, color: "#8ccacf" },
  { name: "Solid Waste", value: 25000, pct: 8, color: "#22c55e" },
  { name: "Agriculture", value: 15000, pct: 5, color: "#eab308" },
  { name: "Water / Wastewater", value: 10000, pct: 3, color: "#06b6d4" },
  { name: "Other", value: 5000, pct: 2, color: "#9ca3af" },
];

const goals = [
  { label: "2027 Target", target: 250000, current: 305000, year: 2027 },
  { label: "2030 Target", target: 200000, current: 305000, year: 2030 },
  { label: "2045 Net Zero", target: 0, current: 305000, year: 2045 },
];

function fmt(n: number): string {
  return n.toLocaleString();
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function EmissionsPage() {
  const baseline = 450000;
  const current = 305000;
  const reductionPct = Math.round(((baseline - current) / baseline) * 100);

  return (
    <div>
      {/* ---- Hero ---- */}
      <section className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Greenhouse Gas Emissions Dashboard
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/80 font-medium">
            City of Petaluma &mdash; Climate Action Progress
          </p>
          <div className="mt-2 w-14 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      {/* ---- Disclaimer Banner ---- */}
      <div className="bg-[#f3d597] border-b border-[#e5c474]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-[#313131] text-sm font-medium">
          SAMPLE DATA &mdash; The numbers shown on this page are placeholder
          estimates for demonstration purposes only. Actual GHG inventory data
          will be sourced from ICLEI ClearPath 2.0 when available.
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12 space-y-10">
        {/* ---- Key Metrics ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="2005 Baseline"
            value={`${fmt(baseline)}`}
            unit="MTCO2e"
          />
          <MetricCard
            label="2024 Current"
            value={`${fmt(current)}`}
            unit="MTCO2e"
          />
          <MetricCard
            label="Reduction"
            value={`${reductionPct}%`}
            unit="since 2005"
            highlight
          />
          <MetricCard
            label="Target Year"
            value="2045"
            unit="Carbon Neutral"
          />
        </div>

        {/* ---- Emissions Trend Chart ---- */}
        <section>
          <SectionHeading title="GHG Emissions Trend — Historical & Projected" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Y-axis label */}
              <div className="text-xs text-gray-400 mb-1">MTCO2e</div>

              {/* Chart area */}
              <div className="relative" style={{ height: 300 }}>
                {/* Baseline dashed line */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300"
                  style={{ top: 0 }}
                />
                <span className="absolute -top-4 right-0 text-[10px] text-gray-400">
                  450k baseline
                </span>

                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((frac) => (
                  <div
                    key={frac}
                    className="absolute left-0 right-0 border-t border-gray-100"
                    style={{ top: `${frac * 100}%` }}
                  />
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-[2px] sm:gap-1">
                  {allTrendData.map((d) => {
                    const heightPct = (d.value / maxEmissions) * 100;
                    const isProjected = d.year >= 2025;
                    return (
                      <div
                        key={d.year}
                        className="flex-1 flex flex-col items-center justify-end h-full"
                      >
                        <div className="text-[9px] sm:text-[10px] text-gray-500 mb-1">
                          {d.value >= 1000
                            ? `${Math.round(d.value / 1000)}k`
                            : d.value}
                        </div>
                        <div
                          className="w-full rounded-t-sm transition-all"
                          style={{
                            height: `${heightPct}%`,
                            backgroundColor: isProjected
                              ? "rgba(140,202,207,0.4)"
                              : "#8ccacf",
                            backgroundImage: isProjected
                              ? "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(140,202,207,0.6) 3px, rgba(140,202,207,0.6) 6px)"
                              : "none",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex gap-[2px] sm:gap-1 mt-2">
                {allTrendData.map((d) => (
                  <div
                    key={d.year}
                    className="flex-1 text-center text-[9px] sm:text-[10px] text-gray-500"
                  >
                    {d.year}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm bg-[#8ccacf]" />{" "}
                  Historical
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: "rgba(140,202,207,0.4)",
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(140,202,207,0.6) 3px, rgba(140,202,207,0.6) 6px)",
                    }}
                  />{" "}
                  Projected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-6 border-t-2 border-dashed border-gray-300" />{" "}
                  2005 Baseline
                </span>
              </div>
            </div>
            <SampleNote />
          </div>
        </section>

        {/* ---- Sector Breakdown ---- */}
        <section>
          <SectionHeading title="Emissions by Sector (2024 Estimate)" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-3">
            {sectorData.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-44 sm:w-52 text-sm text-[#313131] truncate shrink-0">
                  {s.name}
                </div>
                <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.pct}%`,
                      backgroundColor: s.color,
                      minWidth: s.pct < 5 ? "2rem" : undefined,
                    }}
                  />
                </div>
                <div className="w-20 text-right text-xs text-gray-600 shrink-0">
                  {fmt(s.value)} <span className="text-gray-400">({s.pct}%)</span>
                </div>
              </div>
            ))}
            <SampleNote />
          </div>
        </section>

        {/* ---- Progress Toward Goals ---- */}
        <section>
          <SectionHeading title="Progress Toward Reduction Goals" />
          <div className="grid gap-4 sm:grid-cols-3">
            {goals.map((g) => {
              const totalReduction = baseline - g.target;
              const achieved = baseline - g.current;
              const pct = Math.round((achieved / totalReduction) * 100);
              const remaining = g.current - g.target;
              return (
                <div
                  key={g.label}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                  <h4 className="text-sm font-semibold text-[#313131]">
                    {g.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fmt(g.target)} MTCO2e
                  </p>
                  {/* Progress bar */}
                  <div className="mt-3 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor:
                          pct >= 100
                            ? "#22c55e"
                            : pct >= 60
                              ? "#8ccacf"
                              : "#f3d597",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-gray-500">
                    <span>{pct}% complete</span>
                    <span>{fmt(remaining)} remaining</span>
                  </div>
                  <SampleNote />
                </div>
              );
            })}
          </div>
        </section>

        {/* ---- Action Impact ---- */}
        <section>
          <SectionHeading title="Climate Action Connection" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center space-y-4">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div>
                <p className="text-3xl font-bold text-[#8ccacf]">455</p>
                <p className="text-xs text-gray-500">Climate Actions Tracked</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#e75425]">7</p>
                <p className="text-xs text-gray-500">Sectors Covered</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Each tracked climate action contributes to measurable emissions
              reductions across transportation, buildings, waste, and other
              sectors. When connected to ICLEI ClearPath 2.0, actions will link
              directly to quantified GHG impact estimates.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2 rounded-md bg-[#8ccacf] text-white text-sm font-medium hover:bg-[#7ab8bd] transition-colors"
            >
              View Climate Action Dashboard
            </Link>
            <SampleNote />
          </div>
        </section>
      </div>

      {/* Footer note */}
      <div className="text-center text-xs text-gray-400 pb-6">
        Powered by Supabase
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`mt-1 text-2xl sm:text-3xl font-bold ${
          highlight ? "text-green-600" : "text-[#313131]"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{unit}</p>
      <p className="text-[10px] text-gray-300 italic mt-1">Sample data</p>
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="text-lg font-bold text-[#313131] mb-3 flex items-center gap-2">
      {title}
    </h3>
  );
}

function SampleNote() {
  return (
    <p className="text-[10px] text-gray-300 italic mt-2 text-right">
      Sample data for demonstration
    </p>
  );
}
