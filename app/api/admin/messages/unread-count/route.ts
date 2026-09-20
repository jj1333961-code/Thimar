import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const snapshot = await adminDb.collection('adminMessages')
      .where('status', '==', 'unread')
      .count()
      .get();

    return NextResponse.json({ count: snapshot.data().count });
  } catch (error: any) {
    console.error('Fetch Unread Admin Messages Count Error:', error);
    return NextResponse.json({ count: 0 });
  }
}
