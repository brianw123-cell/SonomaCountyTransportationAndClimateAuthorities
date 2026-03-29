"use client"

import { useEffect, useState, useCallback } from "react"
import { getOrgsWithActions, getActionsForOrg } from "@/lib/queries"
import type { Action } from "@/types/supabase"

interface OrgOption {
  org_id: string
  org_name: string
  org_acronym: string | null
}

export default function SectorsReportPage() {
  const [orgs, setOrgs] = useState<OrgOption[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrgs() {
      try {
        const orgList = await getOrgsWithActions()
        setOrgs(orgList)
        const petaluma = orgList.find((o) =>
          o.org_name.toLowerCase().includes("petaluma")
        )
        if (petaluma) {
          setSelectedOrgId(petaluma.org_id)
        } else if (orgList.length > 0) {
          setSelectedOrgId(orgList[0].org_id)
        }
      } catch {
        console.error("Failed to load orgs")
      }
    }
    loadOrgs()
  }, [])

  const loadActions = useCallback(async (orgId: string) => {
    if (!orgId) return
    setLoading(true)
    try {
      const acts = await getActionsForOrg(orgId)
      setActions(acts)
    } catch {
      console.error("Failed to load actions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedOrgId) loadActions(selectedOrgId)
  }, [selectedOrgId, loadActions])

  const selectedOrg = orgs.find((o) => o.org_id === selectedOrgId)
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Group actions by sector
  const bySector: Record<string, Action[]> = {}
  for (const a of actions) {
    const sector = a.act_sector ?? "Unknown"
    if (!bySector[sector]) bySector[sector] = []
    bySector[sector].push(a)
  }
  const sectorEntries = Object.entries(bySector).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  return (
    <>
      <style>{`
        @media print {
          body { font-size: 10pt; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
          .sector-section { page-break-before: auto; }
          .sector-section:first-of-type { page-break-before: avoid; }
        }
      `}</style>

      {/* Top bar */}
      <div className="print:hidden bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label htmlFor="org-select" className="text-sm font-medium text-[#313131]">
              Jurisdiction:
            </label>
            <select
              id="org-select"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
            >
              {orgs.map((o) => (
                <option key={o.org_id} value={o.org_id}>
                  {o.org_name}
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
                SCTCA Climate Action Tracker &mdash; Sector Breakdown Report
              </h1>
              <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                <p><span className="font-medium">Jurisdiction:</span> {selectedOrg?.org_name ?? "N/A"}</p>
                <p><span className="font-medium">Date Generated:</span> {today}</p>
                <p><span className="font-medium">Total Actions:</span> {actions.length} across {sectorEntries.length} sectors</p>
              </div>
            </div>

            {/* Sector sections */}
            {sectorEntries.map(([sector, sectorActions]) => (
              <div key={sector} className="sector-section mb-8">
                <div className="flex items-baseline gap-3 mb-3 border-b border-[#f3d597] pb-2">
                  <h2 className="text-base font-semibold text-[#313131]">{sector}</h2>
                  <span className="text-sm text-gray-500">
                    ({sectorActions.length} action{sectorActions.length !== 1 ? "s" : ""})
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse mb-2">
                    <thead>
                      <tr className="bg-[#8ccacf]/10">
                        <th className="px-2 py-1.5 text-left font-medium text-[#313131]">ID</th>
                        <th className="px-2 py-1.5 text-left font-medium text-[#313131]">Goal</th>
                        <th className="px-2 py-1.5 text-left font-medium text-[#313131]">Action</th>
                        <th className="px-2 py-1.5 text-left font-medium text-[#313131]">Status</th>
                        <th className="px-2 py-1.5 text-left font-medium text-[#313131]">Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectorActions.map((a, i) => (
                        <tr
                          key={a.act_id}
                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-2 py-1.5 text-xs text-gray-500 whitespace-nowrap">
                            {a.act_id}
                          </td>
                          <td className="px-2 py-1.5 text-xs">
                            {a.act_level1 ?? "N/A"}
                          </td>
                          <td className="px-2 py-1.5 text-xs">
                            {a.act_level3
                              ? a.act_level3.length > 80
                                ? a.act_level3.slice(0, 80) + "..."
                                : a.act_level3
                              : "N/A"}
                          </td>
                          <td className="px-2 py-1.5 text-xs">
                            {a.act_status ?? "N/A"}
                          </td>
                          <td className="px-2 py-1.5 text-xs whitespace-nowrap">
                            {a.act_timeline ?? "N/A"}
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
