"use client";

import { useState } from "react";
import Link from "next/link";
import type { Action } from "@/types/supabase";

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

interface ActionsListProps {
  actions: Action[];
  sectors: string[];
}

export default function ActionsList({ actions, sectors }: ActionsListProps) {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [timelineFilter, setTimelineFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Collect unique statuses and timelines from data
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
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Climate Actions
      </h3>

      {/* Filters */}
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
              {/* Collapsed Row */}
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

              {/* Expanded Detail */}
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
                      className="text-sm font-medium text-[#8ccacf] hover:underline"
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
