'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ actions: 0, projects: 0, orgs: 0 })

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Fetch quick stats
      const [actRes, prjRes, orgRes] = await Promise.all([
        supabase.from('actions').select('act_id', { count: 'exact', head: true }),
        supabase.from('projects').select('prj_id', { count: 'exact', head: true }),
        supabase.from('orgs').select('org_id', { count: 'exact', head: true }),
      ])

      setStats({
        actions: actRes.count ?? 0,
        projects: prjRes.count ?? 0,
        orgs: orgRes.count ?? 0,
      })

      setLoading(false)
    }
    checkAuth()
  }, [router])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[#8ccacf] text-lg font-medium">Loading...</div>
      </div>
    )
  }

  const quickLinks = [
    {
      href: '/admin/actions',
      title: 'Update Action Status',
      description: 'Search and update the status, timeline, and priority of climate actions.',
    },
    {
      href: '/admin/projects/new',
      title: 'Create Project',
      description: 'Add a new project and link it to actions and organizations.',
    },
    {
      href: '/organizations',
      title: 'Manage Organizations',
      description: 'View the organizational directory and hierarchy.',
    },
  ]

  return (
    <div className="min-h-[60vh] flex flex-col">
      {/* Teal hero header */}
      <div className="bg-[#8ccacf] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Staff Dashboard</h1>
            <p className="mt-2 text-white/80 text-sm">
              Welcome, {user?.email}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors text-sm font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Actions</p>
            <p className="mt-1 text-3xl font-bold text-[#313131]">{stats.actions}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Projects</p>
            <p className="mt-1 text-3xl font-bold text-[#313131]">{stats.projects}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Organizations</p>
            <p className="mt-1 text-3xl font-bold text-[#313131]">{stats.orgs}</p>
          </div>
        </div>

        {/* Quick Links */}
        <h2 className="text-lg font-semibold text-[#313131] mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-[#8ccacf] hover:shadow-md transition-all group"
            >
              <h3 className="font-semibold text-[#313131] group-hover:text-[#8ccacf] transition-colors">
                {link.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{link.description}</p>
            </Link>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <h2 className="text-lg font-semibold text-[#313131] mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-400 italic">
            Activity tracking coming soon. This section will show recent updates to actions and projects.
          </p>
        </div>
      </div>
    </div>
  )
}
