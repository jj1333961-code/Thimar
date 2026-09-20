import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/server-auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const { id } = await params;
  try {
    const body = await req.json();
    const { status } = body;

    if (!['read', 'unread'].includes(status)) {
      return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
    }

    await adminDb.collection('adminMessages').doc(id).update({
      status,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update Admin Message Error:', error);
    return NextResponse.json({ error: 'فشل تحديث الرسالة' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin(req);
  if (response) return response;

  const { id } = await params;
  try {
    await adminDb.collection('adminMessages').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Admin Message Error:', error);
    return NextResponse.json({ error: 'فشل حذف الرسالة' }, { status: 500 });
  }
}
