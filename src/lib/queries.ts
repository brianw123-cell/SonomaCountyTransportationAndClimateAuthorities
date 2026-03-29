import { supabase } from './supabase'
import type { Org, Doc, Action, Project, Transition, Resource, DocWithActions, SectorCount } from '@/types/supabase'

// ============================================================
// ORGANIZATION QUERIES
// ============================================================

/** Get all organizations, optionally filtered by type */
export async function getOrgs(orgType?: string) {
  let query = supabase.from('orgs').select('*').order('org_name')
  if (orgType) query = query.eq('org_type', orgType)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/** Get a single organization by ID */
export async function getOrgById(orgId: string) {
  const { data, error } = await supabase
    .from('orgs')
    .select('*')
    .eq('org_id', orgId)
    .single()
  if (error) throw error
  return data
}

/** Get org children (from org_org junction) */
export async function getOrgChildren(orgId: string) {
  const { data: rels, error: relError } = await supabase
    .from('org_org')
    .select('*')
    .eq('rel_from', orgId)
  if (relError) throw relError

  const childIds = rels?.map((r) => r.rel_to) ?? []
  if (childIds.length === 0) return []

  const { data, error } = await supabase
    .from('orgs')
    .select('*')
    .in('org_id', childIds)
    .order('org_name')
  if (error) throw error
  return data ?? []
}

// ============================================================
// DOCUMENT QUERIES
// ============================================================

/** Get all documents, optionally filtered by type */
export async function getDocs(docType?: string) {
  let query = supabase.from('docs').select('*').order('doc_name')
  if (docType) query = query.eq('doc_type', docType)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/** Get documents for an organization (via doc_org junction) */
export async function getDocsForOrg(orgId: string) {
  const { data: rels, error: relError } = await supabase
    .from('doc_org')
    .select('rel_to')
    .eq('rel_from', orgId)
  if (relError) throw relError

  const docIds = rels?.map((r) => r.rel_to) ?? []
  if (docIds.length === 0) return []

  const { data, error } = await supabase
    .from('docs')
    .select('*')
    .in('doc_id', docIds)
    .order('doc_name')
  if (error) throw error
  return data ?? []
}

/** Get a single document by ID */
export async function getDocById(docId: string) {
  const { data, error } = await supabase
    .from('docs')
    .select('*')
    .eq('doc_id', docId)
    .single()
  if (error) throw error
  return data
}

// ============================================================
// ACTION QUERIES
// ============================================================

/** Get actions for a document (via act_doc junction) */
export async function getActionsForDoc(docId: string) {
  const { data: rels, error: relError } = await supabase
    .from('act_doc')
    .select('rel_to')
    .eq('rel_from', docId)
  if (relError) throw relError

  const actIds = (rels?.map((r) => r.rel_to).filter(Boolean) as string[]) ?? []
  if (actIds.length === 0) return []

  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .in('act_id', actIds)
    .order('act_id')
  if (error) throw error
  return data ?? []
}

/** Get a single action by ID */
export async function getActionById(actId: string) {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('act_id', actId)
    .single()
  if (error) throw error
  return data
}

/**
 * Get all actions for an org (full traversal: ORG -> DOC_ORG -> DOC -> ACT_DOC -> ACT).
 * Two-hop join through junction tables.
 */
export async function getActionsForOrg(orgId: string) {
  const { data: docRels, error: docError } = await supabase
    .from('doc_org')
    .select('rel_to')
    .eq('rel_from', orgId)
  if (docError) throw docError

  const docIds = docRels?.map((r) => r.rel_to) ?? []
  if (docIds.length === 0) return []

  const { data: actRels, error: actError } = await supabase
    .from('act_doc')
    .select('rel_to')
    .in('rel_from', docIds)
  if (actError) throw actError

  const actIds = (actRels?.map((r) => r.rel_to).filter(Boolean) as string[]) ?? []
  if (actIds.length === 0) return []

  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .in('act_id', actIds)
    .order('act_id')
  if (error) throw error
  return data ?? []
}

/** Get actions filtered by sector */
export async function getActionsBySector(sector: string) {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('act_sector', sector)
    .order('act_id')
  if (error) throw error
  return data ?? []
}

/** Get Petaluma spotlight actions (act_spotlight is not null) */
export async function getSpotlightActions() {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .not('act_spotlight', 'is', null)
    .order('act_spotlight')
  if (error) throw error
  return data ?? []
}

// ============================================================
// PROJECT QUERIES
// ============================================================

/** Get projects for an action (via act_prj junction) */
export async function getProjectsForAction(actId: string) {
  const { data: rels, error: relError } = await supabase
    .from('act_prj')
    .select('rel_to')
    .eq('rel_from', actId)
  if (relError) throw relError

  const prjIds = rels?.map((r) => r.rel_to) ?? []
  if (prjIds.length === 0) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('prj_id', prjIds)
  if (error) throw error
  return data ?? []
}

/** Get projects for an org (via org_prj junction - direct link) */
export async function getProjectsForOrg(orgId: string) {
  const { data: rels, error: relError } = await supabase
    .from('org_prj')
    .select('rel_to')
    .eq('rel_from', orgId)
  if (relError) throw relError

  const prjIds = rels?.map((r) => r.rel_to) ?? []
  if (prjIds.length === 0) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .in('prj_id', prjIds)
  if (error) throw error
  return data ?? []
}

// ============================================================
// TRANSITION QUERIES
// ============================================================

/** Get transitions for an action (via act_trn junction) */
export async function getTransitionsForAction(actId: string) {
  const { data: rels, error: relError } = await supabase
    .from('act_trn')
    .select('rel_to')
    .eq('rel_from', actId)
  if (relError) throw relError

  const trnIds = (rels?.map((r) => r.rel_to).filter(Boolean) as string[]) ?? []
  if (trnIds.length === 0) return []

  const { data, error } = await supabase
    .from('transitions')
    .select('*')
    .in('trn_id', trnIds)
  if (error) throw error
  return data ?? []
}

// ============================================================
// RESOURCE QUERIES
// ============================================================

/** Get resources for an organization (via org_res junction) */
export async function getResourcesForOrg(orgId: string) {
  const { data: rels, error: relError } = await supabase
    .from('org_res')
    .select('rel_to')
    .eq('rel_from', orgId)
  if (relError) throw relError

  const resIds = rels?.map((r) => r.rel_to) ?? []
  if (resIds.length === 0) return []

  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .in('res_id', resIds)
  if (error) throw error
  return data ?? []
}

// ============================================================
// INDIVIDUAL QUERIES
// ============================================================

/** Get all individuals */
export async function getIndividuals() {
  const { data, error } = await supabase.from('individuals').select('*').order('ind_name')
  if (error) throw error
  return data ?? []
}

/** Get individuals with their org links (from org_ind junction) */
export async function getIndividualsWithOrgs() {
  const { data: individuals, error: indError } = await supabase
    .from('individuals')
    .select('*')
    .order('ind_name')
  if (indError) throw indError

  const { data: links, error: linkError } = await supabase
    .from('org_ind')
    .select('*')
  if (linkError) throw linkError

  const { data: orgs, error: orgError } = await supabase
    .from('orgs')
    .select('org_id, org_name')
  if (orgError) throw orgError

  const orgMap = new Map(orgs?.map((o) => [o.org_id, o.org_name]) ?? [])

  return (individuals ?? []).map((ind) => {
    const orgLinks = (links ?? []).filter((l) => l.rel_to === ind.ind_id)
    return {
      ...ind,
      orgs: orgLinks.map((l) => ({
        org_id: l.rel_from,
        org_name: orgMap.get(l.rel_from) ?? l.name_from ?? 'Unknown',
        ind_role: l.ind_role ?? null,
      })),
    }
  })
}

// ============================================================
// ENUM / LOOKUP QUERIES
// ============================================================

export async function getDocTypes() {
  const { data, error } = await supabase.from('doc_types').select('name').order('name')
  if (error) throw error
  return data?.map((r) => r.name) ?? []
}

export async function getActSectors() {
  const { data, error } = await supabase.from('act_sectors').select('name').order('name')
  if (error) throw error
  return data?.map((r) => r.name) ?? []
}

export async function getOrgTypes() {
  const { data, error } = await supabase.from('org_types').select('name').order('name')
  if (error) throw error
  return data?.map((r) => r.name) ?? []
}

export async function getActTimelines() {
  const { data, error } = await supabase.from('act_timelines').select('name').order('id')
  if (error) throw error
  return data?.map((r) => r.name) ?? []
}

export async function getTrnTypes() {
  const { data, error } = await supabase.from('trn_types').select('name').order('name')
  if (error) throw error
  return data?.map((r) => r.name) ?? []
}

// ============================================================
// JURISDICTION SWITCHER QUERIES
// ============================================================

/** Get only orgs that have at least one action (via doc_org -> act_doc traversal) */
export async function getOrgsWithActions() {
  // Step 1: Get all doc_org records
  const { data: docOrgRels, error: doError } = await supabase
    .from('doc_org')
    .select('rel_from, rel_to')
  if (doError) throw doError

  // Step 2: Get all act_doc records
  const { data: actDocRels, error: adError } = await supabase
    .from('act_doc')
    .select('rel_from')
  if (adError) throw adError

  // Step 3: Cross-reference — find doc IDs that have at least one action
  const docsWithActions = new Set(actDocRels?.map((r) => r.rel_from) ?? [])

  // Step 4: Find org IDs whose docs appear in the actions set
  const orgIdsWithActions = new Set<string>()
  for (const rel of docOrgRels ?? []) {
    if (docsWithActions.has(rel.rel_to)) {
      orgIdsWithActions.add(rel.rel_from)
    }
  }

  if (orgIdsWithActions.size === 0) return []

  // Step 5: Fetch those orgs
  const { data, error } = await supabase
    .from('orgs')
    .select('org_id, org_name, org_acronym')
    .in('org_id', Array.from(orgIdsWithActions))
    .order('org_name')
  if (error) throw error
  return (data ?? []) as { org_id: string; org_name: string; org_acronym: string | null }[]
}

// ============================================================
// DASHBOARD / AGGREGATE QUERIES
// ============================================================

/** Get sector breakdown for an org (count of actions per sector) */
export async function getSectorBreakdownForOrg(orgId: string) {
  const actions = await getActionsForOrg(orgId)
  const breakdown: Record<string, number> = {}
  for (const a of actions) {
    const sector = a.act_sector ?? 'Unknown'
    breakdown[sector] = (breakdown[sector] ?? 0) + 1
  }
  return Object.entries(breakdown)
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count)
}

/** Get full hierarchy for an org: docs -> actions (for dashboard display) */
export async function getOrgHierarchy(orgId: string) {
  const docs = await getDocsForOrg(orgId)
  const hierarchy = await Promise.all(
    docs.map(async (doc) => {
      const actions = await getActionsForDoc(doc.doc_id)
      return { ...doc, actions }
    })
  )
  return hierarchy
}
