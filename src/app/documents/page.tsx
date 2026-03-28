import { getDocs } from "@/lib/queries";
import DocList from "@/components/DocList";

export const metadata = {
  title: "Document Library | SCTCA Climate Action Tracker",
  description: "Climate action plans and strategies across Sonoma County.",
};

export default async function DocumentsPage() {
  const docs = await getDocs();

  // Derive unique doc types and counts
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
      {/* Hero */}
      <section className="bg-[#8ccacf] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Document Library
          </h2>
          <p className="mt-2 text-lg text-white/80 font-medium">
            Climate action plans and strategies
          </p>
          <div className="mt-4 w-20 h-[3px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      {/* Summary Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-[#8ccacf]">
            <p className="text-4xl font-bold text-[#8ccacf]">{docs.length}</p>
            <p className="text-[#313131]/60 mt-1 text-sm font-medium uppercase tracking-wide">
              Total Documents
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-[#f3d597]">
            <p className="text-4xl font-bold text-[#e75425]">
              {docTypes.length}
            </p>
            <p className="text-[#313131]/60 mt-1 text-sm font-medium uppercase tracking-wide">
              Document Types
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-l-4 border-[#e75425]">
            <p className="text-4xl font-bold text-[#8ccacf]">
              {evaluatedCount}
            </p>
            <p className="text-[#313131]/60 mt-1 text-sm font-medium uppercase tracking-wide">
              Evaluated
            </p>
          </div>
        </div>
      </section>

      {/* Doc List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-12">
        <DocList docs={docs} docTypes={docTypes} />
      </section>
    </div>
  );
}
