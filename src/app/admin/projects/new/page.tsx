'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { createProject, linkProjectToAction, linkProjectToOrg } from '@/lib/mutations'
import type { Action, Org } from '@/types/supabase'

const PROJECT_STATUSES = ['Not Started', 'Planning', 'In Progress', 'Complete', 'On Hold']

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [prjName, setPrjName] = useState('')
  const [prjStatus, setPrjStatus] = useState('')
  const [prjBudget, setPrjBudget] = useState('')
  const [prjStartDate, setPrjStartDate] = useState('')
  const [prjEndDate, setPrjEndDate] = useState('')
  const [prjFundingSource, setPrjFundingSource] = useState('')
  const [prjDescription, setPrjDescription] = useState('')
  const [prjNotes, setPrjNotes] = useState('')

  // Linking
  const [selectedAction, setSelectedAction] = useState('')
  const [selectedOrg, setSelectedOrg] = useState('')
  const [actions, setActions] = useState<Action[]>([])
  const [orgs, setOrgs] = useState<Org[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch Petaluma actions (org_name contains Petaluma) and all orgs
      const [actRes, orgRes] = await Promise.all([
        supabase
          .from('actions')
          .select('*')
          .ilike('org_name', '%Petaluma%')
          .order('act_id'),
        supabase.from('orgs').select('*').order('org_name'),
      ])

      setActions(actRes.data ?? [])
      setOrgs(orgRes.data ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const project = await createProject({
        prj_name: prjName,
        prj_status: prjStatus || null,
        prj_budget: prjBudget ? parseFloat(prjBudget) : null,
        prj_start_date: prjStartDate || null,
        prj_end_date: prjEndDate || null,
        prj_funding_source: prjFundingSource || null,
        prj_description: prjDescription || null,
        prj_notes: prjNotes || null,
      })

      // Link to action if selected
      if (selectedAction) {
        await linkProjectToAction(project.prj_id, selectedAction)
      }

      // Link to org if selected
      if (selectedOrg) {
        await linkProjectToOrg(project.prj_id, selectedOrg)
      }

      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create project.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setPrjName('')
    setPrjStatus('')
    setPrjBudget('')
    setPrjStartDate('')
    setPrjEndDate('')
    setPrjFundingSource('')
    setPrjDescription('')
    setPrjNotes('')
    setSelectedAction('')
    setSelectedOrg('')
    setSuccess(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[#8ccacf] text-lg font-medium">Loading...</div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        <div className="bg-[#8ccacf] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-white">Project Created</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-12 h-12 rounded-full bg-[#8ccacf]/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#8ccacf]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#313131] mb-2">Success!</h2>
            <p className="text-gray-500 text-sm mb-6">Your project has been created successfully.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-[#8ccacf] text-white rounded-md hover:bg-[#7ab9be] transition-colors text-sm font-medium"
              >
                Create Another
              </button>
              <Link
                href="/admin"
                className="px-4 py-2 border border-gray-300 text-[#313131] rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Teal hero header */}
      <div className="bg-[#8ccacf] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">Create New Project</h1>
          <p className="mt-2 text-white/80 text-sm">
            Add a project and link it to climate actions and organizations
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 w-full">
        <Link
          href="/admin"
          className="text-sm text-[#8ccacf] hover:underline mb-6 inline-block"
        >
          &larr; Back to Admin
        </Link>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-[#e75425]/10 border border-[#e75425]/30 text-[#e75425] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="prjName" className="block text-sm font-medium text-[#313131] mb-1">
              Project Name <span className="text-[#e75425]">*</span>
            </label>
            <input
              id="prjName"
              type="text"
              required
              value={prjName}
              onChange={(e) => setPrjName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="e.g., Downtown EV Charging Station Installation"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="prjStatus" className="block text-sm font-medium text-[#313131] mb-1">
              Status
            </label>
            <select
              id="prjStatus"
              value={prjStatus}
              onChange={(e) => setPrjStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
            >
              <option value="">Select status...</option>
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="prjBudget" className="block text-sm font-medium text-[#313131] mb-1">
              Budget ($)
            </label>
            <input
              id="prjBudget"
              type="number"
              min="0"
              step="0.01"
              value={prjBudget}
              onChange={(e) => setPrjBudget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="0.00"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prjStartDate" className="block text-sm font-medium text-[#313131] mb-1">
                Start Date
              </label>
              <input
                id="prjStartDate"
                type="date"
                value={prjStartDate}
                onChange={(e) => setPrjStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label htmlFor="prjEndDate" className="block text-sm font-medium text-[#313131] mb-1">
                End Date
              </label>
              <input
                id="prjEndDate"
                type="date"
                value={prjEndDate}
                onChange={(e) => setPrjEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Funding Source */}
          <div>
            <label htmlFor="prjFundingSource" className="block text-sm font-medium text-[#313131] mb-1">
              Funding Source
            </label>
            <input
              id="prjFundingSource"
              type="text"
              value={prjFundingSource}
              onChange={(e) => setPrjFundingSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="e.g., BAAQMD Grant, General Fund"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="prjDescription" className="block text-sm font-medium text-[#313131] mb-1">
              Description
            </label>
            <textarea
              id="prjDescription"
              rows={3}
              value={prjDescription}
              onChange={(e) => setPrjDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="Describe the project scope and goals..."
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="prjNotes" className="block text-sm font-medium text-[#313131] mb-1">
              Notes
            </label>
            <textarea
              id="prjNotes"
              rows={2}
              value={prjNotes}
              onChange={(e) => setPrjNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="Internal notes..."
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-[#313131] uppercase tracking-wide mb-4">
              Link to Existing Records
            </h3>

            {/* Link to Action */}
            <div className="mb-4">
              <label htmlFor="linkAction" className="block text-sm font-medium text-[#313131] mb-1">
                Link to Action
              </label>
              <select
                id="linkAction"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
              >
                <option value="">None</option>
                {actions.map((a) => (
                  <option key={a.act_id} value={a.act_id}>
                    {a.act_id} &mdash; {a.act_level1 ?? a.act_level2 ?? 'Untitled'}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">Petaluma climate actions only</p>
            </div>

            {/* Link to Organization */}
            <div>
              <label htmlFor="linkOrg" className="block text-sm font-medium text-[#313131] mb-1">
                Link to Organization
              </label>
              <select
                id="linkOrg"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
              >
                <option value="">None</option>
                {orgs.map((o) => (
                  <option key={o.org_id} value={o.org_id}>
                    {o.org_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-[#8ccacf] text-white font-medium rounded-md hover:bg-[#7ab9be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
