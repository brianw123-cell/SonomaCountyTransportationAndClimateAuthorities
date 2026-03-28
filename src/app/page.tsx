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
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#8ccacf] to-[#f3d597] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#313131]">
            City of Petaluma
          </h2>
          <p className="mt-2 text-lg text-[#313131]/70">
            Blueprint for Climate Action
          </p>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center border-t-2 border-[#8ccacf]">
            <p className="text-4xl font-bold text-[#8ccacf]">
              {actions.length}
            </p>
            <p className="text-gray-500 mt-1 text-sm font-medium">
              Total Actions
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center border-t-2 border-[#8ccacf]">
            <p className="text-4xl font-bold text-[#8ccacf]">
              {sectorBreakdown.length}
            </p>
            <p className="text-gray-500 mt-1 text-sm font-medium">Sectors</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center border-t-2 border-[#8ccacf]">
            <p className="text-4xl font-bold text-[#8ccacf]">
              {docs.length}
            </p>
            <p className="text-gray-500 mt-1 text-sm font-medium">Documents</p>
          </div>
        </div>
      </section>

      {/* Sector Breakdown */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Actions by Sector
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sectorBreakdown.map(({ sector, count }) => {
            const bg = SECTOR_COLORS[sector] ?? "bg-gray-400";
            return (
              <div
                key={sector}
                className={`${bg} text-white rounded-lg p-4 shadow`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm mt-1 leading-tight opacity-90">
                  {sector}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Actions List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-12">
        <ActionsList actions={actions} sectors={sectors} />
      </section>

      {/* Footer note */}
      <div className="text-center text-xs text-gray-400 pb-6">
        Powered by Supabase
      </div>
    </div>
  );
}
