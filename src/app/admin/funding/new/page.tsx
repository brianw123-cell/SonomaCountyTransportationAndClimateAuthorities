'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { createFunding, linkFundingToOrg, linkFundingToProject } from '@/lib/mutations'
import type { Org, Project } from '@/types/supabase'

const FUNDING_TYPES = ['Grant', 'Loan', 'Tax Credit', 'Rebate', 'Bond', 'Other']
const FUNDING_STATUSES = ['Open', 'Upcoming', 'Active', 'Applied', 'Awarded', 'Closed']

export default function NewFundingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdId, setCreatedId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [fndName, setFndName] = useState('')
  const [fndAmount, setFndAmount] = useState('')
  const [fndSource, setFndSource] = useState('')
  const [fndType, setFndType] = useState('')
  const [fndStart, setFndStart] = useState('')
  const [fndEnd, setFndEnd] = useState('')
  const [fndStatus, setFndStatus] = useState('')
  const [fndUrl, setFndUrl] = useState('')
  const [fndNotes, setFndNotes] = useState('')

  // Linking
  const [selectedOrg, setSelectedOrg] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [orgs, setOrgs] = useState<Org[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const [orgRes, prjRes] = await Promise.all([
        supabase.from('orgs').select('*').order('org_name'),
        supabase.from('projects').select('*').order('prj_name'),
      ])

      setOrgs(orgRes.data ?? [])
      setProjects(prjRes.data ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const funding = await createFunding({
        fnd_name: fndName,
        fnd_amount: fndAmount ? parseFloat(fndAmount) : null,
        fnd_source: fndSource || null,
        fnd_type: fndType || null,
        fnd_start: fndStart || null,
        fnd_end: fndEnd || null,
        fnd_status: fndStatus || null,
        fnd_url: fndUrl || null,
        fnd_notes: fndNotes || null,
      })

      // Link to org if selected
      if (selectedOrg) {
        await linkFundingToOrg(funding.fnd_id, selectedOrg)
      }

      // Link to project if selected
      if (selectedProject) {
        await linkFundingToProject(funding.fnd_id, selectedProject)
      }

      setCreatedId(funding.fnd_id)
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create funding record.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setFndName('')
    setFndAmount('')
    setFndSource('')
    setFndType('')
    setFndStart('')
    setFndEnd('')
    setFndStatus('')
    setFndUrl('')
    setFndNotes('')
    setSelectedOrg('')
    setSelectedProject('')
    setSuccess(false)
    setCreatedId('')
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
            <h1 className="text-3xl font-bold text-white">Funding Record Created</h1>
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
            <p className="text-gray-500 text-sm mb-1">Your funding record has been created successfully.</p>
            <p className="text-gray-400 text-xs mb-6">ID: {createdId}</p>
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
          <h1 className="text-3xl font-bold text-white">Add Funding Source</h1>
          <p className="mt-2 text-white/80 text-sm">
            Track grants, loans, and other funding for climate projects
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
          {/* Funding Name */}
          <div>
            <label htmlFor="fndName" className="block text-sm font-medium text-[#313131] mb-1">
              Funding Name <span className="text-[#e75425]">*</span>
            </label>
            <input
              id="fndName"
              type="text"
              required
              value={fndName}
              onChange={(e) => setFndName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="e.g., BAAQMD Clean Air Grant 2026"
            />
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="fndAmount" className="block text-sm font-medium text-[#313131] mb-1">
              Amount ($)
            </label>
            <input
              id="fndAmount"
              type="number"
              min="0"
              step="0.01"
              value={fndAmount}
              onChange={(e) => setFndAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="0.00"
            />
          </div>

          {/* Source */}
          <div>
            <label htmlFor="fndSource" className="block text-sm font-medium text-[#313131] mb-1">
              Granting Agency / Source
            </label>
            <input
              id="fndSource"
              type="text"
              value={fndSource}
              onChange={(e) => setFndSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="e.g., Bay Area Air Quality Management District"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="fndType" className="block text-sm font-medium text-[#313131] mb-1">
              Funding Type
            </label>
            <select
              id="fndType"
              value={fndType}
              onChange={(e) => setFndType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
            >
              <option value="">Select type...</option>
              {FUNDING_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fndStart" className="block text-sm font-medium text-[#313131] mb-1">
                Start Date
              </label>
              <input
                id="fndStart"
                type="date"
                value={fndStart}
                onChange={(e) => setFndStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label htmlFor="fndEnd" className="block text-sm font-medium text-[#313131] mb-1">
                End Date
              </label>
              <input
                id="fndEnd"
                type="date"
                value={fndEnd}
                onChange={(e) => setFndEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="fndStatus" className="block text-sm font-medium text-[#313131] mb-1">
              Status
            </label>
            <select
              id="fndStatus"
              value={fndStatus}
              onChange={(e) => setFndStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
            >
              <option value="">Select status...</option>
              {FUNDING_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label htmlFor="fndUrl" className="block text-sm font-medium text-[#313131] mb-1">
              Funding URL
            </label>
            <input
              id="fndUrl"
              type="url"
              value={fndUrl}
              onChange={(e) => setFndUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="https://example.org/funding-opportunity"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="fndNotes" className="block text-sm font-medium text-[#313131] mb-1">
              Notes
            </label>
            <textarea
              id="fndNotes"
              rows={2}
              value={fndNotes}
              onChange={(e) => setFndNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="Internal notes..."
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-[#313131] uppercase tracking-wide mb-4">
              Link to Existing Records
            </h3>

            {/* Link to Organization */}
            <div className="mb-4">
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

            {/* Link to Project */}
            <div>
              <label htmlFor="linkProject" className="block text-sm font-medium text-[#313131] mb-1">
                Link to Project
              </label>
              <select
                id="linkProject"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.prj_id} value={p.prj_id}>
                    {p.prj_name}
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
              {submitting ? 'Creating Funding Record...' : 'Create Funding Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
