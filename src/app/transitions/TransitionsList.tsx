"use client";

import { useState } from "react";

interface Transition {
  trn_id: string;
  trn_name: string;
  trn_sector1: string | null;
  trn_sector2: string | null;
  trn_sector3: string | null;
  trn_type: string | null;
  trn_examples: string | null;
  clearpath_transition_id: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  "Shift the mechanism of operation": "bg-purple-100 text-purple-800",
  "Reduce the operation needed": "bg-blue-100 text-blue-800",
  "Increase efficiency": "bg-green-100 text-green-800",
  "Shift the resource used": "bg-orange-100 text-orange-800",
};

const SECTOR_COLORS: Record<string, string> = {
  "Transportation": "text-orange-600",
  "Buildings": "text-blue-600",
  "Energy": "text-yellow-600",
  "Waste": "text-green-600",
  "Water": "text-cyan-600",
  "Agriculture": "text-emerald-600",
  "Land Use": "text-lime-600",
};

export default function TransitionsList({
  sectorGroups,
  sectors,
}: {
  sectorGroups: Record<string, Transition[]>;
  sectors: string[];
}) {
  const [search, setSearch] = useState("");
  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of sectors) init[s] = true;
    return init;
  });

  const toggleSector = (sector: string) => {
    setOpenSectors((prev) => ({ ...prev, [sector]: !prev[sector] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    for (const s of sectors) next[s] = true;
    setOpenSectors(next);
  };

  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    for (const s of sectors) next[s] = false;
    setOpenSectors(next);
  };

  const query = search.toLowerCase().trim();

  // Filter transitions by search
  const filteredGroups: Record<string, Transition[]> = {};
  for (const sector of sectors) {
    const filtered = sectorGroups[sector].filter((t) => {
      if (!query) return true;
      return (
        t.trn_name.toLowerCase().includes(query) ||
        (t.trn_type ?? "").toLowerCase().includes(query) ||
        (t.trn_sector1 ?? "").toLowerCase().includes(query) ||
        (t.trn_sector2 ?? "").toLowerCase().includes(query) ||
        (t.trn_examples ?? "").toLowerCase().includes(query)
      );
    });
    if (filtered.length > 0) filteredGroups[sector] = filtered;
  }

  const filteredSectors = Object.keys(filteredGroups).sort();
  const totalFiltered = Object.values(filteredGroups).reduce((s, a) => s + a.length, 0);

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search transitions by name, type, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]/50 focus:border-[#8ccacf]"
          />
        </div>
        {query && (
          <p className="mt-2 text-xs text-gray-500">
            Showing {totalFiltered} transition{totalFiltered !== 1 ? "s" : ""} matching &ldquo;{search}&rdquo;
          </p>
        )}
      </div>

      {/* Expand/Collapse all */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={expandAll}
          className="text-xs text-[#8ccacf] hover:text-[#6ab0b5] font-medium transition-colors"
        >
          Expand All
        </button>
        <span className="text-xs text-gray-300">|</span>
        <button
          onClick={collapseAll}
          className="text-xs text-[#8ccacf] hover:text-[#6ab0b5] font-medium transition-colors"
        >
          Collapse All
        </button>
      </div>

      {/* Sector groups */}
      {filteredSectors.length === 0 ? (
        <p className="text-center py-8 text-gray-400 text-sm">
          No transitions match your search.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredSectors.map((sector) => {
            const items = filteredGroups[sector];
            const isOpen = openSectors[sector] ?? true;
            const sectorColor = SECTOR_COLORS[sector] ?? "text-[#313131]";

            return (
              <div
                key={sector}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                {/* Sector header */}
                <button
                  onClick={() => toggleSector(sector)}
                  className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <h3 className={`font-semibold text-sm ${sectorColor}`}>{sector}</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {items.length} transition{items.length !== 1 ? "s" : ""}
                  </span>
                </button>

                {/* Transition items */}
                {isOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {items.map((t) => (
                      <div key={t.trn_id} className="px-5 py-3 hover:bg-gray-50/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#313131]">
                              {t.trn_name}
                            </p>
                            {/* Sectors */}
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {t.trn_sector1 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                  {t.trn_sector1}
                                </span>
                              )}
                              {t.trn_sector2 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                  {t.trn_sector2}
                                </span>
                              )}
                              {t.trn_sector3 && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                  {t.trn_sector3}
                                </span>
                              )}
                            </div>
                            {/* Examples */}
                            {t.trn_examples && (
                              <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">
                                {t.trn_examples}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {t.trn_type && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                                  TYPE_COLORS[t.trn_type] ?? "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {t.trn_type}
                              </span>
                            )}
                            {t.clearpath_transition_id && (
                              <span className="text-[10px] text-gray-300 font-mono">
                                {t.clearpath_transition_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
