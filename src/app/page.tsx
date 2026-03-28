import {
  getActionsForOrg,
  getDocsForOrg,
  getSectorBreakdownForOrg,
} from "@/lib/queries";
import ActionsList from "@/components/ActionsList";

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

export default async function DashboardPage() {
  const [actions, docs, sectorBreakdown] = await Promise.all([
    getActionsForOrg("ORG-10006"),
    getDocsForOrg("ORG-10006"),
    getSectorBreakdownForOrg("ORG-10006"),
  ]);

  const sectors = sectorBreakdown.map((s) => s.sector);

  return (
    <div>
      {/* Hero — compact */}
      <section className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            City of Petaluma
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/80 font-medium">
            Blueprint for Climate Action
          </p>
          <div className="mt-2 w-14 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      {/* Everything interactive lives in ActionsList */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <ActionsList
          actions={actions}
          sectors={sectors}
          sectorBreakdown={sectorBreakdown}
          totalDocs={docs.length}
        />
      </section>

      {/* Footer note */}
      <div className="text-center text-xs text-gray-400 pb-6">
        Powered by Supabase
      </div>
    </div>
  );
}
