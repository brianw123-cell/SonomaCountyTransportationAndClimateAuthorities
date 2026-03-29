'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ============================================================
// TYPES
// ============================================================

interface IssueCard {
  id: string
  title: string
  count: number
  severity: 'critical' | 'warning' | 'info'
  description: string
  table: string
}

interface TableHealth {
  table: string
  label: string
  rows: number
  requiredFilled: number
  requiredTotal: number
  optionalFilled: number
  optionalTotal: number
}

interface JunctionCheck {
  junction: string
  label: string
  fromTable: string
  toTable: string
  brokenFrom: number
  brokenTo: number
  total: number
}

interface DuplicateOrg {
  org_id: string
  org_name: string
  org_type: string | null
  org_url: string | null
  org_description: string | null
  junctionCount: number
}

interface PlaceholderOrg {
  org_id: string
  org_name: string
  org_type: string | null
  selected: boolean
}

interface OrgForBulk {
  org_name: string
  nullCount: number
}

// ============================================================
// COMPONENT
// ============================================================

export default function DataHealthPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [healthScore, setHealthScore] = useState(0)
  const [issues, setIssues] = useState<IssueCard[]>([])
  const [tableHealth, setTableHealth] = useState<TableHealth[]>([])
  const [junctionChecks, setJunctionChecks] = useState<JunctionCheck[]>([])

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    issues: true,
    quickfix: true,
    completeness: false,
    junctions: false,
  })

  // Quick fix state
  const [activePanel, setActivePanel] = useState<string | null>(null)

  // Duplicate org fix
  const [dupOrgs, setDupOrgs] = useState<DuplicateOrg[]>([])
  const [dupLoading, setDupLoading] = useState(false)

  // Bulk action status
  const [bulkStatusOrgs, setBulkStatusOrgs] = useState<OrgForBulk[]>([])
  const [selectedBulkOrg, setSelectedBulkOrg] = useState('')
  const [selectedBulkStatus, setSelectedBulkStatus] = useState('')
  const [bulkStatusCount, setBulkStatusCount] = useState(0)
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false)

  // Bulk org type
  const [nullTypeOrgs, setNullTypeOrgs] = useState<PlaceholderOrg[]>([])
  const [selectedOrgType, setSelectedOrgType] = useState('')
  const [orgTypes, setOrgTypes] = useState<string[]>([])
  const [bulkOrgTypeLoading, setBulkOrgTypeLoading] = useState(false)

  // Placeholder orgs
  const [placeholderOrgs, setPlaceholderOrgs] = useState<PlaceholderOrg[]>([])
  const [placeholderLoading, setPlaceholderLoading] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ============================================================
  // DATA AUDIT
  // ============================================================

  useEffect(() => {
    async function runAudit() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      try {
        // Fetch all tables in parallel
        const [
          { data: allActions },
          { data: allOrgs },
          { data: allDocs },
          { data: allTransitions },
          { data: allResources },
          // Junction tables
          { data: actDoc },
          { data: docOrg },
          { data: orgOrg },
          { data: actTrn },
          { data: orgRes },
        ] = await Promise.all([
          supabase.from('actions').select('act_id, act_status, act_timeline, act_actor, act_sector, org_name, doc_name'),
          supabase.from('orgs').select('org_id, org_name, org_type, org_url, org_description, org_acronym'),
          supabase.from('docs').select('doc_id, doc_name, doc_type, doc_url, doc_date, doc_evaluated, doc_description, org_parent'),
          supabase.from('transitions').select('trn_id, trn_name, trn_type, trn_sector1'),
          supabase.from('resources').select('res_id, res_name, res_type, res_url, res_description'),
          supabase.from('act_doc').select('rel_id, rel_from, rel_to'),
          supabase.from('doc_org').select('rel_id, rel_from, rel_to'),
          supabase.from('org_org').select('rel_id, rel_from, rel_to'),
          supabase.from('act_trn').select('rel_id, rel_from, rel_to'),
          supabase.from('org_res').select('rel_id, rel_from, rel_to'),
        ])

        const actions = allActions ?? []
        const orgs = allOrgs ?? []
        const docs = allDocs ?? []
        const transitions = allTransitions ?? []
        const resources = allResources ?? []

        // ------- Build Issues -------
        const foundIssues: IssueCard[] = []

        // Duplicate orgs (trailing space)
        const orgNames = orgs.map(o => o.org_name?.trim())
        const dupeNames = orgNames.filter((name, i) =>
          name && orgNames.indexOf(name) !== i
        )
        if (dupeNames.length > 0) {
          foundIssues.push({
            id: 'dup-orgs',
            title: `${dupeNames.length} Duplicate Organization${dupeNames.length > 1 ? 's' : ''}`,
            count: dupeNames.length,
            severity: 'critical',
            description: 'Organizations with identical names (possibly trailing spaces)',
            table: 'orgs',
          })
        }

        // Orphan actions (no doc link via junction)
        const linkedActIds = new Set((actDoc ?? []).map(r => r.rel_to))
        const orphanActions = actions.filter(a => !linkedActIds.has(a.act_id))
        if (orphanActions.length > 0) {
          foundIssues.push({
            id: 'orphan-actions',
            title: `${orphanActions.length} Orphan Action${orphanActions.length > 1 ? 's' : ''}`,
            count: orphanActions.length,
            severity: 'critical',
            description: `Action${orphanActions.length > 1 ? 's' : ''} with no document link: ${orphanActions.map(a => a.act_id).join(', ')}`,
            table: 'actions',
          })
        }

        // Placeholder orgs (???)
        const placeholders = orgs.filter(o => o.org_name?.startsWith('???'))
        if (placeholders.length > 0) {
          foundIssues.push({
            id: 'placeholder-orgs',
            title: `${placeholders.length} Placeholder Organizations`,
            count: placeholders.length,
            severity: 'critical',
            description: 'Organization names starting with "???"',
            table: 'orgs',
          })
        }

        // Needs Refinement orgs
        const needsRefinement = orgs.filter(o => o.org_type === '*Needs Refinement')
        if (needsRefinement.length > 0) {
          foundIssues.push({
            id: 'needs-refinement',
            title: `${needsRefinement.length} Needs Refinement Orgs`,
            count: needsRefinement.length,
            severity: 'critical',
            description: 'Organizations with org_type = "*Needs Refinement"',
            table: 'orgs',
          })
        }

        // Actions missing status
        const noStatus = actions.filter(a => !a.act_status)
        if (noStatus.length > 0) {
          foundIssues.push({
            id: 'missing-status',
            title: `${noStatus.length.toLocaleString()} Actions Missing Status`,
            count: noStatus.length,
            severity: 'warning',
            description: 'act_status IS NULL',
            table: 'actions',
          })
        }

        // Actions missing timeline
        const noTimeline = actions.filter(a => !a.act_timeline)
        if (noTimeline.length > 0) {
          foundIssues.push({
            id: 'missing-timeline',
            title: `${noTimeline.length.toLocaleString()} Actions Missing Timeline`,
            count: noTimeline.length,
            severity: 'warning',
            description: 'act_timeline IS NULL',
            table: 'actions',
          })
        }

        // Actions missing actor
        const noActor = actions.filter(a => !a.act_actor)
        if (noActor.length > 0) {
          foundIssues.push({
            id: 'missing-actor',
            title: `${noActor.length} Actions Missing Actor`,
            count: noActor.length,
            severity: 'warning',
            description: 'act_actor IS NULL',
            table: 'actions',
          })
        }

        // Orgs missing type
        const noType = orgs.filter(o => !o.org_type)
        if (noType.length > 0) {
          foundIssues.push({
            id: 'missing-org-type',
            title: `${noType.length} Organizations Missing Type`,
            count: noType.length,
            severity: 'warning',
            description: 'org_type IS NULL',
            table: 'orgs',
          })
        }

        // Docs not evaluated
        const notEvaluated = docs.filter(d => !d.doc_evaluated || d.doc_evaluated === '?')
        if (notEvaluated.length > 0) {
          foundIssues.push({
            id: 'docs-not-evaluated',
            title: `${notEvaluated.length} Documents Not Evaluated`,
            count: notEvaluated.length,
            severity: 'warning',
            description: 'doc_evaluated IS NULL or "?"',
            table: 'docs',
          })
        }

        // Orgs missing URL (info)
        const noUrl = orgs.filter(o => !o.org_url)
        if (noUrl.length > 0) {
          foundIssues.push({
            id: 'missing-org-url',
            title: `${noUrl.length} Organizations Missing URL`,
            count: noUrl.length,
            severity: 'info',
            description: 'org_url IS NULL',
            table: 'orgs',
          })
        }

        // Docs evaluated as N
        const evalN = docs.filter(d => d.doc_evaluated === 'N')
        if (evalN.length > 0) {
          foundIssues.push({
            id: 'docs-eval-n',
            title: `${evalN.length} Documents Evaluated as N`,
            count: evalN.length,
            severity: 'info',
            description: 'doc_evaluated = "N" (not applicable)',
            table: 'docs',
          })
        }

        setIssues(foundIssues)

        // ------- Table Health -------
        const tHealth: TableHealth[] = []

        // Orgs: required = name; optional = type, url, acronym, description
        const orgReqFilled = orgs.filter(o => o.org_name).length
        const orgOptFilled = orgs.reduce((sum, o) => {
          let filled = 0
          if (o.org_type) filled++
          if (o.org_url) filled++
          if (o.org_acronym) filled++
          if (o.org_description) filled++
          return sum + filled
        }, 0)
        tHealth.push({
          table: 'orgs', label: 'Organizations', rows: orgs.length,
          requiredFilled: orgReqFilled, requiredTotal: orgs.length,
          optionalFilled: orgOptFilled, optionalTotal: orgs.length * 4,
        })

        // Docs: required = name, org_parent; optional = type, url, date, evaluated, description
        const docReqFilled = docs.reduce((sum, d) => {
          let filled = 0
          if (d.doc_name) filled++
          if (d.org_parent) filled++
          return sum + filled
        }, 0)
        const docOptFilled = docs.reduce((sum, d) => {
          let filled = 0
          if (d.doc_type) filled++
          if (d.doc_url) filled++
          if (d.doc_date) filled++
          if (d.doc_evaluated && d.doc_evaluated !== '?') filled++
          if (d.doc_description) filled++
          return sum + filled
        }, 0)
        tHealth.push({
          table: 'docs', label: 'Documents', rows: docs.length,
          requiredFilled: docReqFilled, requiredTotal: docs.length * 2,
          optionalFilled: docOptFilled, optionalTotal: docs.length * 5,
        })

        // Actions: required = act_id (always filled); optional = status, timeline, actor, sector
        const actOptFilled = actions.reduce((sum, a) => {
          let filled = 0
          if (a.act_status) filled++
          if (a.act_timeline) filled++
          if (a.act_actor) filled++
          if (a.act_sector) filled++
          return sum + filled
        }, 0)
        tHealth.push({
          table: 'actions', label: 'Actions', rows: actions.length,
          requiredFilled: actions.length, requiredTotal: actions.length,
          optionalFilled: actOptFilled, optionalTotal: actions.length * 4,
        })

        // Transitions: required = name; optional = type, sector1
        const trnOptFilled = transitions.reduce((sum, t) => {
          let filled = 0
          if (t.trn_type) filled++
          if (t.trn_sector1) filled++
          return sum + filled
        }, 0)
        tHealth.push({
          table: 'transitions', label: 'Transitions', rows: transitions.length,
          requiredFilled: transitions.filter(t => t.trn_name).length, requiredTotal: transitions.length,
          optionalFilled: trnOptFilled, optionalTotal: transitions.length * 2,
        })

        // Resources: required = name; optional = type, url, description
        const resOptFilled = resources.reduce((sum, r) => {
          let filled = 0
          if (r.res_type) filled++
          if (r.res_url) filled++
          if (r.res_description) filled++
          return sum + filled
        }, 0)
        tHealth.push({
          table: 'resources', label: 'Resources', rows: resources.length,
          requiredFilled: resources.filter(r => r.res_name).length, requiredTotal: resources.length,
          optionalFilled: resOptFilled, optionalTotal: resources.length * 3,
        })

        setTableHealth(tHealth)

        // ------- Health Score -------
        const totalReq = tHealth.reduce((s, t) => s + t.requiredTotal, 0)
        const totalReqFilled = tHealth.reduce((s, t) => s + t.requiredFilled, 0)
        const totalOpt = tHealth.reduce((s, t) => s + t.optionalTotal, 0)
        const totalOptFilled = tHealth.reduce((s, t) => s + t.optionalFilled, 0)
        const total = totalReq + totalOpt
        const filled = totalReqFilled + totalOptFilled
        setHealthScore(total > 0 ? Math.round((filled / total) * 100) : 0)

        // ------- Junction Integrity -------
        const orgIds = new Set(orgs.map(o => o.org_id))
        const docIds = new Set(docs.map(d => d.doc_id))
        const actIds = new Set(actions.map(a => a.act_id))
        const trnIds = new Set(transitions.map(t => t.trn_id))
        const resIds = new Set(resources.map(r => r.res_id))

        const jChecks: JunctionCheck[] = []

        // act_doc: from = doc, to = action
        const adRecs = actDoc ?? []
        jChecks.push({
          junction: 'act_doc', label: 'Action-Document', fromTable: 'docs', toTable: 'actions',
          brokenFrom: adRecs.filter(r => r.rel_from && !docIds.has(r.rel_from)).length,
          brokenTo: adRecs.filter(r => r.rel_to && !actIds.has(r.rel_to)).length,
          total: adRecs.length,
        })

        // doc_org: from = org, to = doc
        const doRecs = docOrg ?? []
        jChecks.push({
          junction: 'doc_org', label: 'Document-Organization', fromTable: 'orgs', toTable: 'docs',
          brokenFrom: doRecs.filter(r => r.rel_from && !orgIds.has(r.rel_from)).length,
          brokenTo: doRecs.filter(r => r.rel_to && !docIds.has(r.rel_to)).length,
          total: doRecs.length,
        })

        // org_org: both sides are orgs
        const ooRecs = orgOrg ?? []
        jChecks.push({
          junction: 'org_org', label: 'Organization-Organization', fromTable: 'orgs', toTable: 'orgs',
          brokenFrom: ooRecs.filter(r => r.rel_from && !orgIds.has(r.rel_from)).length,
          brokenTo: ooRecs.filter(r => r.rel_to && !orgIds.has(r.rel_to)).length,
          total: ooRecs.length,
        })

        // act_trn: from = action, to = transition
        const atRecs = actTrn ?? []
        jChecks.push({
          junction: 'act_trn', label: 'Action-Transition', fromTable: 'actions', toTable: 'transitions',
          brokenFrom: atRecs.filter(r => r.rel_from && !actIds.has(r.rel_from)).length,
          brokenTo: atRecs.filter(r => r.rel_to && !trnIds.has(r.rel_to)).length,
          total: atRecs.length,
        })

        // org_res: from = org, to = resource
        const orRecs = orgRes ?? []
        jChecks.push({
          junction: 'org_res', label: 'Organization-Resource', fromTable: 'orgs', toTable: 'resources',
          brokenFrom: orRecs.filter(r => r.rel_from && !orgIds.has(r.rel_from)).length,
          brokenTo: orRecs.filter(r => r.rel_to && !resIds.has(r.rel_to)).length,
          total: orRecs.length,
        })

        setJunctionChecks(jChecks)
      } catch (err) {
        console.error('Audit failed:', err)
        showToast('Failed to run data audit. Check console for details.', 'error')
      }

      setLoading(false)
    }

    runAudit()
  }, [router, showToast])

  // ============================================================
  // QUICK FIX: Duplicate Orgs
  // ============================================================

  async function loadDuplicateOrgs() {
    setDupLoading(true)
    setActivePanel('dup-orgs')
    try {
      const { data: orgs } = await supabase.from('orgs').select('org_id, org_name, org_type, org_url, org_description')
      if (!orgs) return

      // Find names that appear more than once (trimmed comparison)
      const nameMap = new Map<string, typeof orgs>()
      for (const o of orgs) {
        const trimmed = o.org_name?.trim() ?? ''
        if (!nameMap.has(trimmed)) nameMap.set(trimmed, [])
        nameMap.get(trimmed)!.push(o)
      }

      const dups: DuplicateOrg[] = []
      for (const [, group] of nameMap) {
        if (group.length > 1) {
          for (const o of group) {
            // Count junction references
            const [{ count: docOrgCount }, { count: orgOrgFromCount }, { count: orgOrgToCount }, { count: orgResCount }] = await Promise.all([
              supabase.from('doc_org').select('rel_id', { count: 'exact', head: true }).eq('rel_from', o.org_id),
              supabase.from('org_org').select('rel_id', { count: 'exact', head: true }).eq('rel_from', o.org_id),
              supabase.from('org_org').select('rel_id', { count: 'exact', head: true }).eq('rel_to', o.org_id),
              supabase.from('org_res').select('rel_id', { count: 'exact', head: true }).eq('rel_from', o.org_id),
            ])
            dups.push({
              ...o,
              junctionCount: (docOrgCount ?? 0) + (orgOrgFromCount ?? 0) + (orgOrgToCount ?? 0) + (orgResCount ?? 0),
            })
          }
        }
      }
      setDupOrgs(dups)
    } catch (err) {
      console.error(err)
      showToast('Failed to load duplicates', 'error')
    }
    setDupLoading(false)
  }

  async function mergeDuplicateOrg(keepId: string, deleteId: string) {
    if (!confirm(`Merge all references from ${deleteId} into ${keepId} and delete ${deleteId}?`)) return
    try {
      // Update all junction tables to point to the kept org
      await Promise.all([
        supabase.from('doc_org').update({ rel_from: keepId }).eq('rel_from', deleteId),
        supabase.from('org_org').update({ rel_from: keepId }).eq('rel_from', deleteId),
        supabase.from('org_org').update({ rel_to: keepId }).eq('rel_to', deleteId),
        supabase.from('org_res').update({ rel_from: keepId }).eq('rel_from', deleteId),
      ])
      // Delete the duplicate
      await supabase.from('orgs').delete().eq('org_id', deleteId)
      showToast(`Merged ${deleteId} into ${keepId} and deleted duplicate.`, 'success')
      setDupOrgs(prev => prev.filter(o => o.org_id !== deleteId))
    } catch (err) {
      console.error(err)
      showToast('Failed to merge duplicate org', 'error')
    }
  }

  // ============================================================
  // QUICK FIX: Bulk Set Action Status
  // ============================================================

  async function loadBulkStatusOrgs() {
    setActivePanel('bulk-status')
    setBulkStatusLoading(true)
    try {
      const { data: actions } = await supabase
        .from('actions')
        .select('org_name')
        .is('act_status', null)
      if (!actions) return

      const orgCounts = new Map<string, number>()
      for (const a of actions) {
        const name = a.org_name ?? '(no org)'
        orgCounts.set(name, (orgCounts.get(name) ?? 0) + 1)
      }

      const list: OrgForBulk[] = Array.from(orgCounts.entries())
        .map(([org_name, nullCount]) => ({ org_name, nullCount }))
        .sort((a, b) => b.nullCount - a.nullCount)

      setBulkStatusOrgs(list)
    } catch (err) {
      console.error(err)
      showToast('Failed to load orgs for bulk status', 'error')
    }
    setBulkStatusLoading(false)
  }

  async function applyBulkStatus() {
    if (!selectedBulkOrg || !selectedBulkStatus) return
    setBulkStatusLoading(true)
    try {
      const orgFilter = selectedBulkOrg === '(no org)' ? null : selectedBulkOrg
      let query = supabase.from('actions').update({ act_status: selectedBulkStatus }).is('act_status', null)
      if (orgFilter) {
        query = query.eq('org_name', orgFilter)
      } else {
        query = query.is('org_name', null)
      }
      const { error } = await query
      if (error) throw error
      showToast(`Updated actions to "${selectedBulkStatus}" for "${selectedBulkOrg}"`, 'success')
      // Refresh the count
      const entry = bulkStatusOrgs.find(o => o.org_name === selectedBulkOrg)
      if (entry) {
        setBulkStatusOrgs(prev => prev.filter(o => o.org_name !== selectedBulkOrg))
      }
    } catch (err) {
      console.error(err)
      showToast('Failed to apply bulk status', 'error')
    }
    setBulkStatusLoading(false)
  }

  // ============================================================
  // QUICK FIX: Bulk Set Org Type
  // ============================================================

  async function loadNullTypeOrgs() {
    setActivePanel('bulk-org-type')
    setBulkOrgTypeLoading(true)
    try {
      const [{ data: orgs }, { data: types }] = await Promise.all([
        supabase.from('orgs').select('org_id, org_name, org_type').is('org_type', null).order('org_name'),
        supabase.from('org_types').select('name').order('name'),
      ])
      setNullTypeOrgs((orgs ?? []).map(o => ({ ...o, selected: false })))
      setOrgTypes((types ?? []).map(t => t.name))
    } catch (err) {
      console.error(err)
      showToast('Failed to load orgs with no type', 'error')
    }
    setBulkOrgTypeLoading(false)
  }

  async function applyBulkOrgType() {
    if (!selectedOrgType) return
    const selected = nullTypeOrgs.filter(o => o.selected)
    if (selected.length === 0) { showToast('No organizations selected', 'error'); return }

    setBulkOrgTypeLoading(true)
    try {
      const ids = selected.map(o => o.org_id)
      const { error } = await supabase.from('orgs').update({ org_type: selectedOrgType }).in('org_id', ids)
      if (error) throw error
      showToast(`Set type "${selectedOrgType}" for ${ids.length} organizations`, 'success')
      setNullTypeOrgs(prev => prev.filter(o => !o.selected))
    } catch (err) {
      console.error(err)
      showToast('Failed to apply org type', 'error')
    }
    setBulkOrgTypeLoading(false)
  }

  // ============================================================
  // QUICK FIX: Placeholder Orgs
  // ============================================================

  async function loadPlaceholderOrgs() {
    setActivePanel('placeholder-orgs')
    setPlaceholderLoading(true)
    try {
      const { data } = await supabase
        .from('orgs')
        .select('org_id, org_name, org_type')
        .like('org_name', '???%')
        .order('org_name')
      setPlaceholderOrgs((data ?? []).map(o => ({ ...o, selected: false })))
    } catch (err) {
      console.error(err)
      showToast('Failed to load placeholder orgs', 'error')
    }
    setPlaceholderLoading(false)
  }

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const severityColors = {
    critical: { border: 'border-[#e75425]', bg: 'bg-[#e75425]/10', badge: 'bg-[#e75425] text-white' },
    warning: { border: 'border-[#f3d597]', bg: 'bg-[#f3d597]/10', badge: 'bg-[#f3d597] text-[#313131]' },
    info: { border: 'border-[#8ccacf]', bg: 'bg-[#8ccacf]/10', badge: 'bg-[#8ccacf] text-white' },
  }

  const healthColor = healthScore >= 80 ? '#22c55e' : healthScore >= 50 ? '#f3d597' : '#e75425'

  function pct(filled: number, total: number) {
    if (total === 0) return 100
    return Math.round((filled / total) * 100)
  }

  function healthBadge(p: number) {
    if (p >= 90) return <span className="text-green-600 font-medium">Good</span>
    if (p >= 60) return <span className="text-yellow-600 font-medium">Fair</span>
    return <span className="text-red-600 font-medium">Poor</span>
  }

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#8ccacf] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#8ccacf] font-medium">Auditing data quality...</p>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-[#e75425] text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#8ccacf] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-white">Data Health</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Data Health Dashboard</h1>
          <p className="mt-2 text-white/80 text-sm">
            Audit data quality, find issues, and apply bulk fixes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

        {/* ============== Section 1: Health Score ============== */}
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Circular score */}
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={healthColor} strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${(healthScore / 100) * 314} 314`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: healthColor }}>{healthScore}%</span>
              <span className="text-xs text-gray-500 mt-0.5">Health Score</span>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-[#313131] mb-2">Overall Data Quality</h2>
            <p className="text-sm text-gray-500 mb-4">
              Based on the ratio of populated fields to total expected fields across all tables.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-[#e75425]" />
                <span className="text-gray-600">{issues.filter(i => i.severity === 'critical').length} Critical</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-[#f3d597]" />
                <span className="text-gray-600">{issues.filter(i => i.severity === 'warning').length} Warnings</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full bg-[#8ccacf]" />
                <span className="text-gray-600">{issues.filter(i => i.severity === 'info').length} Info</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============== Section 2: Issue Cards ============== */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('issues')}
            className="flex items-center gap-2 w-full text-left mb-4"
          >
            <span className={`transition-transform ${expandedSections.issues ? 'rotate-90' : ''}`}>&#9654;</span>
            <h2 className="text-lg font-semibold text-[#313131]">Issue Cards ({issues.length})</h2>
          </button>

          {expandedSections.issues && (
            <div className="space-y-3">
              {(['critical', 'warning', 'info'] as const).map(severity => {
                const group = issues.filter(i => i.severity === severity)
                if (group.length === 0) return null
                return (
                  <div key={severity}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{
                      color: severity === 'critical' ? '#e75425' : severity === 'warning' ? '#b8860b' : '#5ba8ad'
                    }}>
                      {severity === 'critical' ? 'Critical' : severity === 'warning' ? 'Warning' : 'Info'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.map(issue => {
                        const colors = severityColors[issue.severity]
                        return (
                          <div key={issue.id} className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4`}>
                            <div className="flex items-start justify-between mb-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${colors.badge}`}>
                                {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-2xl font-bold text-[#313131]">{issue.count.toLocaleString()}</span>
                            </div>
                            <h4 className="font-semibold text-[#313131] text-sm mb-1">{issue.title}</h4>
                            <p className="text-xs text-gray-600">{issue.description}</p>
                            <p className="text-xs text-gray-400 mt-1">Table: {issue.table}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ============== Section 3: Quick Fix Actions ============== */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('quickfix')}
            className="flex items-center gap-2 w-full text-left mb-4"
          >
            <span className={`transition-transform ${expandedSections.quickfix ? 'rotate-90' : ''}`}>&#9654;</span>
            <h2 className="text-lg font-semibold text-[#313131]">Quick Fix Actions</h2>
          </button>

          {expandedSections.quickfix && (
            <div className="space-y-4">
              {/* Fix buttons row */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={loadDuplicateOrgs}
                  className="px-4 py-2 bg-[#e75425] text-white text-sm font-medium rounded-md hover:bg-[#d14a20] transition-colors"
                >
                  Fix Duplicate Orgs
                </button>
                <button
                  onClick={loadBulkStatusOrgs}
                  className="px-4 py-2 bg-[#f3d597] text-[#313131] text-sm font-medium rounded-md hover:bg-[#e8c77d] transition-colors"
                >
                  Bulk Set Action Status
                </button>
                <button
                  onClick={loadNullTypeOrgs}
                  className="px-4 py-2 bg-[#f3d597] text-[#313131] text-sm font-medium rounded-md hover:bg-[#e8c77d] transition-colors"
                >
                  Bulk Set Org Type
                </button>
                <button
                  onClick={loadPlaceholderOrgs}
                  className="px-4 py-2 bg-[#e75425] text-white text-sm font-medium rounded-md hover:bg-[#d14a20] transition-colors"
                >
                  Clean Placeholder Orgs
                </button>
              </div>

              {/* ---- Panel: Duplicate Orgs ---- */}
              {activePanel === 'dup-orgs' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#313131]">Duplicate Organizations</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
                  </div>
                  {dupLoading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : dupOrgs.length === 0 ? (
                    <p className="text-sm text-green-600 font-medium">No duplicate organizations found.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Group duplicates by trimmed name */}
                      {Array.from(new Set(dupOrgs.map(o => o.org_name?.trim()))).map(name => {
                        const group = dupOrgs.filter(o => o.org_name?.trim() === name)
                        return (
                          <div key={name} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-[#313131] mb-3">&ldquo;{name}&rdquo;</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {group.map(o => (
                                <div key={o.org_id} className="border border-gray-100 rounded p-3 text-sm">
                                  <p><strong>ID:</strong> {o.org_id}</p>
                                  <p><strong>Name:</strong> &ldquo;{o.org_name}&rdquo; ({o.org_name?.length} chars)</p>
                                  <p><strong>Type:</strong> {o.org_type ?? <span className="text-gray-400 italic">null</span>}</p>
                                  <p><strong>URL:</strong> {o.org_url ?? <span className="text-gray-400 italic">null</span>}</p>
                                  <p><strong>Junction refs:</strong> {o.junctionCount}</p>
                                  <div className="mt-2 flex gap-2">
                                    {group.filter(other => other.org_id !== o.org_id).map(other => (
                                      <button
                                        key={other.org_id}
                                        onClick={() => mergeDuplicateOrg(o.org_id, other.org_id)}
                                        className="px-3 py-1 bg-[#8ccacf] text-white text-xs font-medium rounded hover:bg-[#7ab8bd] transition-colors"
                                      >
                                        Keep this, delete {other.org_id}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ---- Panel: Bulk Action Status ---- */}
              {activePanel === 'bulk-status' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#313131]">Bulk Set Action Status</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
                  </div>
                  {bulkStatusLoading && !bulkStatusOrgs.length ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : bulkStatusOrgs.length === 0 ? (
                    <p className="text-sm text-green-600 font-medium">All actions have a status set.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                          <select
                            value={selectedBulkOrg}
                            onChange={e => {
                              setSelectedBulkOrg(e.target.value)
                              const entry = bulkStatusOrgs.find(o => o.org_name === e.target.value)
                              setBulkStatusCount(entry?.nullCount ?? 0)
                            }}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#8ccacf] focus:border-[#8ccacf]"
                          >
                            <option value="">Select organization...</option>
                            {bulkStatusOrgs.map(o => (
                              <option key={o.org_name} value={o.org_name}>
                                {o.org_name} ({o.nullCount} missing)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Set Status To</label>
                          <select
                            value={selectedBulkStatus}
                            onChange={e => setSelectedBulkStatus(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#8ccacf] focus:border-[#8ccacf]"
                          >
                            <option value="">Select status...</option>
                            <option value="Not Started">Not Started</option>
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      {selectedBulkOrg && (
                        <div className="flex items-center gap-3">
                          <p className="text-sm text-gray-600">
                            {bulkStatusCount} actions with null status for &ldquo;{selectedBulkOrg}&rdquo;
                          </p>
                          <button
                            onClick={applyBulkStatus}
                            disabled={!selectedBulkStatus || bulkStatusLoading}
                            className="px-4 py-2 bg-[#8ccacf] text-white text-sm font-medium rounded-md hover:bg-[#7ab8bd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {bulkStatusLoading ? 'Applying...' : `Apply to ${bulkStatusCount} actions`}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ---- Panel: Bulk Org Type ---- */}
              {activePanel === 'bulk-org-type' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#313131]">Bulk Set Organization Type</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
                  </div>
                  {bulkOrgTypeLoading && !nullTypeOrgs.length ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : nullTypeOrgs.length === 0 ? (
                    <p className="text-sm text-green-600 font-medium">All organizations have a type set.</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-end gap-3 mb-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Type</label>
                          <select
                            value={selectedOrgType}
                            onChange={e => setSelectedOrgType(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-[#8ccacf] focus:border-[#8ccacf]"
                          >
                            <option value="">Select type...</option>
                            {orgTypes.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={applyBulkOrgType}
                          disabled={!selectedOrgType || nullTypeOrgs.filter(o => o.selected).length === 0 || bulkOrgTypeLoading}
                          className="px-4 py-2 bg-[#8ccacf] text-white text-sm font-medium rounded-md hover:bg-[#7ab8bd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {bulkOrgTypeLoading ? 'Applying...' : `Apply to ${nullTypeOrgs.filter(o => o.selected).length} selected`}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => setNullTypeOrgs(prev => prev.map(o => ({ ...o, selected: true })))}
                          className="text-xs text-[#8ccacf] hover:underline"
                        >Select all</button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => setNullTypeOrgs(prev => prev.map(o => ({ ...o, selected: false })))}
                          className="text-xs text-[#8ccacf] hover:underline"
                        >Select none</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                        {nullTypeOrgs.map(o => (
                          <label key={o.org_id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={o.selected}
                              onChange={() => setNullTypeOrgs(prev =>
                                prev.map(item => item.org_id === o.org_id ? { ...item, selected: !item.selected } : item)
                              )}
                              className="accent-[#8ccacf]"
                            />
                            <span className="text-sm text-[#313131]">{o.org_name}</span>
                            <span className="text-xs text-gray-400">{o.org_id}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ---- Panel: Placeholder Orgs ---- */}
              {activePanel === 'placeholder-orgs' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#313131]">Placeholder Organizations (??? prefix)</h3>
                    <button onClick={() => setActivePanel(null)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
                  </div>
                  {placeholderLoading ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : placeholderOrgs.length === 0 ? (
                    <p className="text-sm text-green-600 font-medium">No placeholder organizations found.</p>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        {placeholderOrgs.length} organizations with placeholder names. Review and rename or mark for deletion.
                      </p>
                      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
                        {placeholderOrgs.map(o => (
                          <div key={o.org_id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                            <div>
                              <p className="text-sm text-[#313131] font-medium">{o.org_name}</p>
                              <p className="text-xs text-gray-400">{o.org_id} {o.org_type ? `- ${o.org_type}` : ''}</p>
                            </div>
                            <Link
                              href={`/organizations/${o.org_id}`}
                              className="text-xs text-[#8ccacf] hover:underline"
                            >
                              View
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============== Section 4: Data Completeness Table ============== */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('completeness')}
            className="flex items-center gap-2 w-full text-left mb-4"
          >
            <span className={`transition-transform ${expandedSections.completeness ? 'rotate-90' : ''}`}>&#9654;</span>
            <h2 className="text-lg font-semibold text-[#313131]">Data Completeness</h2>
          </button>

          {expandedSections.completeness && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-[#313131]">Table</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#313131]">Rows</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#313131]">Required Fields</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#313131]">Optional Fields</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#313131]">Overall</th>
                      <th className="text-center px-4 py-3 font-semibold text-[#313131]">Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tableHealth.map(t => {
                      const reqPct = pct(t.requiredFilled, t.requiredTotal)
                      const optPct = pct(t.optionalFilled, t.optionalTotal)
                      const overallPct = pct(t.requiredFilled + t.optionalFilled, t.requiredTotal + t.optionalTotal)
                      return (
                        <tr key={t.table} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-[#313131]">{t.label}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{t.rows.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={reqPct === 100 ? 'text-green-600' : 'text-yellow-600'}>{reqPct}%</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={optPct >= 80 ? 'text-green-600' : optPct >= 40 ? 'text-yellow-600' : 'text-red-600'}>{optPct}%</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${overallPct}%`,
                                    backgroundColor: overallPct >= 80 ? '#22c55e' : overallPct >= 50 ? '#f3d597' : '#e75425',
                                  }}
                                />
                              </div>
                              <span className="text-gray-600 w-8 text-right">{overallPct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">{healthBadge(overallPct)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ============== Section 5: Junction Table Integrity ============== */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection('junctions')}
            className="flex items-center gap-2 w-full text-left mb-4"
          >
            <span className={`transition-transform ${expandedSections.junctions ? 'rotate-90' : ''}`}>&#9654;</span>
            <h2 className="text-lg font-semibold text-[#313131]">Junction Table Integrity</h2>
          </button>

          {expandedSections.junctions && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-semibold text-[#313131]">Junction</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#313131]">Total Records</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#313131]">Broken &ldquo;from&rdquo; refs</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#313131]">Broken &ldquo;to&rdquo; refs</th>
                      <th className="text-center px-4 py-3 font-semibold text-[#313131]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {junctionChecks.map(j => {
                      const allValid = j.brokenFrom === 0 && j.brokenTo === 0
                      return (
                        <tr key={j.junction} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-[#313131]">{j.label}</span>
                            <span className="text-xs text-gray-400 ml-2">({j.junction})</span>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">{j.total.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={j.brokenFrom > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {j.brokenFrom}
                            </span>
                            {j.brokenFrom > 0 && <span className="text-xs text-gray-400 ml-1">({j.fromTable})</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={j.brokenTo > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {j.brokenTo}
                            </span>
                            {j.brokenTo > 0 && <span className="text-xs text-gray-400 ml-1">({j.toTable})</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {allValid ? (
                              <span className="text-green-600 font-medium">All valid</span>
                            ) : (
                              <span className="text-red-600 font-medium">{j.brokenFrom + j.brokenTo} broken</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
