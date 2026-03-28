import { getOrgs } from "@/lib/queries";
import OrgList from "@/components/OrgList";

export const metadata = {
  title: "Organizational Directory | SCTCA Climate Action Tracker",
  description: "Partner organizations across Sonoma County working on climate action.",
};

export default async function OrganizationsPage() {
  const orgs = await getOrgs();

  // Derive unique org types and counts
  const typeCounts: Record<string, number> = {};
  for (const org of orgs) {
    const t = org.org_type ?? "Unknown";
    typeCounts[t] = (typeCounts[t] ?? 0) + 1;
  }
  const orgTypes = Object.keys(typeCounts).sort();

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#8ccacf] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Organizational Directory
          </h2>
          <p className="mt-2 text-lg text-white/80 font-medium">
            Partner organizations across Sonoma County
          </p>
          <div className="mt-4 w-20 h-[3px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      {/* Summary Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-[#8ccacf]">
            <p className="text-4xl font-bold text-[#8ccacf]">{orgs.length}</p>
            <p className="text-[#313131]/60 mt-1 text-sm font-medium uppercase tracking-wide">
              Total Organizations
            </p>
          </div>
          {orgTypes.map((type, i) => {
            const borders = [
              "border-[#f3d597]",
              "border-[#e75425]",
              "border-[#8ccacf]",
              "border-[#f3d597]",
              "border-[#e75425]",
              "border-[#8ccacf]",
            ];
            const border = borders[i % borders.length];
            return (
              <div
                key={type}
                className={`bg-white rounded-lg shadow-md p-6 text-center border-l-4 ${border}`}
              >
                <p className="text-4xl font-bold text-[#8ccacf]">
                  {typeCounts[type]}
                </p>
                <p className="text-[#313131]/60 mt-1 text-sm font-medium uppercase tracking-wide">
                  {type}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Org List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <OrgList orgs={orgs} orgTypes={orgTypes} />
      </section>
    </div>
  );
}
