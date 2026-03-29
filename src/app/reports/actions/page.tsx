"use client"

import { useEffect, useState, useCallback } from "react"
import { getOrgsWithActions, getActionsForOrg, getDocsForOrg } from "@/lib/queries"
import type { Action } from "@/types/supabase"

interface OrgOption {
  org_id: string
  org_name: string
  org_acronym: string | null
}

export default function ActionsReportPage() {
  const [orgs, setOrgs] = useState<OrgOption[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [actions, setActions] = useState<Action[]>([])
  const [docName, setDocName] = useState("")
  const [loading, setLoading] = useState(true)

  // Load orgs on mount
  useEffect(() => {
    async function loadOrgs() {
      try {
        const orgList = await getOrgsWithActions()
        setOrgs(orgList)
        // Default to Petaluma if available
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

  // Load actions when org changes
  const loadActions = useCallback(async (orgId: string) => {
    if (!orgId) return
    setLoading(true)
    try {
      const [acts, docs] = await Promise.all([
        getActionsForOrg(orgId),
        getDocsForOrg(orgId),
      ])
      setActions(acts)
      setDocName(docs.length > 0 ? docs[0].doc_name : "")
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

  // Compute summary stats
  const sectorCounts: Record<string, number> = {}
  const statusCounts: Record<string, number> = {}
  for (const a of actions) {
    const sector = a.act_sector ?? "Unknown"
    sectorCounts[sector] = (sectorCounts[sector] ?? 0) + 1
    const status = a.act_status ?? "Unknown"
    statusCounts[status] = (statusCounts[status] ?? 0) + 1
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body { font-size: 10pt; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      {/* Top bar — hidden on print */}
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
                SCTCA Climate Action Tracker &mdash; Action Summary Report
              </h1>
              <div className="mt-2 text-sm text-gray-600 space-y-0.5">
                <p><span className="font-medium">Jurisdiction:</span> {selectedOrg?.org_name ?? "N/A"}</p>
                {docName && <p><span className="font-medium">Document:</span> {docName}</p>}
                <p><span className="font-medium">Date Generated:</span> {today}</p>
              </div>
            </div>

            {/* Summary box */}
            <div className="bg-gray-50 border rounded-lg p-4 mb-6 print:bg-white">
              <h2 className="text-sm font-semibold text-[#313131] mb-3">Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-[#8ccacf] text-lg">{actions.length}</p>
                  <p className="text-gray-600">Total Actions</p>
                </div>
                <div>
                  <p className="font-medium text-[#313131] mb-1">By Sector:</p>
                  {Object.entries(sectorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([sector, count]) => (
                      <p key={sector} className="text-gray-600 text-xs">
                        {sector}: {count}
                      </p>
                    ))}
                </div>
                <div>
                  <p className="font-medium text-[#313131] mb-1">By Status:</p>
                  {Object.entries(statusCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([status, count]) => (
                      <p key={status} className="text-gray-600 text-xs">
                        {status}: {count}
                      </p>
                    ))}
                </div>
              </div>
            </div>

            {/* Actions table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[#8ccacf] text-white">
                    <th className="px-2 py-2 text-left font-medium">ID</th>
                    <th className="px-2 py-2 text-left font-medium">Goal</th>
                    <th className="px-2 py-2 text-left font-medium">Action</th>
                    <th className="px-2 py-2 text-left font-medium">Sector</th>
                    <th className="px-2 py-2 text-left font-medium">Status</th>
                    <th className="px-2 py-2 text-left font-medium">Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((a, i) => (
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
                      <td className="px-2 py-1.5 text-xs whitespace-nowrap">
                        {a.act_sector ?? "N/A"}
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
