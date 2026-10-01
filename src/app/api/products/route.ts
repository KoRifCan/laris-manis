import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { validateSchema, productFiltersSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      q: searchParams.get('q') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      city: searchParams.get('city') || undefined,
      province: searchParams.get('province') || undefined,
      sortBy: searchParams.get('sortBy') || 'terbaru',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    const { success, data, errors } = validateSchema(productFiltersSchema, filters);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Filter tidak valid', details: errors },
        { status: 400 }
      );
    }

    const { q, categoryId, minPrice, maxPrice, city, province, sortBy, page, limit } = data;

    let query = adminDb.collection('products').where('status', '==', 'aktif');

    if (categoryId) {
      query = query.where('categoryId', '==', categoryId);
    }

    if (minPrice !== undefined) {
      query = query.where('price', '>=', minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.where('price', '<=', maxPrice);
    }

    // Apply sorting
    switch (sortBy) {
      case 'termurah':
        query = query.orderBy('price', 'asc');
        break;
      case 'termahal':
        query = query.orderBy('price', 'desc');
        break;
      case 'terlaris':
        query = query.orderBy('viewCount', 'desc');
        break;
      case 'rating':
        // Would need store join, skip for now
        query = query.orderBy('createdAt', 'desc');
        break;
      default:
        query = query.orderBy('createdAt', 'desc');
    }

    // Get total count (approximate for performance)
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // Pagination
    const offset = (page - 1) * limit;
    query = query.limit(limit);
    if (offset > 0) {
      const cursorSnapshot = await adminDb
        .collection('products')
        .where('status', '==', 'aktif')
        .orderBy('createdAt', 'desc')
        .limit(offset)
        .get();
      if (!cursorSnapshot.empty) {
        query = query.startAfter(cursorSnapshot.docs[cursorSnapshot.docs.length - 1]);
      }
    }

    const snapshot = await query.get();
    
    // Fetch store info for each product (denormalized city/province)
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by city/province (denormalized in store)
    let filteredProducts = products;
    if (city || province) {
      const storeIds = [...new Set(products.map(p => p.storeId).filter(Boolean))] as string[];
      const storeMap = new Map();
      // Firestore menolak filter 'in' dgn array kosong
      if (storeIds.length > 0) {
        const storesSnapshot = await adminDb
          .collection('stores')
          .where('__name__', 'in', storeIds)
          .get();
        storesSnapshot.docs.forEach(doc => storeMap.set(doc.id, doc.data()));
      }

      filteredProducts = products.filter(p => {
        const store = storeMap.get(p.storeId);
        if (!store) return false;
        if (city && store.city.toLowerCase() !== city.toLowerCase()) return false;
        if (province && store.province.toLowerCase() !== province.toLowerCase()) return false;
        return true;
      });
    }

    // Text search (basic - client side for now)
    if (q) {
      const queryLower = q.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        p.categoryName.toLowerCase().includes(queryLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        items: filteredProducts,
        total,
        page,
        limit,
        hasMore: filteredProducts.length === limit,
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan server',
      },
      { status: 500 }
    );
  }
}