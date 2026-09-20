import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  try {
    const body = await req.json();
    const { userId, block, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID المستخدم مطلوب' }, { status: 400 });
    }

    if (block) {
      await adminDb.collection('blockedSenders').doc(userId).set({
        userId,
        reason: reason || 'Blocked by admin',
        blockedAt: new Date().toISOString(),
      });
    } else {
      await adminDb.collection('blockedSenders').doc(userId).delete();
    }

    return NextResponse.json({ success: true, isBlocked: block });
  } catch (error: any) {
    console.error('Block User Error:', error);
    return NextResponse.json({ error: 'فشل تنفيذ العملية' }, { status: 500 });
  }
}
