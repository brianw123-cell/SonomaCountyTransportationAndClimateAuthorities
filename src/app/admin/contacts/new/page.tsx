'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { createIndividual, linkIndToOrg } from '@/lib/mutations'
import type { Org } from '@/types/supabase'

export default function NewContactPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [orgs, setOrgs] = useState<Org[]>([])

  // Form state
  const [indName, setIndName] = useState('')
  const [indEmail, setIndEmail] = useState('')
  const [indTitle, setIndTitle] = useState('')
  const [indPhone, setIndPhone] = useState('')
  const [indNotes, setIndNotes] = useState('')
  const [selectedOrg, setSelectedOrg] = useState('')
  const [orgRole, setOrgRole] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('orgs').select('*').order('org_name')
      setOrgs(data ?? [])
      setLoading(false)
    }
    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const ind = await createIndividual({
        ind_name: indName.trim(),
        ind_email: indEmail.trim() || null,
        ind_title: indTitle.trim() || null,
        ind_phone: indPhone.trim() || null,
        ind_notes: indNotes.trim() || null,
      })

      if (selectedOrg && ind.ind_id) {
        await linkIndToOrg(ind.ind_id, selectedOrg, orgRole.trim() || undefined)
      }

      setSuccess(true)
      // Reset form
      setIndName('')
      setIndEmail('')
      setIndTitle('')
      setIndPhone('')
      setIndNotes('')
      setSelectedOrg('')
      setOrgRole('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create contact')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[#8ccacf] text-lg font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Teal hero */}
      <div className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Add Contact</h1>
          <p className="mt-1 text-white/80 text-sm">Register a new individual in the climate action tracker</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-700">Contact created successfully!</p>
            <div className="mt-2 flex gap-3">
              <Link href="/contacts" className="text-sm text-[#8ccacf] hover:underline font-medium">
                View Contacts
              </Link>
              <button
                onClick={() => setSuccess(false)}
                className="text-sm text-[#8ccacf] hover:underline font-medium"
              >
                Add Another
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#313131] mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={indName}
              onChange={(e) => setIndName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
              placeholder="Full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#313131] mb-1">Email</label>
            <input
              type="email"
              value={indEmail}
              onChange={(e) => setIndEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#313131] mb-1">Title</label>
            <input
              type="text"
              value={indTitle}
              onChange={(e) => setIndTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
              placeholder="e.g., Climate Program Manager"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-[#313131] mb-1">Phone</label>
            <input
              type="tel"
              value={indPhone}
              onChange={(e) => setIndPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
              placeholder="(707) 555-0123"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[#313131] mb-1">Notes</label>
            <textarea
              value={indNotes}
              onChange={(e) => setIndNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-sm font-semibold text-[#313131] mb-3">Organization Link (optional)</h3>
          </div>

          {/* Organization */}
          <div>
            <label className="block text-sm font-medium text-[#313131] mb-1">Organization</label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
            >
              <option value="">No organization</option>
              {orgs.map((org) => (
                <option key={org.org_id} value={org.org_id}>
                  {org.org_name}{org.org_acronym ? ` (${org.org_acronym})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          {selectedOrg && (
            <div>
              <label className="block text-sm font-medium text-[#313131] mb-1">Role at Organization</label>
              <input
                type="text"
                value={orgRole}
                onChange={(e) => setOrgRole(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
                placeholder="e.g., Climate Coordinator"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !indName.trim()}
            className="w-full py-2.5 bg-[#8ccacf] text-white rounded-md font-medium text-sm hover:bg-[#7ab8bd] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : 'Create Contact'}
          </button>
        </form>
      </div>
    </div>
  )
}
