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
      {/* Hero — compact */}
      <section className="bg-[#8ccacf] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Organizational Directory
          </h2>
          <p className="mt-1 text-sm text-white/80 font-medium">
            Partner organizations across Sonoma County
          </p>
          <div className="mt-2 w-12 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      {/* Compact Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="bg-white shadow-sm rounded-full px-4 py-1.5 border-l-4 border-[#8ccacf] font-bold text-[#8ccacf]">
            {orgs.length} Total
          </span>
          {orgTypes.map((type) => (
            <span
              key={type}
              className="bg-white shadow-sm rounded-full px-3 py-1.5 text-[#313131]/70"
            >
              <span className="font-semibold text-[#8ccacf]">{typeCounts[type]}</span>{" "}
              {type}
            </span>
          ))}
        </div>
      </section>

      {/* Org List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        <OrgList orgs={orgs} orgTypes={orgTypes} />
      </section>
    </div>
  );
}
