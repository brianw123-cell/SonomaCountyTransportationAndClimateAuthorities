import { getDocs } from "@/lib/queries";
import DocList from "@/components/DocList";

export const metadata = {
  title: "Document Library | SCTCA Climate Action Tracker",
  description: "Climate action plans and strategies across Sonoma County.",
};

export default async function DocumentsPage() {
  const docs = await getDocs();

  const typeCounts: Record<string, number> = {};
  let evaluatedCount = 0;
  for (const doc of docs) {
    const t = doc.doc_type ?? "Unknown";
    typeCounts[t] = (typeCounts[t] ?? 0) + 1;
    if (doc.doc_evaluated === "Y") evaluatedCount++;
  }
  const docTypes = Object.keys(typeCounts).sort();

  return (
    <div>
      {/* Hero — compact */}
      <section className="bg-[#8ccacf] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Document Library
          </h2>
          <p className="mt-1 text-sm text-white/80 font-medium">
            Climate action plans and strategies
          </p>
          <div className="mt-2 w-12 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      {/* Everything interactive in DocList */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        <DocList
          docs={docs}
          docTypes={docTypes}
          evaluatedCount={evaluatedCount}
        />
      </section>
    </div>
  );
}
