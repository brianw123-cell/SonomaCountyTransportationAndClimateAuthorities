"use client";

import { useState } from "react";
import Link from "next/link";
import type { Action } from "@/types/supabase";
import type { SectorCount } from "@/types/supabase";

const SECTOR_COLORS: Record<string, string> = {
  "1.00 - Built Environment": "bg-blue-500",
  "2.00 - Transportation": "bg-orange-500",
  "3.00 - Solid Waste": "bg-green-500",
  "4.00 - Wastewater": "bg-cyan-500",
  "5.00 - Agricultural": "bg-yellow-600",
  "6.00 - Forest Land": "bg-emerald-600",
  "7.00 - Climate Adaptation": "bg-purple-500",
  "8.00 - Social Equity": "bg-pink-500",
  "0.00 - Administration": "bg-gray-500",
};

const SECTOR_RING_COLORS: Record<string, string> = {
  "1.00 - Built Environment": "ring-blue-500",
  "2.00 - Transportation": "ring-orange-500",
  "3.00 - Solid Waste": "ring-green-500",
  "4.00 - Wastewater": "ring-cyan-500",
  "5.00 - Agricultural": "ring-yellow-600",
  "6.00 - Forest Land": "ring-emerald-600",
  "7.00 - Climate Adaptation": "ring-purple-500",
  "8.00 - Social Equity": "ring-pink-500",
  "0.00 - Administration": "ring-gray-500",
};

interface ActionsListProps {
  actions: Action[];
  sectors: string[];
  sectorBreakdown: SectorCount[];
  totalDocs: number;
  selectedOrgId: string;
  selectedOrgName: string;
  docName: string;
  allOrgs: { org_id: string; org_name: string; org_acronym: string | null }[];
}

