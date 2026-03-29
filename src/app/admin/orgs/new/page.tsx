'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { createOrg } from '@/lib/mutations'

const ORG_TYPES = [
  'Local Municipality',
  'County Government',
  'Special District',
  'Non-Governmental Organization',
  'Regional Government',
  'Private Consultant',
]

export default function NewOrgPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdId, setCreatedId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [orgName, setOrgName] = useState('')
  const [orgAcronym, setOrgAcronym] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [orgType, setOrgType] = useState('')
  const [orgDescription, setOrgDescription] = useState('')
  const [orgNotes, setOrgNotes] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const org = await createOrg({
        org_name: orgName,
        org_acronym: orgAcronym || null,
        org_url: orgUrl || null,
        org_type: orgType || null,
        org_description: orgDescription || null,
        org_notes: orgNotes || null,
      })

      setCreatedId(org.org_id)
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create organization.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setOrgName('')
    setOrgAcronym('')
    setOrgUrl('')
    setOrgType('')
    setOrgDescription('')
    setOrgNotes('')
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
            <h1 className="text-3xl font-bold text-white">Organization Created</h1>
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
            <p className="text-gray-500 text-sm mb-1">Your organization has been created successfully.</p>
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
          <h1 className="text-3xl font-bold text-white">Add New Organization</h1>
          <p className="mt-2 text-white/80 text-sm">
            Register an organization in the climate action tracker
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
          {/* Organization Name */}
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-[#313131] mb-1">
              Organization Name <span className="text-[#e75425]">*</span>
            </label>
            <input
              id="orgName"
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="e.g., City of Petaluma"
            />
          </div>

          {/* Acronym */}
          <div>
            <label htmlFor="orgAcronym" className="block text-sm font-medium text-[#313131] mb-1">
              Acronym
            </label>
            <input
              id="orgAcronym"
              type="text"
              value={orgAcronym}
              onChange={(e) => setOrgAcronym(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="e.g., SCTCA"
            />
          </div>

          {/* URL */}
          <div>
            <label htmlFor="orgUrl" className="block text-sm font-medium text-[#313131] mb-1">
              Website URL
            </label>
            <input
              id="orgUrl"
              type="url"
              value={orgUrl}
              onChange={(e) => setOrgUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="https://example.org"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="orgType" className="block text-sm font-medium text-[#313131] mb-1">
              Organization Type
            </label>
            <select
              id="orgType"
              value={orgType}
              onChange={(e) => setOrgType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
            >
              <option value="">Select type...</option>
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="orgDescription" className="block text-sm font-medium text-[#313131] mb-1">
              Description
            </label>
            <textarea
              id="orgDescription"
              rows={3}
              value={orgDescription}
              onChange={(e) => setOrgDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="Brief description of the organization..."
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="orgNotes" className="block text-sm font-medium text-[#313131] mb-1">
              Notes
            </label>
            <textarea
              id="orgNotes"
              rows={2}
              value={orgNotes}
              onChange={(e) => setOrgNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="Internal notes..."
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-[#8ccacf] text-white font-medium rounded-md hover:bg-[#7ab9be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? 'Creating Organization...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
