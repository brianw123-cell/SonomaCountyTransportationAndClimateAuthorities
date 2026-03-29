'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface IndividualWithOrgs {
  ind_id: string
  ind_name: string
  ind_email: string | null
  ind_title: string | null
  ind_phone: string | null
  ind_notes: string | null
  orgs: { org_id: string; org_name: string; ind_role: string | null }[]
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<IndividualWithOrgs[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [orgFilter, setOrgFilter] = useState('')

  useEffect(() => {
    async function load() {
      try {
        // Fetch individuals
        const { data: individuals, error: indError } = await supabase
          .from('individuals')
          .select('*')
          .order('ind_name')
        if (indError) throw indError

        // Fetch org_ind junction
        const { data: links, error: linkError } = await supabase
          .from('org_ind')
          .select('*')
        if (linkError) throw linkError

        // Fetch orgs for names
        const { data: orgs, error: orgError } = await supabase
          .from('orgs')
          .select('org_id, org_name')
        if (orgError) throw orgError

        const orgMap = new Map(orgs?.map((o) => [o.org_id, o.org_name]) ?? [])

        const result: IndividualWithOrgs[] = (individuals ?? []).map((ind) => {
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

        setContacts(result)
      } catch (err) {
        console.error('Failed to load contacts:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Collect all unique org names for filter dropdown
  const allOrgNames = Array.from(
    new Set(contacts.flatMap((c) => c.orgs.map((o) => o.org_name)))
  ).sort()

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      c.ind_name.toLowerCase().includes(q) ||
      (c.ind_title ?? '').toLowerCase().includes(q) ||
      c.orgs.some((o) => o.org_name.toLowerCase().includes(q))
    const matchesOrg =
      !orgFilter || c.orgs.some((o) => o.org_name === orgFilter)
    return matchesSearch && matchesOrg
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[#8ccacf] text-lg font-medium">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Hero */}
      <section className="bg-[#8ccacf] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Contact Directory
          </h2>
          <p className="mt-1 text-sm sm:text-base text-white/80 font-medium">
            Climate action contacts across Sonoma County
          </p>
          <div className="mt-2 w-14 h-[2px] bg-[#f3d597] mx-auto rounded-full" />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12 w-full">
        {contacts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8ccacf]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#8ccacf]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#313131]">No contacts yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Contact information will appear here as it is added to the tracker.
            </p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <input
                type="text"
                placeholder="Search by name, title, or organization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent"
              />
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8ccacf]"
              >
                <option value="">All Organizations</option>
                {allOrgNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Showing {filtered.length} of {contacts.length} contacts
            </p>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((contact) => (
                <div
                  key={contact.ind_id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:border-l-4 hover:border-l-[#8ccacf] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#8ccacf]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#8ccacf] text-sm font-bold">
                        {contact.ind_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#313131] leading-tight">
                        {contact.ind_name}
                      </p>
                      {contact.ind_title && (
                        <p className="text-sm text-gray-500 mt-0.5">{contact.ind_title}</p>
                      )}
                    </div>
                  </div>

                  {contact.orgs.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {contact.orgs.map((o) => (
                        <div key={o.org_id} className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#8ccacf]/15 text-[#313131]">
                            {o.org_name}
                          </span>
                          {o.ind_role && (
                            <span className="text-xs text-gray-400">{o.ind_role}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 space-y-1">
                    {contact.ind_email && (
                      <a
                        href={`mailto:${contact.ind_email}`}
                        className="flex items-center gap-1.5 text-sm text-[#8ccacf] hover:text-[#7ab8bd] font-medium"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        {contact.ind_email}
                      </a>
                    )}
                    {contact.ind_phone && (
                      <p className="flex items-center gap-1.5 text-sm text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        {contact.ind_phone}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-8">
                  No contacts match the current filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
