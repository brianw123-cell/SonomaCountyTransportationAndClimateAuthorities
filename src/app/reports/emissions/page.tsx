"use client"

import { useEffect, useState, useCallback } from "react"
import { getJurisdictions, getEmissionsByYear, getEmissionsBySector } from "@/lib/ghg-queries"
import type { YearTotal, SectorTotal } from "@/lib/ghg-queries"

export default function EmissionsReportPage() {
  const [jurisdictions, setJurisdictions] = useState<string[]>([])
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("")
  const [yearTotals, setYearTotals] = useState<YearTotal[]>([])
  const [sectorTotals, setSectorTotals] = useState<SectorTotal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadJurisdictions() {
      try {
        const list = await getJurisdictions()
        setJurisdictions(list)
        // Default to Petaluma if available
        const petaluma = list.find((j) =>
          j.toLowerCase().includes("petaluma")
        )
        setSelectedJurisdiction(petaluma ?? list[0] ?? "")
      } catch {
        console.error("Failed to load jurisdictions")
      }
    }
    loadJurisdictions()
  }, [])

  const loadData = useCallback(async (jurisdiction: string) => {
    if (!jurisdiction) return
    setLoading(true)
    try {
      const trend = await getEmissionsByYear(jurisdiction)
      setYearTotals(trend)
      const latestYear = trend.length > 0 ? trend[trend.length - 1].year : 2022
      const sectors = await getEmissionsBySector(jurisdiction, latestYear)
      setSectorTotals(sectors)
    } catch {
      console.error("Failed to load emissions data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedJurisdiction) loadData(selectedJurisdiction)
  }, [selectedJurisdiction, loadData])

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const baselineTotal = yearTotals.length > 0 ? yearTotals[0].total : 0
  const latestYear = yearTotals.length > 0 ? yearTotals[yearTotals.length - 1].year : null

  function fmt(n: number) {
    return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
  }

  return (
    <>
      <style>{`
        @media print {
          body { font-size: 10pt; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      {/* Top bar */}
      <div className="print:hidden bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="jurisdiction-select" className="text-sm font-medium text-[#313131]">
              Jurisdiction:
            </label>
            <select
              id="jurisdiction-select"
              value={selectedJurisdiction}
              onChange={(e) => setSelectedJurisdiction(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
            >
              {jurisdictions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-[#8ccacf] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#7ab8bd] transition-colors"
          >
            Print Report
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0 print:py-4 print:max-w-none">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading report data...</div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 border-b-2 border-[#8ccacf] pb-4">
              <h1 className="text-xl font-bold text-[#313131]">
                SCTCA Climate Action Tracker &mdash; GHG Emissions Report
              </h1>
              <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                <p><span className="font-medium">Jurisdiction:</span> {selectedJurisdiction}</p>
                <p><span className="font-medium">Date Generated:</span> {today}</p>
                <p><span className="font-medium">Source:</span> RCPA Community GHG Inventory Update 2022</p>
              </div>
            </div>

            {/* Emissions by Year */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-[#313131] mb-3 border-b border-[#f3d597] pb-2">
                Emissions by Year
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#8ccacf] text-white">
                      <th className="px-3 py-2 text-left font-medium">Year</th>
                      <th className="px-3 py-2 text-right font-medium">Total MTCO2e</th>
                      <th className="px-3 py-2 text-right font-medium">Change from Baseline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearTotals.map((yt, i) => {
                      const change = baselineTotal > 0
                        ? ((yt.total - baselineTotal) / baselineTotal) * 100
                        : 0
                      return (
                        <tr
                          key={yt.year}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-3 py-1.5">{yt.year}</td>
                          <td className="px-3 py-1.5 text-right font-mono">
                            {fmt(yt.total)}
                          </td>
                          <td className={`px-3 py-1.5 text-right font-mono ${
                            change < 0 ? "text-green-700" : change > 0 ? "text-red-700" : ""
                          }`}>
                            {i === 0
                              ? "Baseline"
                              : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sector Breakdown for Latest Year */}
            {latestYear && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-[#313131] mb-3 border-b border-[#f3d597] pb-2">
                  Sector Breakdown ({latestYear})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#8ccacf] text-white">
                        <th className="px-3 py-2 text-left font-medium">Sector</th>
                        <th className="px-3 py-2 text-right font-medium">MTCO2e</th>
                        <th className="px-3 py-2 text-right font-medium">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectorTotals.map((st, i) => (
                        <tr
                          key={st.sector}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-3 py-1.5">{st.sector}</td>
                          <td className="px-3 py-1.5 text-right font-mono">
                            {fmt(st.total)}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono">
                            {st.percent.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t text-xs text-gray-400 text-center">
              Generated from SCTCA Climate Action Tracker &mdash; {today}
            </div>
          </>
        )}
      </div>
    </>
  )
}
