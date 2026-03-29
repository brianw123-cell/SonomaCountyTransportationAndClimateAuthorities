import { supabase } from './supabase'

// ============================================================
// ID GENERATION
// ============================================================

/**
 * Generate the next sequential ID for a table.
 * Queries the max existing ID, parses the numeric suffix, and returns prefix-NNNNN.
 * Falls back to prefix-10001 if the table is empty.
 */
export async function getNextId(
  prefix: string,
  table: string,
  idColumn: string
): Promise<string> {
  const { data, error } = await supabase
    .from(table)
    .select(idColumn)
    .order(idColumn, { ascending: false })
    .limit(1)

  if (error) throw error

  if (!data || data.length === 0) {
    return `${prefix}-10001`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = data[0] as any
  const lastId = String(row[idColumn])
  const numericPart = parseInt(lastId.replace(`${prefix}-`, ''), 10)
  return `${prefix}-${numericPart + 1}`
}

// ============================================================
// PROJECT MUTATIONS
// ============================================================

export interface CreateProjectInput {
  prj_name: string
  prj_status: string | null
  prj_budget: number | null
  prj_start_date: string | null
  prj_end_date: string | null
  prj_funding_source: string | null
  prj_description: string | null
  prj_notes: string | null
}

/** Create a new project with auto-generated ID */
export async function createProject(project: CreateProjectInput) {
  const prjId = await getNextId('PRJ', 'projects', 'prj_id')

  const { data, error } = await supabase
    .from('projects')
    .insert({ prj_id: prjId, ...project })
    .select()
    .single()

  if (error) throw error
  return data
}

/** Link a project to an action via the act_prj junction table */
export async function linkProjectToAction(prjId: string, actId: string) {
  const relId = await getNextId('REL', 'act_prj', 'rel_id')

  const { error } = await supabase.from('act_prj').insert({
    rel_id: relId,
    rel_from: actId,
    rel_to: prjId,
    name_from: actId,
    name_to: prjId,
  })

  if (error) throw error
}

/** Link a project to an organization via the org_prj junction table */
export async function linkProjectToOrg(prjId: string, orgId: string) {
  const relId = await getNextId('REL', 'org_prj', 'rel_id')

  const { error } = await supabase.from('org_prj').insert({
    rel_id: relId,
    rel_from: orgId,
    rel_to: prjId,
    name_from: orgId,
    name_to: prjId,
  })

  if (error) throw error
}

// ============================================================
// ACTION MUTATIONS
// ============================================================

export interface UpdateActionInput {
  act_status?: string | null
  act_timeline?: string | null
  act_priority?: number | null
  act_spotlight?: string | null
  clearpath_url?: string | null
}

/** Update fields on an existing action */
export async function updateActionStatus(actId: string, updates: UpdateActionInput) {
  const { data, error } = await supabase
    .from('actions')
    .update(updates)
    .eq('act_id', actId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// FUNDING MUTATIONS
// ============================================================

export interface CreateFundingInput {
  fnd_name: string
  fnd_amount: number | null
  fnd_source: string | null
  fnd_type: string | null
  fnd_start: string | null
  fnd_end: string | null
  fnd_status: string | null
  fnd_url: string | null
  fnd_notes: string | null
}

/** Create a new funding record with auto-generated ID */
export async function createFunding(funding: CreateFundingInput) {
  const fndId = await getNextId('FND', 'funding', 'fnd_id')
  const { data, error } = await supabase
    .from('funding')
    .insert({ fnd_id: fndId, ...funding })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Link funding to a project via prj_fnd junction */
export async function linkFundingToProject(fndId: string, prjId: string) {
  const relId = await getNextId('REL', 'prj_fnd', 'rel_id')
  const { error } = await supabase.from('prj_fnd').insert({
    rel_id: relId, rel_from: prjId, rel_to: fndId,
    name_from: prjId, name_to: fndId,
  })
  if (error) throw error
}

/** Link funding to an org via org_fnd junction */
export async function linkFundingToOrg(fndId: string, orgId: string) {
  const relId = await getNextId('REL', 'org_fnd', 'rel_id')
  const { error } = await supabase.from('org_fnd').insert({
    rel_id: relId, rel_from: orgId, rel_to: fndId,
    name_from: orgId, name_to: fndId,
  })
  if (error) throw error
}

// ============================================================
// ORGANIZATION MUTATIONS
// ============================================================

export interface CreateOrgInput {
  org_name: string
  org_url: string | null
  org_acronym: string | null
  org_type: string | null
  org_description: string | null
  org_notes: string | null
}

export async function createOrg(org: CreateOrgInput) {
  const orgId = await getNextId('ORG', 'orgs', 'org_id')
  const { data, error } = await supabase
    .from('orgs')
    .insert({ org_id: orgId, ...org })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// DOCUMENT MUTATIONS
// ============================================================

export interface CreateDocInput {
  doc_name: string
  org_parent: string | null
  doc_date: string | null
  doc_type: string | null
  doc_url: string | null
  doc_evaluated: string | null
  doc_description: string | null
  doc_notes: string | null
}

export async function createDoc(doc: CreateDocInput) {
  const docId = await getNextId('DOC', 'docs', 'doc_id')
  const { data, error } = await supabase
    .from('docs')
    .insert({ doc_id: docId, ...doc })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Link a doc to an org via doc_org junction */
export async function linkDocToOrg(docId: string, orgId: string) {
  const relId = await getNextId('REL', 'doc_org', 'rel_id')
  const { error } = await supabase.from('doc_org').insert({
    rel_id: relId, rel_from: orgId, rel_to: docId,
    name_from: orgId, name_to: docId, rel_class: 'ORG-DOC', rel_type: 'Parent-Document',
  })
  if (error) throw error
}

// ============================================================
// INDIVIDUAL MUTATIONS
// ============================================================

export async function createIndividual(ind: {
  ind_name: string
  ind_email?: string | null
  ind_title?: string | null
  ind_phone?: string | null
  ind_notes?: string | null
}) {
  const indId = await getNextId('IND', 'individuals', 'ind_id')
  const { data, error } = await supabase
    .from('individuals')
    .insert({ ind_id: indId, ...ind })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function linkIndToOrg(indId: string, orgId: string, role?: string) {
  const relId = await getNextId('REL', 'org_ind', 'rel_id')
  const { error } = await supabase.from('org_ind').insert({
    rel_id: relId,
    rel_from: orgId,
    rel_to: indId,
    name_from: orgId,
    name_to: indId,
    ind_role: role ?? null,
  })
  if (error) throw error
}

// ============================================================
// USER ROLE MUTATIONS
// ============================================================

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

export async function setUserRole(userId: string, role: string, orgId?: string, orgName?: string) {
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role, org_id: orgId ?? null, org_name: orgName ?? null })
  if (error) throw error
}
