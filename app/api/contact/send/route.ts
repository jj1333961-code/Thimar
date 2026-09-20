import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireUser(req);
    const body = await req.json();
    const { name, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'الاسم والرسالة مطلوبان' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'الرسالة طويلة جداً' }, { status: 400 });
    }

    // Check if user is blocked
    if (user && user.id !== 'app_session') {
      const blockDoc = await adminDb.collection('blockedSenders').doc(user.id).get();
      if (blockDoc.exists) {
        return NextResponse.json({ error: 'لا يمكنك إرسال رسائل إلى المسؤول حالياً.' }, { status: 403 });
      }
    }

    // Rate limiting (simple version for demo)
    // In production, use Redis or a similar tool

    await adminDb.collection('adminMessages').add({
      senderName: name,
      senderId: user?.id !== 'app_session' ? user?.id : null,
      senderEmail: user?.email !== 'app@thimar.app' ? user?.email : null,
      body: message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'تم إرسال رسالتك إلى المسؤول بنجاح.' });
  } catch (error: any) {
    console.error('Contact Admin Error:', error);
    return NextResponse.json({ error: 'فشل إرسال الرسالة. حاول مرة أخرى.' }, { status: 500 });
  }
}
