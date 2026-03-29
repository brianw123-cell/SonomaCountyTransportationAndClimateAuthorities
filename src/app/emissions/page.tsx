import {
  getJurisdictions,
  getEmissionsByYear,
  getEmissionsBySector,
  getPerCapitaMetrics,
  getAllJurisdictionSummaries,
} from "@/lib/ghg-queries";
import EmissionsClient from "./EmissionsClient";

export default async function EmissionsPage() {
  // Fetch all static data server-side
  const [jurisdictions, summaries] = await Promise.all([
    getJurisdictions(),
    getAllJurisdictionSummaries(),
  ]);

  // Pre-fetch data for all jurisdictions so client can switch instantly
  const allData: Record<
    string,
    {
      trend: Awaited<ReturnType<typeof getEmissionsByYear>>;
      sectors: Awaited<ReturnType<typeof getEmissionsBySector>>;
      perCapita: Awaited<ReturnType<typeof getPerCapitaMetrics>>;
      baselineYear: number;
      latestYear: number;
      baselineTotal: number;
      latestTotal: number;
      changePercent: number;
    }
  > = {};

  for (const j of jurisdictions) {
    const trend = await getEmissionsByYear(j);
    const summary = summaries.find((s) => s.jurisdiction === j);
    const latestYear = trend.length > 0 ? trend[trend.length - 1].year : 2022;
    const baselineYear = trend.length > 0 ? trend[0].year : 1990;
    const [sectors, perCapita] = await Promise.all([
      getEmissionsBySector(j, latestYear),
      getPerCapitaMetrics(j, latestYear),
    ]);

    allData[j] = {
      trend,
      sectors,
      perCapita,
      baselineYear,
      latestYear,
      baselineTotal: summary?.baselineTotal ?? 0,
      latestTotal: summary?.latestTotal ?? 0,
      changePercent: summary?.changePercent ?? 0,
    };
  }

  return <EmissionsClient jurisdictions={jurisdictions} allData={allData} />;
}
