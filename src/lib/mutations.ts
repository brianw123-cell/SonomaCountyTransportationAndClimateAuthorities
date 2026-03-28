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
