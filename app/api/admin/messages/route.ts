import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    messages: [
      { id: '1', from: 'الشيخ أحمد الحافظ', content: 'السلام عليكم ورحمة الله، أرجو تأكيد موعد حلقة التسميع القادمة غداً بإذن الله.', date: 'اليوم 04:30 م', unread: true },
      { id: '2', from: 'إدارة المنصة', content: 'تم تحديث منظومة تحفة الأطفال وإضافة اختبارات التجويد التفاعلية بنجاح.', date: 'أمس 09:15 ص', unread: false }
    ]
  });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    return NextResponse.json({ success: true, message: 'تم إرسال الرسالة بنجاح', data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
