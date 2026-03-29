import {
  getActionsForOrg,
  getDocsForOrg,
  getSectorBreakdownForOrg,
  getOrgsWithActions,
  getOrgById,
} from "@/lib/queries";
import ActionsList from "@/components/ActionsList";

const DEFAULT_ORG_ID = "ORG-10006";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const params = await searchParams;
  const selectedOrgId = params.org || DEFAULT_ORG_ID;

  const [actions, docs, sectorBreakdown, allOrgs, selectedOrg] =
    await Promise.all([
      getActionsForOrg(selectedOrgId),
      getDocsForOrg(selectedOrgId),
      getSectorBreakdownForOrg(selectedOrgId),
      getOrgsWithActions(),
      getOrgById(selectedOrgId),
    ]);

  const sectors = sectorBreakdown.map((s) => s.sector);
  const selectedOrgName = selectedOrg?.org_name ?? "Unknown Organization";
  const docName =
    docs.length === 1
      ? docs[0].doc_name
      : docs.length > 1
        ? `${docs.length} Documents`
        : "No Documents";

  return (
    <div>
      {/* Hero — compact */}
      <section className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {selectedOrgName}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/80 font-medium">
            {docName}
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
          selectedOrgId={selectedOrgId}
          selectedOrgName={selectedOrgName}
          docName={docName}
          allOrgs={allOrgs}
        />
      </section>

      {/* Footer note */}
      <div className="text-center text-xs text-gray-400 pb-6">
        Powered by Supabase
      </div>
    </div>
  );
}
