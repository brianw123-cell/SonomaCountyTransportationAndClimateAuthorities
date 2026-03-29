import { supabase } from './supabase'

export type UserRole = 'sctca_staff' | 'jurisdiction_staff' | 'viewer'

export interface UserProfile {
  userId: string
  email: string
  role: UserRole
  orgId: string | null
  orgName: string | null
}

/** Get the current user's profile with role info */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: roles } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .limit(1)

  const role = roles?.[0]

  return {
    userId: user.id,
    email: user.email ?? '',
    role: (role?.role as UserRole) ?? 'viewer',
    orgId: role?.org_id ?? null,
    orgName: role?.org_name ?? null,
  }
}

/** Check if user is SCTCA staff (full access) */
export function isSCTCAStaff(profile: UserProfile | null): boolean {
  return profile?.role === 'sctca_staff'
}

/** Check if user can edit a specific org's data */
export function canEditOrg(profile: UserProfile | null, orgId: string): boolean {
  if (!profile) return false
  if (profile.role === 'sctca_staff') return true
  if (profile.role === 'jurisdiction_staff' && profile.orgId === orgId) return true
  return false
}
