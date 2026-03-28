import Link from "next/link";
import { getActionById } from "@/lib/queries";

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

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const action = await getActionById(id);

  const sectorBg = SECTOR_COLORS[action.act_sector ?? ""] ?? "bg-gray-400";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <Link href="/" className="text-[#8ccacf] hover:text-[#8ccacf]/80 transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-400">Actions</span>
        <span>/</span>
        <span className="text-gray-700 font-medium">{action.act_id}</span>
      </nav>

      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium bg-[#8ccacf] text-white px-4 py-2 rounded-lg hover:bg-[#8ccacf]/90 transition-colors mb-6"
      >
        &larr; Back to Dashboard
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#8ccacf] text-white px-6 py-6">
          <p className="text-sm font-mono text-white/70">{action.act_id}</p>
          <h2 className="text-xl sm:text-2xl font-bold mt-1 leading-snug">
            {action.act_level3 ?? "Untitled Action"}
          </h2>
          <div className="mt-3 w-16 h-[2px] bg-[#f3d597] rounded-full" />
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Classification */}
          <Section title="Classification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sector">
                {action.act_sector ? (
                  <span
                    className={`${sectorBg} text-white text-xs font-medium px-2.5 py-1 rounded-full`}
                  >
                    {action.act_sector}
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </Field>
              <Field label="Goal (Level 1)" text={action.act_level1} />
              <Field
                label="Strategy (Level 2)"
                text={action.act_level2}
                full
              />
            </div>
          </Section>

          {/* Status */}
          <Section title="Status">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Status" text={action.act_status} />
              <Field label="Timeline" text={action.act_timeline} />
              <Field label="Timeframe" text={action.act_timeframe} />
              <Field
                label="Priority"
                text={
                  action.act_priority != null
                    ? String(action.act_priority)
                    : null
                }
              />
            </div>
          </Section>

          {/* Details */}
          <Section title="Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Actor" text={action.act_actor} />
              <Field label="Type" text={action.act_type} />
              <Field label="Impacted" text={action.act_impacted} />
              <Field label="Focus" text={action.act_focus} />
              <Field label="Results" text={action.act_results} full />
            </div>
          </Section>

          {/* ClearPath */}
          <Section title="ClearPath">
            {action.clearpath_url ? (
              <a
                href={action.clearpath_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8ccacf] hover:underline text-sm font-medium break-all"
              >
                {action.clearpath_url}
              </a>
            ) : (
              <p className="text-gray-400 text-sm">Not yet linked</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#8ccacf] uppercase tracking-wide mb-3 border-b-2 border-[#f3d597] pb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  text,
  children,
  full,
}: {
  label: string;
  text?: string | null;
  children?: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
        {label}
      </p>
      {children ? (
        <div className="mt-1">{children}</div>
      ) : (
        <p className="text-gray-700 mt-1">{text ?? "N/A"}</p>
      )}
    </div>
  );
}
