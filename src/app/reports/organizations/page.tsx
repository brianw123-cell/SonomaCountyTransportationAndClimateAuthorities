"use client"

import { useEffect, useState } from "react"
import { getOrgs, getOrgTypes } from "@/lib/queries"
import type { Org } from "@/types/supabase"

export default function OrganizationsReportPage() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [orgTypes, setOrgTypes] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [orgList, types] = await Promise.all([getOrgs(), getOrgTypes()])
        setOrgs(orgList)
        setOrgTypes(types)
      } catch {
        console.error("Failed to load organizations")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const filteredOrgs =
    selectedType === "all"
      ? orgs
      : orgs.filter((o) => o.org_type === selectedType)

  // Group by type
  const byType: Record<string, Org[]> = {}
  for (const o of filteredOrgs) {
    const type = o.org_type ?? "Other"
    if (!byType[type]) byType[type] = []
    byType[type].push(o)
  }
  const typeEntries = Object.entries(byType).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  return (
    <>
      <style>{`
        @media print {
          body { font-size: 10pt; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
          .type-section { page-break-before: auto; }
          .type-section:first-of-type { page-break-before: avoid; }
        }
      `}</style>

      {/* Top bar */}
      <div className="print:hidden bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="type-filter" className="text-sm font-medium text-[#313131]">
              Filter by Type:
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
            >
              <option value="all">All Types</option>
              {orgTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
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
                SCTCA Climate Action Tracker &mdash; Organization Directory
              </h1>
              <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                <p><span className="font-medium">Date Generated:</span> {today}</p>
                <p><span className="font-medium">Total Organizations:</span> {filteredOrgs.length}</p>
              </div>
            </div>

            {/* Organization sections by type */}
            {typeEntries.map(([type, typeOrgs]) => (
              <div key={type} className="type-section mb-8">
                <div className="flex items-baseline gap-3 mb-3 border-b border-[#f3d597] pb-2">
                  <h2 className="text-base font-semibold text-[#313131]">{type}</h2>
                  <span className="text-sm text-gray-500">
                    ({typeOrgs.length})
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse mb-2">
                    <thead>
                      <tr className="bg-[#8ccacf]/10">
                        <th className="px-3 py-1.5 text-left font-medium text-[#313131]">Name</th>
                        <th className="px-3 py-1.5 text-left font-medium text-[#313131]">Acronym</th>
                        <th className="px-3 py-1.5 text-left font-medium text-[#313131]">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {typeOrgs.map((o, i) => (
                        <tr
                          key={o.org_id}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-3 py-1.5">{o.org_name}</td>
                          <td className="px-3 py-1.5 text-gray-500">
                            {o.org_acronym ?? "--"}
                          </td>
                          <td className="px-3 py-1.5 text-xs text-[#8ccacf] break-all">
                            {o.org_url ?? "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

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
