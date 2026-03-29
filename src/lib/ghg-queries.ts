import { supabase } from './supabase'

export interface GhgRow {
  id: number
  year: number
  jurisdiction: string
  activity_type: string
  activity_name: string | null
  activity_sector: string | null
  activity_sector2: string | null
  activity_utility: string | null
  activity_value: number | null
  activity_units: string | null
  activity_fuel_type: string | null
  total_mtco2e: number
  per_capita: number | null
  per_household: number | null
  per_employment: number | null
  mtco2e_per_capita: number | null
  mtco2e_per_household: number | null
  mtco2e_per_employment: number | null
  notes: string | null
}

export interface YearTotal {
  year: number
  total: number
}

export interface SectorTotal {
  sector: string
  total: number
  percent: number
}

export interface JurisdictionSummary {
  jurisdiction: string
  latestYear: number
  latestTotal: number
  baselineTotal: number
  changePercent: number
}

/** Get all unique jurisdictions */
export async function getJurisdictions(): Promise<string[]> {
  const { data, error } = await supabase
    .from('ghg_inventory')
    .select('jurisdiction')
  if (error) throw error
  const unique = [...new Set((data ?? []).map(r => r.jurisdiction))].sort()
  return unique
}

/** Get all available years */
export async function getGhgYears(): Promise<number[]> {
  const { data, error } = await supabase
    .from('ghg_inventory')
    .select('year')
  if (error) throw error
  const unique = [...new Set((data ?? []).map(r => r.year as number))].sort()
  return unique
}

/** Get total emissions by year for a jurisdiction */
export async function getEmissionsByYear(jurisdiction: string): Promise<YearTotal[]> {
  const { data, error } = await supabase
    .from('ghg_inventory')
    .select('year, total_mtco2e')
    .eq('jurisdiction', jurisdiction)
  if (error) throw error

  const byYear: Record<number, number> = {}
  for (const row of data ?? []) {
    const y = row.year as number
    byYear[y] = (byYear[y] ?? 0) + (row.total_mtco2e as number)
  }

  return Object.entries(byYear)
    .map(([year, total]) => ({ year: Number(year), total }))
    .sort((a, b) => a.year - b.year)
}

/** Get emissions by sector for a jurisdiction and year */
export async function getEmissionsBySector(jurisdiction: string, year: number): Promise<SectorTotal[]> {
  const { data, error } = await supabase
    .from('ghg_inventory')
    .select('activity_type, total_mtco2e')
    .eq('jurisdiction', jurisdiction)
    .eq('year', year)
  if (error) throw error

  const bySector: Record<string, number> = {}
  for (const row of data ?? []) {
    const s = row.activity_type as string
    bySector[s] = (bySector[s] ?? 0) + (row.total_mtco2e as number)
  }

  const grandTotal = Object.values(bySector).reduce((a, b) => a + b, 0)

  return Object.entries(bySector)
    .map(([sector, total]) => ({
      sector,
      total,
      percent: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
}

/** Get detailed rows for a jurisdiction, year, and optionally sector */
export async function getGhgDetail(
  jurisdiction: string,
  year: number,
  sector?: string
): Promise<GhgRow[]> {
  let query = supabase
    .from('ghg_inventory')
    .select('*')
    .eq('jurisdiction', jurisdiction)
    .eq('year', year)
    .order('total_mtco2e', { ascending: false })
  if (sector) query = query.eq('activity_type', sector)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as GhgRow[]
}

/** Get summary for all jurisdictions (latest year vs baseline) */
export async function getAllJurisdictionSummaries(): Promise<JurisdictionSummary[]> {
  const { data, error } = await supabase
    .from('ghg_inventory')
    .select('jurisdiction, year, total_mtco2e')
  if (error) throw error

  // Group by jurisdiction and year
  const grouped: Record<string, Record<number, number>> = {}
  for (const row of data ?? []) {
    const j = row.jurisdiction as string
    const y = row.year as number
    if (!grouped[j]) grouped[j] = {}
    grouped[j][y] = (grouped[j][y] ?? 0) + (row.total_mtco2e as number)
  }

  return Object.entries(grouped).map(([jurisdiction, years]) => {
    const yearNums = Object.keys(years).map(Number).sort()
    const baselineYear = yearNums[0]
    const latestYear = yearNums[yearNums.length - 1]
    const baselineTotal = years[baselineYear]
    const latestTotal = years[latestYear]
    const changePercent = baselineTotal > 0
      ? ((latestTotal - baselineTotal) / baselineTotal) * 100
      : 0

    return { jurisdiction, latestYear, latestTotal, baselineTotal, changePercent }
  }).sort((a, b) => a.jurisdiction.localeCompare(b.jurisdiction))
}

/** Get emissions by year for ALL jurisdictions (for comparison chart) */
export async function getCountywideTrend(): Promise<YearTotal[]> {
  return getEmissionsByYear('Countywide')
}

/** Get all unique sectors (activity_type values) */
export async function getGhgSectors(): Promise<string[]> {
  const { data, error } = await supabase
    .from('ghg_inventory')
    .select('activity_type')
  if (error) throw error
  const unique = [...new Set((data ?? []).map(r => r.activity_type as string))].filter(Boolean).sort()
  return unique
}

export interface PerCapitaMetrics {
  perCapita: number | null
  perHousehold: number | null
  perEmployment: number | null
}

/** Get per-capita metrics for a jurisdiction and year (summed) */
export async function getPerCapitaMetrics(jurisdiction: string, year: number): Promise<PerCapitaMetrics> {
  const { data, error } = await supabase
    .from('ghg_inventory')
    .select('mtco2e_per_capita, mtco2e_per_household, mtco2e_per_employment')
    .eq('jurisdiction', jurisdiction)
    .eq('year', year)
  if (error) throw error

  // Per-capita metrics are typically the same across rows for a jurisdiction/year
  // Take the first non-null value found
  let perCapita: number | null = null
  let perHousehold: number | null = null
  let perEmployment: number | null = null

  for (const row of data ?? []) {
    if (row.mtco2e_per_capita != null && perCapita == null) perCapita = row.mtco2e_per_capita as number
    if (row.mtco2e_per_household != null && perHousehold == null) perHousehold = row.mtco2e_per_household as number
    if (row.mtco2e_per_employment != null && perEmployment == null) perEmployment = row.mtco2e_per_employment as number
  }

  return { perCapita, perHousehold, perEmployment }
}

/** Get all data for a jurisdiction (all years, all sectors) for client-side filtering */
export async function getAllDataForJurisdiction(jurisdiction: string): Promise<GhgRow[]> {
  const { data, error } = await supabase
    .from('ghg_inventory')
    .select('*')
    .eq('jurisdiction', jurisdiction)
    .order('year', { ascending: true })
    .order('total_mtco2e', { ascending: false })
  if (error) throw error
  return (data ?? []) as GhgRow[]
}
