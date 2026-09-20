import { NextRequest, NextResponse } from 'next/server';

// In-memory or simulated database of users for platform roles and authentication
const USERS_DB = [
  {
    id: 'u1',
    name: 'عثمان شعبان',
    email: 'othman.shaban@example.com',
    role: 'student',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'عبد الرحمن خالد',
    email: 'abdulrahman.k@example.com',
    role: 'student',
    status: 'active',
  },
  {
    id: 'u3',
    name: 'سالم المحمدي',
    email: 'salem.m@example.com',
    role: 'student',
    status: 'blocked',
    blockReason: 'تكرار الغياب ومخالفة آداب مجلس القرآن',
  },
  {
    id: 'u4',
    name: 'الشيخ إبراهيم عبد الله',
    email: 'sheikh.ibrahim@example.com',
    role: 'teacher',
    status: 'active',
  },
  {
    id: 'admin',
    name: 'مشرف منصة ثمار',
    email: 'admin@thimar.org',
    role: 'admin',
    status: 'active',
  }
];

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'login-failed-missing', message: 'يرجى كتابة البريد الإلكتروني' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is known and blocked
    const foundUser = USERS_DB.find(u => u.email.toLowerCase() === cleanEmail);

    if (foundUser && foundUser.status === 'blocked') {
      return NextResponse.json(
        {
          success: false,
          error: 'login-failed-blocked',
          message: `عذراً، تم حظر هذا الحساب إدارياً (${foundUser.blockReason || 'مخالفة معايير المنصة'}). يرجى التواصل مع الإدارة.`,
          userId: foundUser.id,
          status: 'blocked'
        },
        { status: 403 }
      );
    }

    // Default successful login for student / teacher / admin
    const userRole = role || (foundUser ? foundUser.role : 'student');
    const userName = foundUser ? foundUser.name : cleanEmail.split('@')[0];

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: foundUser ? foundUser.id : `usr_${Date.now()}`,
        name: userName,
        email: cleanEmail,
        role: userRole,
        status: 'active',
        token: `thimar_tk_${Date.now()}`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'login-failed', message: 'حدث خطأ في الخادم أثناء تسجيل الدخول' },
      { status: 500 }
    );
  }
}
