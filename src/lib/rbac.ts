import { adminAuth, adminDb } from './firebase-admin';
import { UserRole, ApiResponse } from './types';

export type { UserRole };

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 5,
  admin: 4,
  penjual: 3,
  staf_toko: 2,
  pembeli: 1,
};

export function canAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isPenjualOrAbove(role: UserRole): boolean {
  return canAccess(role, 'penjual');
}

export function isStafOrAbove(role: UserRole): boolean {
  return canAccess(role, 'staf_toko');
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userRecord = await adminAuth.getUser(uid);
    return (userRecord.customClaims?.role as UserRole) || 'pembeli';
  } catch {
    return null;
  }
}

export async function getUserDoc(uid: string) {
  const doc = await adminDb.collection('users').doc(uid).get();
  if (!doc.exists) return null;
  return { uid, ...doc.data() } as any;
}

export async function setUserRole(uid: string, role: UserRole): Promise<ApiResponse> {
  try {
    await adminAuth.setCustomUserClaims(uid, { role });
    await adminDb.collection('users').doc(uid).update({
      role,
      updatedAt: new Date(),
    });
    return { success: true, message: 'Role berhasil diubah' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function verifyIdToken(token: string) {
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { success: true, decoded };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function createAuditLog(
  actorId: string,
  actorRole: string,
  action: string,
  targetType: 'user' | 'store' | 'product' | 'category' | 'review',
  targetId: string,
  details: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  return adminDb.collection('auditLogs').add({
    actorId,
    actorRole,
    action,
    targetType,
    targetId,
    details,
    ipAddress,
    userAgent,
    createdAt: new Date(),
  });
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    'users:read',
    'users:write',
    'users:delete',
    'users:change_role',
    'stores:read',
    'stores:write',
    'stores:verify',
    'stores:delete',
    'products:read',
    'products:write',
    'products:delete',
    'products:review',
    'categories:read',
    'categories:write',
    'categories:delete',
    'reviews:read',
    'reviews:delete',
    'audit_logs:read',
    'settings:read',
    'settings:write',
  ],
  admin: [
    'users:read',
    'stores:read',
    'stores:verify',
    'products:read',
    'products:review',
    'categories:read',
    'reviews:read',
    'reviews:delete',
  ],
  penjual: [
    'stores:read_own',
    'stores:write_own',
    'products:read_own',
    'products:write_own',
    'products:delete_own',
    'products:submit_review',
    'categories:read',
    'reviews:read_own_store',
  ],
  staf_toko: [
    'stores:read_assigned',
    'products:read_assigned',
    'products:write_assigned',
    'categories:read',
  ],
  pembeli: [
    'stores:read',
    'products:read',
    'categories:read',
    'reviews:write',
    'favorites:read',
    'favorites:write',
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}