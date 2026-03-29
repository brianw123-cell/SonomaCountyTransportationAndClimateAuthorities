"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface GhgRow {
  id: number;
  year: number;
  jurisdiction: string;
  activity_type: string;
  activity_name: string | null;
  activity_sector: string | null;
  activity_fuel_type: string | null;
  total_mtco2e: number;
  mtco2e_per_capita: number | null;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString();
}

function DetailContent() {
  const searchParams = useSearchParams();
  const initialJurisdiction = searchParams.get("jurisdiction") || "Petaluma";
  const initialYear = searchParams.get("year") || "";
  const initialSector = searchParams.get("sector") || "";

  const [jurisdictions, setJurisdictions] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);

  const [jurisdiction, setJurisdiction] = useState(initialJurisdiction);
  const [year, setYear] = useState(initialYear);
  const [sector, setSector] = useState(initialSector);

  const [rows, setRows] = useState<GhgRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch filter options on mount
  useEffect(() => {
    async function loadFilters() {
      const [jRes, yRes, sRes] = await Promise.all([
        supabase.from("ghg_inventory").select("jurisdiction"),
        supabase.from("ghg_inventory").select("year"),
        supabase.from("ghg_inventory").select("activity_type"),
      ]);

      setJurisdictions(
        [...new Set((jRes.data ?? []).map((r) => r.jurisdiction as string))].sort()
      );
      setYears(
        [...new Set((yRes.data ?? []).map((r) => r.year as number))].sort()
      );
      setSectors(
        [...new Set((sRes.data ?? []).map((r) => r.activity_type as string))].filter(Boolean).sort()
      );
    }
    loadFilters();
  }, []);

  // Fetch data when filters change
  const fetchData = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("ghg_inventory")
      .select("id, year, jurisdiction, activity_type, activity_name, activity_sector, activity_fuel_type, total_mtco2e, mtco2e_per_capita")
      .eq("jurisdiction", jurisdiction)
      .order("total_mtco2e", { ascending: false });

    if (year) query = query.eq("year", Number(year));
    if (sector) query = query.eq("activity_type", sector);

    const { data, error } = await query;
    if (!error) {
      setRows((data ?? []) as GhgRow[]);
    }
    setLoading(false);
  }, [jurisdiction, year, sector]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const total = rows.reduce((sum, r) => sum + r.total_mtco2e, 0);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Emissions Data Explorer
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/80 font-medium">
            Detailed GHG Inventory Data
          </p>
          <div className="mt-2 w-14 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12 space-y-6">
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Jurisdiction
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[#313131] focus:outline-none focus:ring-2 focus:ring-[#8ccacf]/50"
              >
                {jurisdictions.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[#313131] focus:outline-none focus:ring-2 focus:ring-[#8ccacf]/50"
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[#313131] focus:outline-none focus:ring-2 focus:ring-[#8ccacf]/50"
              >
                <option value="">All Sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-[#313131]">{rows.length}</span> rows
            {!loading && (
              <span>
                {" "}&mdash; Total: <span className="font-semibold text-[#313131]">{fmt(total)}</span> MTCO2e
              </span>
            )}
          </p>
        </div>

        {/* Data table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading data...</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No data found for the selected filters.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Sector
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Activity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Sub-sector
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Fuel Type
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    MTCO2e
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Per Capita
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">{row.year}</td>
                    <td className="px-4 py-2 text-gray-600">{row.activity_type}</td>
                    <td className="px-4 py-2 text-[#313131] font-medium">
                      {row.activity_name || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {row.activity_sector || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {row.activity_fuel_type || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600 font-medium">
                      {fmt(row.total_mtco2e)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {row.mtco2e_per_capita != null
                        ? row.mtco2e_per_capita.toFixed(2)
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={5} className="px-4 py-2.5 text-sm font-semibold text-[#313131]">
                    Total
                  </td>
                  <td className="px-4 py-2.5 text-right text-sm font-bold text-[#313131]">
                    {fmt(total)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <p className="text-xs text-gray-400 text-center">
          Data from RCPA Community GHG Inventory Update 2022
        </p>
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-400">
          Loading...
        </div>
      }
    >
      <DetailContent />
    </Suspense>
  );
}
