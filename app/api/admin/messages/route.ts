import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const snapshot = await adminDb.collection('adminMessages')
      .orderBy('createdAt', 'desc')
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Fetch Admin Messages Error:', error);
    return NextResponse.json({ error: 'فشل جلب الرسائل' }, { status: 500 });
  }
}
