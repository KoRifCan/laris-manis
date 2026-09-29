import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getUserRole, UserRole } from '@/lib/rbac';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    uid: string;
    email: string;
    role: UserRole;
    assignedStoreIds?: string[];
  };
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ user: { uid: string; email: string; role: UserRole; assignedStoreIds?: string[] } } | NextResponse> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Token tidak ditemukan' },
      { status: 401 }
    );
  }

  const token = authHeader.split('Bearer ')[1];
  const { success, decoded, error } = await verifyIdToken(token);

  if (!success || !decoded) {
    return NextResponse.json(
      { success: false, error: error || 'Token tidak valid' },
      { status: 401 }
    );
  }

  const role = await getUserRole(decoded.uid);
  const userDoc = await adminDb.collection('users').doc(decoded.uid).get();
  const userData = userDoc.data();
  
  return {
    user: {
      uid: decoded.uid,
      email: decoded.email || '',
      role: role || 'pembeli',
      assignedStoreIds: userData?.assignedStoreIds,
    },
  };
}

export async function verifyIdToken(token: string) {
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { success: true, decoded };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return async function (
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ) {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Akses ditolak' },
        { status: 403 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest);
  };
}

export function requirePermission(permission: string) {
  return async function (
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ) {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { hasPermission } = await import('@/lib/rbac');
    
    if (!hasPermission(user.role, permission)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Izin tidak mencukupi' },
        { status: 403 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest);
  };
}

export function requireOwnership(
  getResourceOwnerId: (request: NextRequest) => Promise<string>
) {
  return async function (
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ) {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    
    if (user.role === 'super_admin' || user.role === 'admin') {
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;
      return handler(authenticatedRequest);
    }

    const resourceOwnerId = await getResourceOwnerId(request);
    
    if (resourceOwnerId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Anda tidak memiliki akses ke resource ini' },
        { status: 403 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest);
  };
}

export function requireStoreOwnership(
  getStoreId: (request: NextRequest) => Promise<string>
) {
  return async function (
    request: NextRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ) {
    const authResult = await authenticateRequest(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    
    if (user.role === 'super_admin' || user.role === 'admin') {
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;
      return handler(authenticatedRequest);
    }

    const storeId = await getStoreId(request);
    const { adminDb } = await import('@/lib/firebase-admin');
    
    const storeDoc = await adminDb.collection('stores').doc(storeId).get();
    
    if (!storeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Toko tidak ditemukan' },
        { status: 404 }
      );
    }

    const store = storeDoc.data()!;
    const isOwner = store.ownerId === user.uid;
    const isStaff = user.role === 'staf_toko' && user.assignedStoreIds?.includes(storeId);
    
    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Anda bukan pemilik atau staf toko ini' },
        { status: 403 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest);
  };
}