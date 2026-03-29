import {
  getAllJurisdictionSummaries,
  getEmissionsBySector,
  getPerCapitaMetrics,
} from "@/lib/ghg-queries";
import CompareClient from "./CompareClient";

export default async function ComparePage() {
  const summaries = await getAllJurisdictionSummaries();

  // Fetch dominant sector and per-capita for each jurisdiction
  const enriched = await Promise.all(
    summaries.map(async (s) => {
      const [sectors, perCapita] = await Promise.all([
        getEmissionsBySector(s.jurisdiction, s.latestYear),
        getPerCapitaMetrics(s.jurisdiction, s.latestYear),
      ]);
      const dominant = sectors.length > 0 ? sectors[0].sector : "N/A";
      return {
        ...s,
        dominantSector: dominant,
        perCapita: perCapita.perCapita,
      };
    })
  );

  return <CompareClient summaries={enriched} />;
}
