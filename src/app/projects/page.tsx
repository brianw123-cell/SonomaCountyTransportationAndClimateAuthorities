"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Project {
  prj_id: string;
  prj_name: string;
  prj_status: string | null;
  prj_budget: number | null;
  prj_start_date: string | null;
  prj_end_date: string | null;
  prj_funding_source: string | null;
  prj_description: string | null;
  prj_notes: string | null;
  clearpath_url: string | null;
}

interface Funding {
  fnd_id: string;
  fnd_name: string;
  fnd_amount: number | null;
  fnd_status: string | null;
}

interface ActPrj {
  rel_from: string;
  rel_to: string;
  name_from: string | null;
}

interface PrjFnd {
  rel_from: string;
  rel_to: string;
  name_to: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  "Planning": "bg-[#f3d597]/40 text-[#8a6d1b]",
  "In Progress": "bg-[#8ccacf]/20 text-[#2a8a8f]",
  "Active": "bg-[#8ccacf]/20 text-[#2a8a8f]",
  "Complete": "bg-green-100 text-green-800",
  "Completed": "bg-green-100 text-green-800",
  "On Hold": "bg-red-100 text-red-700",
  "Cancelled": "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "Unknown";
  const colors = STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors}`}>
      {s}
    </span>
  );
}

function formatCurrency(amount: number | null): string {
  if (amount == null) return "TBD";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [funding, setFunding] = useState<Funding[]>([]);
  const [actPrjLinks, setActPrjLinks] = useState<ActPrj[]>([]);
  const [prjFndLinks, setPrjFndLinks] = useState<PrjFnd[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  useEffect(() => {
    async function fetchData() {
      const [projRes, fndRes, actPrjRes, prjFndRes] = await Promise.all([
        supabase.from("projects").select("*").order("prj_name"),
        supabase.from("funding").select("fnd_id, fnd_name, fnd_amount, fnd_status"),
        supabase.from("act_prj").select("rel_from, rel_to, name_from"),
        supabase.from("prj_fnd").select("rel_from, rel_to, name_to"),
      ]);
      if (projRes.data) setProjects(projRes.data);
      if (fndRes.data) setFunding(fndRes.data);
      if (actPrjRes.data) setActPrjLinks(actPrjRes.data);
      if (prjFndRes.data) setPrjFndLinks(prjFndRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const statuses = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.prj_status ?? "Unknown"))),
  ];

  const filtered =
    activeFilter === "All"
      ? projects
      : projects.filter((p) => (p.prj_status ?? "Unknown") === activeFilter);

  // Funding match: projects without linked funding + available funding
  const projectsWithoutFunding = projects.filter(
    (p) => !prjFndLinks.some((l) => l.rel_from === p.prj_id)
  );
  const openFunding = funding.filter(
    (f) => f.fnd_status === "Open" || f.fnd_status === "Active"
  );

  function getActionsForProject(prjId: string): string[] {
    return actPrjLinks
      .filter((l) => l.rel_to === prjId)
      .map((l) => l.name_from ?? l.rel_from);
  }

  function getFundingForProject(prjId: string): string[] {
    return prjFndLinks
      .filter((l) => l.rel_from === prjId)
      .map((l) => l.name_to ?? l.rel_to);
  }

  return (
    <div>
      {/* Hero -- compact */}
      <section className="bg-[#8ccacf] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Project Tracker
          </h2>
          <p className="mt-1 text-sm text-white/80 font-medium">
            On-the-ground climate action projects
          </p>
          <div className="mt-2 w-12 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading project data...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8ccacf]/10 mb-4">
              <svg className="w-8 h-8 text-[#8ccacf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#313131]">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Projects will be added as climate actions are implemented across Sonoma County.
            </p>
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-[#8ccacf]">{projects.length}</p>
                <p className="text-xs text-gray-500 font-medium">Total Projects</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-[#2a8a8f]">
                  {projects.filter((p) => p.prj_status === "In Progress" || p.prj_status === "Active").length}
                </p>
                <p className="text-xs text-gray-500 font-medium">In Progress</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {projects.filter((p) => p.prj_status === "Complete" || p.prj_status === "Completed").length}
                </p>
                <p className="text-xs text-gray-500 font-medium">Completed</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                <p className="text-2xl font-bold text-[#e75425]">
                  {formatCurrency(
                    projects.reduce((sum, p) => sum + (p.prj_budget ?? 0), 0)
                  )}
                </p>
                <p className="text-xs text-gray-500 font-medium">Total Budget</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    activeFilter === s
                      ? "bg-[#8ccacf] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-[#8ccacf]/10"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Project cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const linkedActions = getActionsForProject(p.prj_id);
                const linkedFunding = getFundingForProject(p.prj_id);
                return (
                  <div
                    key={p.prj_id}
                    className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-[#313131] text-sm leading-tight">
                        {p.prj_name}
                      </h3>
                      <StatusBadge status={p.prj_status} />
                    </div>

                    {p.prj_budget != null && (
                      <p className="text-2xl font-bold text-[#8ccacf] mb-2">
                        {formatCurrency(p.prj_budget)}
                      </p>
                    )}

                    {(p.prj_start_date || p.prj_end_date) && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-medium text-gray-600">Timeline:</span>{" "}
                        {formatDate(p.prj_start_date)}
                        {p.prj_start_date && p.prj_end_date ? " - " : ""}
                        {formatDate(p.prj_end_date)}
                      </p>
                    )}
                    {p.prj_funding_source && (
                      <p className="text-xs text-gray-500 mb-1">
                        <span className="font-medium text-gray-600">Funding:</span>{" "}
                        {p.prj_funding_source}
                      </p>
                    )}
                    {p.prj_description && (
                      <p className="text-xs text-gray-400 mt-2 line-clamp-2">{p.prj_description}</p>
                    )}

                    {/* Linked actions */}
                    {linkedActions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-600 mb-1">Linked Actions</p>
                        <div className="flex flex-wrap gap-1">
                          {linkedActions.slice(0, 3).map((a, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-0.5 bg-[#8ccacf]/10 text-[#2a8a8f] rounded text-[10px] font-medium"
                            >
                              {a}
                            </span>
                          ))}
                          {linkedActions.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                              +{linkedActions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Linked funding */}
                    {linkedFunding.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">Linked Funding</p>
                        <div className="flex flex-wrap gap-1">
                          {linkedFunding.map((f, i) => (
                            <span
                              key={i}
                              className="inline-block px-2 py-0.5 bg-[#f3d597]/20 text-[#8a6d1b] rounded text-[10px] font-medium"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {p.clearpath_url && (
                      <a
                        href={p.clearpath_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 text-xs font-medium text-[#8ccacf] hover:text-[#6ab0b5] transition-colors"
                      >
                        ClearPath &rarr;
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm">
                No projects match the selected filter.
              </p>
            )}

            {/* Funding Match section */}
            {(projectsWithoutFunding.length > 0 || openFunding.length > 0) && (
              <div className="mt-10">
                <h3 className="text-lg font-bold text-[#313131] mb-4">Funding Match</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Unfunded projects */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#e75425] mb-3">
                      Projects Seeking Funding ({projectsWithoutFunding.length})
                    </h4>
                    {projectsWithoutFunding.length === 0 ? (
                      <p className="text-xs text-gray-400">All projects have linked funding.</p>
                    ) : (
                      <div className="space-y-2">
                        {projectsWithoutFunding.map((p) => (
                          <div
                            key={p.prj_id}
                            className="bg-white rounded border border-dashed border-[#e75425]/30 p-3"
                          >
                            <p className="text-sm font-medium text-[#313131]">{p.prj_name}</p>
                            {p.prj_budget != null && (
                              <p className="text-xs text-gray-500">
                                Budget needed: {formatCurrency(p.prj_budget)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available funding */}
                  <div>
                    <h4 className="text-sm font-semibold text-green-700 mb-3">
                      Available Funding ({openFunding.length})
                    </h4>
                    {openFunding.length === 0 ? (
                      <p className="text-xs text-gray-400">No open funding sources at this time.</p>
                    ) : (
                      <div className="space-y-2">
                        {openFunding.map((f) => (
                          <div
                            key={f.fnd_id}
                            className="bg-white rounded border border-dashed border-green-300 p-3"
                          >
                            <p className="text-sm font-medium text-[#313131]">{f.fnd_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(f.fnd_amount)} &middot; {f.fnd_status}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <div className="text-center text-xs text-gray-400 pb-6">Powered by Supabase</div>
    </div>
  );
}
