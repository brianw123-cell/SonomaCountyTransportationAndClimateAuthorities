import Link from "next/link"

const reportTypes = [
  {
    title: "Action Summary Report",
    href: "/reports/actions",
    description: "Printable summary of climate actions by jurisdiction with status and timeline details.",
    icon: (
      <svg className="w-6 h-6 text-[#8ccacf]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.251 2.251 0 011.65.75m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    title: "Sector Breakdown Report",
    href: "/reports/sectors",
    description: "Actions organized by sector with counts and detailed listings for each category.",
    icon: (
      <svg className="w-6 h-6 text-[#8ccacf]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "GHG Emissions Report",
    href: "/reports/emissions",
    description: "Greenhouse gas emissions trends, sector breakdowns, and year-over-year changes.",
    icon: (
      <svg className="w-6 h-6 text-[#8ccacf]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
  },
  {
    title: "Organization Directory",
    href: "/reports/organizations",
    description: "Complete directory of organizations grouped by type with contact details.",
    icon: (
      <svg className="w-6 h-6 text-[#8ccacf]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
]

export default function ReportsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#8ccacf] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm opacity-90">
            Generate printable reports and summaries
          </p>
        </div>
      </section>

      {/* Report Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {reportTypes.map((report) => (
            <Link
              key={report.href}
              href={report.href}
              className="block bg-white rounded-lg border-l-4 border-[#8ccacf] shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{report.icon}</div>
                <div>
                  <h2 className="text-lg font-semibold text-[#313131]">
                    {report.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {report.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
