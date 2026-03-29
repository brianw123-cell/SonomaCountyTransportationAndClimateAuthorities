'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getOrgs } from '@/lib/queries'
import { setUserRole, getUserRole } from '@/lib/mutations'
import { getCurrentUserProfile, type UserRole, type UserProfile } from '@/lib/auth-helpers'
import type { Org } from '@/types/supabase'

interface RoleRecord {
  user_id: string
  role: string
  org_id: string | null
  org_name: string | null
}

export default function RolesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [orgs, setOrgs] = useState<Org[]>([])

  // Form state
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer')
  const [selectedOrgId, setSelectedOrgId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Existing role assignments
  const [existingRoles, setExistingRoles] = useState<RoleRecord[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const [userProfile, orgList] = await Promise.all([
        getCurrentUserProfile(),
        getOrgs(),
      ])

      setProfile(userProfile)
      setOrgs(orgList)

      if (userProfile) {
        setSelectedRole(userProfile.role)
        setSelectedOrgId(userProfile.orgId ?? '')
      }

      // Load existing role assignments
      try {
        const { data } = await supabase.from('user_roles').select('*')
        setExistingRoles((data ?? []) as RoleRecord[])
      } catch {
        // Non-critical
      }

      setLoading(false)
    }
    init()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    setError(null)
    setSuccessMsg(null)
    setSaving(true)

    try {
      const org = selectedRole === 'jurisdiction_staff'
        ? orgs.find(o => o.org_id === selectedOrgId)
        : null

      await setUserRole(
        profile.userId,
        selectedRole,
        org?.org_id ?? undefined,
        org?.org_name ?? undefined,
      )

      // Refresh profile
      const updated = await getCurrentUserProfile()
      setProfile(updated)

      // Refresh existing roles list
      const { data } = await supabase.from('user_roles').select('*')
      setExistingRoles((data ?? []) as RoleRecord[])

      setSuccessMsg('Role updated successfully.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update role.'
      setError(message)
    } finally {
      setSaving(false)
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
      {/* Teal hero header */}
      <div className="bg-[#8ccacf] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">User Role Management</h1>
          <p className="mt-2 text-white/80 text-sm">
            Set your role for testing. In production, roles would be assigned by SCTCA administrators.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 w-full">
        <Link
          href="/admin"
          className="text-sm text-[#8ccacf] hover:underline mb-6 inline-block"
        >
          &larr; Back to Admin
        </Link>

        {/* Current role info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#313131] mb-3">Your Current Role</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 text-[#313131] font-medium">{profile?.email}</span>
            </div>
            <div>
              <span className="text-gray-500">Role:</span>
              <span className={`ml-2 font-medium px-2 py-0.5 rounded text-xs ${
                profile?.role === 'sctca_staff'
                  ? 'bg-[#8ccacf]/20 text-[#313131]'
                  : profile?.role === 'jurisdiction_staff'
                  ? 'bg-[#f3d597]/30 text-[#313131]'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {profile?.role === 'sctca_staff' ? 'SCTCA Staff'
                  : profile?.role === 'jurisdiction_staff' ? 'Jurisdiction Staff'
                  : 'Viewer'}
              </span>
            </div>
            {profile?.orgName && (
              <div className="col-span-2">
                <span className="text-gray-500">Assigned Organization:</span>
                <span className="ml-2 text-[#313131] font-medium">{profile.orgName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Set role form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#313131] mb-4">Set My Role</h2>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-[#e75425]/10 border border-[#e75425]/30 text-[#e75425] text-sm">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-md bg-[#8ccacf]/10 border border-[#8ccacf]/30 text-[#313131] text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[#313131] mb-1">
                Role
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
              >
                <option value="viewer">Viewer (read-only)</option>
                <option value="jurisdiction_staff">Jurisdiction Staff (edit own org)</option>
                <option value="sctca_staff">SCTCA Staff (full access)</option>
              </select>
              <p className="mt-1 text-xs text-gray-400">
                {selectedRole === 'sctca_staff' && 'Full access to all organizations and admin features.'}
                {selectedRole === 'jurisdiction_staff' && 'Can update action statuses for your assigned organization.'}
                {selectedRole === 'viewer' && 'Read-only access. Cannot edit any data.'}
              </p>
            </div>

            {selectedRole === 'jurisdiction_staff' && (
              <div>
                <label htmlFor="org" className="block text-sm font-medium text-[#313131] mb-1">
                  Assigned Organization
                </label>
                <select
                  id="org"
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8ccacf] focus:border-transparent text-sm bg-white"
                >
                  <option value="">Select an organization...</option>
                  {orgs.map((org) => (
                    <option key={org.org_id} value={org.org_id}>
                      {org.org_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || (selectedRole === 'jurisdiction_staff' && !selectedOrgId)}
              className="w-full py-2.5 px-4 bg-[#8ccacf] text-white font-medium rounded-md hover:bg-[#7ab9be] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {saving ? 'Saving...' : 'Update My Role'}
            </button>
          </form>
        </div>

        {/* Existing role assignments */}
        {existingRoles.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-[#313131] mb-4">Current Role Assignments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">User ID</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Role</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Organization</th>
                  </tr>
                </thead>
                <tbody>
                  {existingRoles.map((r) => (
                    <tr key={r.user_id} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-mono text-xs text-gray-400 truncate max-w-[200px]">
                        {r.user_id === profile?.userId ? (
                          <span className="text-[#8ccacf] font-medium">You</span>
                        ) : (
                          r.user_id.slice(0, 8) + '...'
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          r.role === 'sctca_staff'
                            ? 'bg-[#8ccacf]/20 text-[#313131]'
                            : r.role === 'jurisdiction_staff'
                            ? 'bg-[#f3d597]/30 text-[#313131]'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {r.role === 'sctca_staff' ? 'SCTCA Staff'
                            : r.role === 'jurisdiction_staff' ? 'Jurisdiction Staff'
                            : 'Viewer'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#313131]">{r.org_name ?? '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
