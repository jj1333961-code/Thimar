import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, action, reason } = await req.json();
    return NextResponse.json({
      success: true,
      message: action === 'block' ? 'تم حظر المستخدم بنجاح' : 'تم فك حظر المستخدم بنجاح',
      userId,
      status: action === 'block' ? 'blocked' : 'active',
      reason: reason || 'مخالفة معايير المنصة',
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
