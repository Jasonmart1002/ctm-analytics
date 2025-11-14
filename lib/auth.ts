import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export type UserRole = 'admin' | 'ceo' | 'cmo' | 'manager' | 'viewer'

export interface Permission {
  viewDashboard: boolean
  viewMarketing: boolean
  viewAgents: boolean
  uploadData: boolean
  manageUsers: boolean
  exportData: boolean
  accessAI: boolean
}

export const ROLES: Record<UserRole, Permission> = {
  admin: {
    viewDashboard: true,
    viewMarketing: true,
    viewAgents: true,
    uploadData: true,
    manageUsers: true,
    exportData: true,
    accessAI: true,
  },
  ceo: {
    viewDashboard: true,
    viewMarketing: true,
    viewAgents: true,
    uploadData: false,
    manageUsers: false,
    exportData: true,
    accessAI: true,
  },
  cmo: {
    viewDashboard: true,
    viewMarketing: true,
    viewAgents: false,
    uploadData: false,
    manageUsers: false,
    exportData: true,
    accessAI: true,
  },
  manager: {
    viewDashboard: true,
    viewMarketing: false,
    viewAgents: true,
    uploadData: false,
    manageUsers: false,
    exportData: false,
    accessAI: false,
  },
  viewer: {
    viewDashboard: true,
    viewMarketing: false,
    viewAgents: false,
    uploadData: false,
    manageUsers: false,
    exportData: false,
    accessAI: false,
  },
}

export async function getUserRole(): Promise<UserRole> {
  const user = await currentUser()
  const role = (user?.publicMetadata?.role as UserRole) || 'viewer'
  return role
}

export async function getUserPermissions(): Promise<Permission> {
  const role = await getUserRole()
  return ROLES[role]
}

export async function checkPermission(
  permission: keyof Permission
): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false

  const permissions = await getUserPermissions()
  return permissions[permission] || false
}

export async function requirePermission(permission: keyof Permission) {
  const hasPermission = await checkPermission(permission)
  if (!hasPermission) {
    redirect('/unauthorized')
  }
}

export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  return userId
}

export async function getOrgId(): Promise<string | null> {
  const { orgId } = await auth()
  return orgId || null
}

export async function requireOrgId(): Promise<string> {
  const orgId = await getOrgId()
  if (!orgId) {
    // If organizations aren't enabled in Clerk, use a default org ID
    // based on the user ID to maintain single-tenant functionality
    const userId = await requireAuth()
    return `user-${userId}`
  }
  return orgId
}

export async function requireUser() {
  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')
  }

  const role = (user.publicMetadata?.role as UserRole) || 'viewer'

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role,
  }
}
