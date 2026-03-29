'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { createDoc, linkDocToOrg } from '@/lib/mutations'
import type { Org } from '@/types/supabase'

const DOC_EVALUATED_OPTIONS = ['Y', 'N', '?']

export default function NewDocPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdId, setCreatedId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [docName, setDocName] = useState('')
  const [docDate, setDocDate] = useState('')
  const [docType, setDocType] = useState('')
  const [docUrl, setDocUrl] = useState('')
  const [docEvaluated, setDocEvaluated] = useState('')
  const [docDescription, setDocDescription] = useState('')
  const [docNotes, setDocNotes] = useState('')

  // Linking
  const [selectedOrg, setSelectedOrg] = useState('')
  const [orgs, setOrgs] = useState<Org[]>([])
  const [docTypes, setDocTypes] = useState<string[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch orgs and doc types in parallel
      const [orgRes, dtRes] = await Promise.all([
        supabase.from('orgs').select('*').order('org_name'),
        supabase.from('doc_types').select('name').order('name'),
      ])

      setOrgs(orgRes.data ?? [])
      setDocTypes(dtRes.data?.map((r) => r.name) ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const doc = await createDoc({
        doc_name: docName,
        org_parent: selectedOrg || null,
        doc_date: docDate || null,
        doc_type: docType || null,
        doc_url: docUrl || null,
        doc_evaluated: docEvaluated || null,
        doc_description: docDescription || null,
        doc_notes: docNotes || null,
      })

      // Link to org if selected
      if (selectedOrg) {
        await linkDocToOrg(doc.doc_id, selectedOrg)
      }

      setCreatedId(doc.doc_id)
      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create document.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setDocName('')
    setDocDate('')
    setDocType('')
    setDocUrl('')
    setDocEvaluated('')
    setDocDescription('')
    setDocNotes('')
    setSelectedOrg('')
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
            <h1 className="text-3xl font-bold text-white">Document Created</h1>
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
            <p className="text-gray-500 text-sm mb-1">Your document has been created successfully.</p>
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
          <h1 className="text-3xl font-bold text-white">Add New Document</h1>
          <p className="mt-2 text-white/80 text-sm">
            Register a climate action document and link it to an organization
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
          {/* Document Name */}
          <div>
            <label htmlFor="docName" className="block text-sm font-medium text-[#313131] mb-1">
              Document Name <span className="text-[#e75425]">*</span>
            </label>
            <input
              id="docName"
              type="text"
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="e.g., Blueprint for Climate Action"
            />
          </div>

          {/* Document Date */}
          <div>
            <label htmlFor="docDate" className="block text-sm font-medium text-[#313131] mb-1">
              Document Date
            </label>
            <input
              id="docDate"
              type="date"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
            />
          </div>

          {/* Document Type */}
          <div>
            <label htmlFor="docType" className="block text-sm font-medium text-[#313131] mb-1">
              Document Type
            </label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
            >
              <option value="">Select type...</option>
              {docTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* URL */}
          <div>
            <label htmlFor="docUrl" className="block text-sm font-medium text-[#313131] mb-1">
              Document URL
            </label>
            <input
              id="docUrl"
              type="url"
              value={docUrl}
              onChange={(e) => setDocUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="https://example.org/document.pdf"
            />
          </div>

          {/* Evaluated */}
          <div>
            <label htmlFor="docEvaluated" className="block text-sm font-medium text-[#313131] mb-1">
              Evaluated
            </label>
            <select
              id="docEvaluated"
              value={docEvaluated}
              onChange={(e) => setDocEvaluated(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
            >
              <option value="">Select...</option>
              {DOC_EVALUATED_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="docDescription" className="block text-sm font-medium text-[#313131] mb-1">
              Description
            </label>
            <textarea
              id="docDescription"
              rows={3}
              value={docDescription}
              onChange={(e) => setDocDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm"
              placeholder="Brief description of the document..."
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="docNotes" className="block text-sm font-medium text-[#313131] mb-1">
              Notes
            </label>
            <textarea
              id="docNotes"
              rows={2}
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
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
              {submitting ? 'Creating Document...' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
