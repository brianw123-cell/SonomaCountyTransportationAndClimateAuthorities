import { supabase } from "@/lib/supabase";
import TransitionsList from "./TransitionsList";

export const metadata = {
  title: "Climate Transitions | SCTCA Climate Action Tracker",
  description:
    "Behavioral and technological shifts for emissions reduction across Sonoma County.",
};

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

export default async function TransitionsPage() {
  const { data: transitions } = await supabase
    .from("transitions")
    .select("*")
    .order("trn_sector1")
    .order("trn_name");

  const items: Transition[] = transitions ?? [];

  // Group by sector1
  const sectorGroups: Record<string, Transition[]> = {};
  for (const t of items) {
    const sector = t.trn_sector1 ?? "Other";
    if (!sectorGroups[sector]) sectorGroups[sector] = [];
    sectorGroups[sector].push(t);
  }

  const sectors = Object.keys(sectorGroups).sort();

  return (
    <div>
      {/* Hero -- compact */}
      <section className="bg-[#8ccacf] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Climate Transitions
          </h2>
          <p className="mt-1 text-sm text-white/80 font-medium">
            Behavioral and technological shifts for emissions reduction
          </p>
          <div className="mt-2 w-12 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-2xl font-bold text-[#8ccacf]">{items.length}</p>
            <p className="text-xs text-gray-500 font-medium">Total Transitions</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-2xl font-bold text-[#e75425]">{sectors.length}</p>
            <p className="text-xs text-gray-500 font-medium">Sectors</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-[#f3d597]">
              {new Set(items.map((t) => t.trn_type).filter(Boolean)).size}
            </p>
            <p className="text-xs text-gray-500 font-medium">Transition Types</p>
          </div>
        </div>

        <TransitionsList sectorGroups={sectorGroups} sectors={sectors} />
      </section>

      <div className="text-center text-xs text-gray-400 pb-6">Powered by Supabase</div>
    </div>
  );
}