export default function ActionsList({
  actions,
  sectors,
  sectorBreakdown,
  totalDocs,
  selectedOrgId,
  selectedOrgName,
  docName,
  allOrgs,
}: ActionsListProps) {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statuses = Array.from(
    new Set(actions.map((a) => a.act_status).filter(Boolean))
  ).sort() as string[];

  const timelines = Array.from(
    new Set(actions.map((a) => a.act_timeline).filter(Boolean))
  ).sort() as string[];

  const filtered = actions.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (a.act_level1 ?? "").toLowerCase().includes(q) ||
      (a.act_level3 ?? "").toLowerCase().includes(q) ||
      (a.act_sector ?? "").toLowerCase().includes(q) ||
      (a.act_id ?? "").toLowerCase().includes(q);
    const matchesSector = !sectorFilter || a.act_sector === sectorFilter;
    const matchesTimeline =
      !timelineFilter || a.act_timeline === timelineFilter;
    const matchesStatus = !statusFilter || a.act_status === statusFilter;
    return matchesSearch && matchesSector && matchesTimeline && matchesStatus;
  });

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleSectorClick(sector: string) {
    setSectorFilter((prev) => (prev === sector ? "" : sector));
  }

  function sectorBadge(sector: string | null) {
    if (!sector) return null;
    const bg = SECTOR_COLORS[sector] ?? "bg-gray-400";
    return (
      <span
        className={`${bg} text-white text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap`}
      >
        {sector}
      </span>
    );
  }

  return (
    <div>
      {/* Jurisdiction Selector */}
      {allOrgs.length > 1 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-[#313131]/50 uppercase tracking-wide mb-2">
            Select Jurisdiction
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {allOrgs.map((org) => {
              const isSelected = org.org_id === selectedOrgId;
              const label = org.org_acronym || org.org_name;
              return (
                <button
                  key={org.org_id}
                  onClick={() => {
                    window.location.href = `/?org=${org.org_id}`;
                  }}
                  title={org.org_name}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    isSelected
                      ? "bg-[#8ccacf] text-white border-[#8ccacf]"
                      : "bg-white text-[#313131] border-gray-300 hover:text-[#8ccacf] hover:border-[#8ccacf]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Stats — compact, matching documents page */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          onClick={() => {
            setSectorFilter("");
            setTimelineFilter("");
            setStatusFilter("");
            setSearch("");
          }}
          className="bg-white rounded-lg shadow-md px-4 py-3 text-center border-l-4 border-[#8ccacf] hover:shadow-lg transition-shadow cursor-pointer"
        >
          <p className="text-2xl font-bold text-[#8ccacf]">{actions.length}</p>
          <p className="text-[#313131]/60 text-xs font-medium uppercase tracking-wide">
            Total Actions
          </p>
          <p className="text-[10px] text-[#8ccacf] mt-1">Click to show all</p>
        </button>
        <button
          onClick={() => {
            setSectorFilter("");
            setTimelineFilter("");
            setStatusFilter("");
            setSearch("");
          }}
          className="bg-white rounded-lg shadow-md px-4 py-3 text-center border-l-4 border-[#f3d597] hover:shadow-lg transition-shadow cursor-pointer"
        >
          <p className="text-2xl font-bold text-[#e75425]">
            {sectorBreakdown.length}
          </p>
          <p className="text-[#313131]/60 text-xs font-medium uppercase tracking-wide">
            Sectors
          </p>
          <p className="text-[10px] text-[#e75425] mt-1">Click to clear filters</p>
        </button>
        <div className="bg-white rounded-lg shadow-md px-4 py-3 text-center border-l-4 border-[#e75425]">
          <p className="text-2xl font-bold text-[#8ccacf]">{totalDocs}</p>
          <p className="text-[#313131]/60 text-xs font-medium uppercase tracking-wide">
            Documents
          </p>
          <Link
            href="/documents"
            className="text-[10px] text-[#8ccacf] hover:underline mt-1 inline-block"
          >
            View library &rarr;
          </Link>
        </div>
      </div>

      {/* Sector Breakdown — clickable filter buttons */}
      <h3 className="text-lg font-semibold text-[#8ccacf] mb-4 uppercase tracking-wide">
        Actions by Sector
        {sectorFilter && (
          <button
            onClick={() => setSectorFilter("")}
            className="ml-3 text-xs font-normal normal-case tracking-normal text-[#e75425] hover:underline"
          >
            Clear filter &times;
          </button>
        )}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
        {sectorBreakdown.map(({ sector, count }) => {
          const bg = SECTOR_COLORS[sector] ?? "bg-gray-400";
          const ring = SECTOR_RING_COLORS[sector] ?? "ring-gray-400";
          const isActive = sectorFilter === sector;
          return (
            <button
              key={sector}
              onClick={() => handleSectorClick(sector)}
              className={`${bg} text-white rounded-lg p-4 shadow text-left transition-all cursor-pointer hover:scale-[1.03] hover:shadow-lg ${
                isActive ? `ring-4 ${ring} ring-offset-2 scale-[1.03]` : ""
              } ${!isActive && sectorFilter ? "opacity-50" : ""}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm mt-1 leading-tight opacity-90">{sector}</p>
              {isActive && (
                <p className="text-xs mt-2 opacity-75">Click to clear</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <h3 className="text-lg font-semibold text-[#8ccacf] mb-4 uppercase tracking-wide">
        Climate Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search actions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
        />
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
        >
          <option value="">All Sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={timelineFilter}
          onChange={(e) => setTimelineFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
        >
          <option value="">All Timelines</option>
          {timelines.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {filtered.length} of {actions.length} actions
        {sectorFilter && (
          <span className="ml-1 font-medium text-[#313131]">
            in {sectorFilter}
          </span>
        )}
      </p>

      {/* Action Cards */}
      <div className="space-y-3">
        {filtered.map((action) => {
          const isExpanded = expandedId === action.act_id;
          const description = action.act_level3 ?? "";
          const truncated =
            description.length > 100
              ? description.slice(0, 100) + "..."
              : description;

          return (
            <div
              key={action.act_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:border-l-4 hover:border-l-[#e75425] transition-all"
            >
              <button
                onClick={() => toggle(action.act_id)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-gray-400 mt-0.5 flex-shrink-0">
                  {isExpanded ? "\u25BC" : "\u25B6"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">
                      {action.act_id}
                    </span>
                    {sectorBadge(action.act_sector)}
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {action.act_level1 ?? "Untitled Goal"}
                  </p>
                  {!isExpanded && (
                    <p className="text-sm text-gray-500 mt-1">{truncated}</p>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-[#f0fafa]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <Field label="Goal (Level 1)" value={action.act_level1} />
                    <Field
                      label="Strategy (Level 2)"
                      value={action.act_level2}
                    />
                    <Field
                      label="Action (Level 3)"
                      value={action.act_level3}
                      full
                    />
                    <Field label="Sector" value={action.act_sector} />
                    <Field label="Status" value={action.act_status} />
                    <Field label="Timeline" value={action.act_timeline} />
                    <Field label="Timeframe" value={action.act_timeframe} />
                    <Field label="Actor" value={action.act_actor} />
                    <Field label="Type" value={action.act_type} />
                    <Field label="Impacted" value={action.act_impacted} />
                    <Field label="Focus" value={action.act_focus} />
                    <Field label="Results" value={action.act_results} />
                    <Field
                      label="Priority"
                      value={
                        action.act_priority != null
                          ? String(action.act_priority)
                          : null
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/actions/${action.act_id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium bg-[#8ccacf] text-white px-3 py-1.5 rounded-md hover:bg-[#7ab8bd] transition-colors"
                    >
                      View full detail &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No actions match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  full,
}: {
  label: string;
  value: string | null;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-gray-700 mt-0.5">{value ?? "N/A"}</p>
    </div>
  );
}
