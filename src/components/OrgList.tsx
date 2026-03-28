"use client";

import { useState } from "react";
import type { Org } from "@/types/supabase";

const TYPE_COLORS: Record<string, string> = {
  "Local Municipality": "bg-[#8ccacf]",
  "County Government": "bg-[#f3d597] text-[#313131]",
  "Special District": "bg-[#e75425]",
  "NGO": "bg-emerald-600",
  "Regional Government": "bg-purple-500",
  "Private Consultant": "bg-gray-500",
};

interface OrgListProps {
  orgs: Org[];
  orgTypes: string[];
}

export default function OrgList({ orgs, orgTypes }: OrgListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filtered = orgs.filter((org) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      org.org_name.toLowerCase().includes(q) ||
      (org.org_acronym ?? "").toLowerCase().includes(q);
    const matchesType = !typeFilter || org.org_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#8ccacf] mb-4 uppercase tracking-wide">
        Organizations
      </h3>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or acronym..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
        >
          <option value="">All Types</option>
          {orgTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {filtered.length} of {orgs.length} organizations
      </p>

      {/* Org Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((org) => {
          const badgeBg =
            TYPE_COLORS[org.org_type ?? ""] ?? "bg-gray-400 text-white";
          const hasTextOverride = badgeBg.includes("text-");
          const badgeClasses = hasTextOverride
            ? badgeBg
            : `${badgeBg} text-white`;

          return (
            <div
              key={org.org_id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:border-l-4 hover:border-l-[#8ccacf] transition-all"
            >
              <div className="flex items-start gap-3">
                {org.org_logo ? (
                  <img
                    src={org.org_logo}
                    alt={`${org.org_name} logo`}
                    className="w-10 h-10 rounded object-contain flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-[#8ccacf]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#8ccacf] text-sm font-bold">
                      {org.org_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#313131] leading-tight">
                    {org.org_name}
                    {org.org_acronym && (
                      <span className="font-normal text-gray-400 ml-1">
                        ({org.org_acronym})
                      </span>
                    )}
                  </p>
                  {org.org_type && (
                    <span
                      className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${badgeClasses}`}
                    >
                      {org.org_type}
                    </span>
                  )}
                </div>
              </div>

              {org.org_description && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                  {org.org_description}
                </p>
              )}

              {org.org_url && (
                <a
                  href={org.org_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm text-[#8ccacf] hover:text-[#7ab8bd] font-medium"
                >
                  Visit website &rarr;
                </a>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">
            No organizations match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
