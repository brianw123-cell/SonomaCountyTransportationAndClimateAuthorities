// Manual type definitions matching our Supabase schema

export interface Org {
  org_id: string
  org_name: string
  org_url: string | null
  org_acronym: string | null
  org_logo: string | null
  org_type: string | null
  org_description: string | null
  org_notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Doc {
  doc_id: string
  doc_name: string
  org_parent: string | null
  doc_date: string | null
  doc_type: string | null
  doc_url: string | null
  doc_local: string | null
  doc_evaluated: string | null
  doc_description: string | null
  doc_notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Action {
  act_id: string
  doc_name: string | null
  org_name: string | null
  act_level1: string | null
  act_level2: string | null
  act_level3: string | null
  act_sector: string | null
  act_spotlight: string | null
  act_timeframe: string | null
  act_status: string | null
  act_timeline: string | null
  act_actor: string | null
  act_type: string | null
  act_impacted: string | null
  act_focus: string | null
  act_results: string | null
  act_priority: number | null
  clearpath_url: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Transition {
  trn_id: string
  trn_name: string
  trn_sector1: string | null
  trn_sector2: string | null
  trn_sector3: string | null
  trn_type: string | null
  trn_examples: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Project {
  prj_id: string
  prj_name: string
  prj_status: string | null
  prj_budget: number | null
  prj_start_date: string | null
  prj_end_date: string | null
  prj_funding_source: string | null
  prj_description: string | null
  prj_notes: string | null
  clearpath_url: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Resource {
  res_id: string
  res_name: string
  org_parent: string | null
  res_date: string | null
  res_type: string | null
  res_url: string | null
  res_description: string | null
  res_notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface DocWithActions extends Doc {
  actions: Action[]
}

export interface SectorCount {
  sector: string
  count: number
}
