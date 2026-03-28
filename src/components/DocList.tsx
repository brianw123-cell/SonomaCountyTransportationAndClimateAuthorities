"use client";

import { useState } from "react";
import type { Doc } from "@/types/supabase";

interface DocListProps {
  docs: Doc[];
  docTypes: string[];
  evaluatedCount: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function EvalIndicator({ status }: { status: string | null }) {
  if (status === "Y") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Evaluated
      </span>
    );
  }
  if (status === "N") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Not Evaluated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      <span className="text-sm">?</span>
      Unknown
    </span>
  );
}

export default function DocList({ docs, docTypes, evaluatedCount }: DocListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [evalFilter, setEvalFilter] = useState("");

  const evalPercent = docs.length > 0 ? Math.round((evaluatedCount / docs.length) * 100) : 0;

  const filtered = docs.filter((doc) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      doc.doc_name.toLowerCase().includes(q) ||
      (doc.org_parent ?? "").toLowerCase().includes(q);
    const matchesType = !typeFilter || doc.doc_type === typeFilter;
    const matchesEval =
      !evalFilter ||
      (evalFilter === "Y" && doc.doc_evaluated === "Y") ||
      (evalFilter === "N" && doc.doc_evaluated === "N") ||
      (evalFilter === "Unknown" &&
        doc.doc_evaluated !== "Y" &&
        doc.doc_evaluated !== "N");
    return matchesSearch && matchesType && matchesEval;
  });

  function clearAll() {
    setSearch("");
    setTypeFilter("");
    setEvalFilter("");
  }

  return (
    <div>
      {/* Stat Cards — clickable filters with progress */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={clearAll}
          className="bg-white rounded-lg shadow-md px-4 py-3 text-center border-l-4 border-[#8ccacf] hover:shadow-lg transition-shadow cursor-pointer"
        >
          <p className="text-2xl font-bold text-[#8ccacf]">{docs.length}</p>
          <p className="text-[#313131]/60 text-xs font-medium uppercase tracking-wide">
            Total Documents
          </p>
          <p className="text-[10px] text-[#8ccacf] mt-1">Click to show all</p>
        </button>
        <button
          onClick={() => {
            setTypeFilter("");
            setEvalFilter("");
            setSearch("");
          }}
          className="bg-white rounded-lg shadow-md px-4 py-3 text-center border-l-4 border-[#f3d597] hover:shadow-lg transition-shadow cursor-pointer"
        >
          <p className="text-2xl font-bold text-[#e75425]">{docTypes.length}</p>
          <p className="text-[#313131]/60 text-xs font-medium uppercase tracking-wide">
            Document Types
          </p>
          <p className="text-[10px] text-[#e75425] mt-1">Click to clear filters</p>
        </button>
        <button
          onClick={() => {
            setEvalFilter((prev) => (prev === "Y" ? "" : "Y"));
            setTypeFilter("");
            setSearch("");
          }}
          className={`bg-white rounded-lg shadow-md px-4 py-3 text-center border-l-4 border-[#e75425] hover:shadow-lg transition-shadow cursor-pointer ${
            evalFilter === "Y" ? "ring-2 ring-[#e75425] ring-offset-1" : ""
          }`}
        >
          <p className="text-2xl font-bold text-[#8ccacf]">{evaluatedCount}</p>
          <p className="text-[#313131]/60 text-xs font-medium uppercase tracking-wide">
            Evaluated
          </p>
          {/* Progress bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[#8ccacf] h-1.5 rounded-full transition-all"
              style={{ width: `${evalPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-[#313131]/50 mt-1">
            {evalPercent}% of {docs.length} — click to filter
          </p>
        </button>
      </div>

      <h3 className="text-lg font-semibold text-[#8ccacf] mb-4 uppercase tracking-wide">
        Documents
        {(typeFilter || evalFilter || search) && (
          <button
            onClick={clearAll}
            className="ml-3 text-xs font-normal normal-case tracking-normal text-[#e75425] hover:underline"
          >
            Clear filters &times;
          </button>
        )}
      </h3>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or organization..."
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
          {docTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={evalFilter}
          onChange={(e) => setEvalFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
        >
          <option value="">All Evaluation Status</option>
          <option value="Y">Evaluated</option>
          <option value="N">Not Evaluated</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {filtered.length} of {docs.length} documents
      </p>

      {/* Doc Cards */}
      <div className="space-y-3">
        {filtered.map((doc) => (
          <div
            key={doc.doc_id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:border-l-4 hover:border-l-[#e75425] transition-all px-5 py-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#313131]">{doc.doc_name}</p>
                {doc.org_parent && (
                  <p className="text-sm text-gray-400 mt-0.5">{doc.org_parent}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {doc.doc_type && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#8ccacf]/15 text-[#313131]">
                      {doc.doc_type}
                    </span>
                  )}
                  <EvalIndicator status={doc.doc_evaluated} />
                  {doc.doc_date && (
                    <span className="text-xs text-gray-400">
                      {formatDate(doc.doc_date)}
                    </span>
                  )}
                </div>
                {doc.doc_description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {doc.doc_description}
                  </p>
                )}
              </div>
              {doc.doc_url && (
                <a
                  href={doc.doc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium bg-[#8ccacf] text-white px-3 py-1.5 rounded-md hover:bg-[#7ab8bd] transition-colors whitespace-nowrap flex-shrink-0"
                >
                  View Document &rarr;
                </a>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No documents match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}
