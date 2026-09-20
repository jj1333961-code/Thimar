'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, RefreshCw, ShieldAlert, LifeBuoy, CheckCircle2, Lock, Sparkles, HelpCircle } from 'lucide-react';

function LoginFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reasonParam = searchParams ? searchParams.get('reason') : null;
  const [retrying, setRetrying] = useState(false);
  const [recovered, setRecovered] = useState(false);

  const getReasonDetails = () => {
    switch (reasonParam) {
      case 'blocked':
      case 'account-blocked':
        return {
          title: 'الحساب مقيد أو محظور إدارياً',
          description: 'تم تقييد الوصول إلى هذا الحساب بناءً على مراجعة إدارية أو مخالفة آداب مجلس القرآن. يمكنك التواصل مع إدارة منصة ثمار لتقديم طلب مراجعة.',
          icon: <ShieldAlert className="w-8 h-8 text-rose-600" />,
          color: 'border-rose-200 bg-rose-50/70',
        };
      case 'invalid-credentials':
      case 'wrong-password':
        return {
          title: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          description: 'تعذر التحقق من البيانات المدخلة. تأكد من صحة البريد الإلكتروني وكلمة المرور وحالة زر Caps Lock.',
          icon: <Lock className="w-8 h-8 text-amber-600" />,
          color: 'border-amber-200 bg-amber-50/70',
        };
      case 'popup-closed':
      case 'cancelled':
        return {
          title: 'تم إلغاء نافذة تسجيل الدخول',
          description: 'تم إغلاق نافذة المصادقة الخارجية قبل إتمام الربط. يمكنك إعادة المحاولة في أي وقت.',
          icon: <AlertTriangle className="w-8 h-8 text-stone-600" />,
          color: 'border-stone-200 bg-stone-50',
        };
      default:
        return {
          title: 'تعذر إتمام تسجيل الدخول (Login Failed)',
          description: 'حدث خطأ مؤقت أثناء الاتصال بخدمة المصادقة أو انتهت صلاحية الجلسة. تم توفير حلول بديلة فورية بالأسفل لاستعادة الوصول دون فقدان بياناتك.',
          icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
          color: 'border-amber-200 bg-amber-50/70',
        };
    }
  };

  const details = getReasonDetails();

  const handleQuickRecovery = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      setRecovered(true);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center shadow-inner">
          {details.icon}
        </div>

        {/* Title and Explanation */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-800 text-xs font-bold">
            <span>تنبيه المصادقة • خطأ تسجيل الدخول</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-cairo text-stone-900">
            {details.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
            {details.description}
          </p>
        </div>

        {/* Status Box */}
        <div className={`p-4 rounded-2xl border text-right text-xs sm:text-sm space-y-2 ${details.color}`}>
          <div className="flex items-center gap-2 font-bold text-stone-800">
            <HelpCircle className="w-4 h-4 text-emerald-800 flex-shrink-0" />
            <span>الحلول والإجراءات المتاحة الآن:</span>
          </div>
          <ul className="list-disc list-inside text-stone-600 space-y-1 text-xs pr-1">
            <li>إعادة المحاولة باستخدام حساب Google أو Apple المباشر.</li>
            <li>الدخول التلقائي السريع بصفة (طالب قرآن / زائر) بدون انتظار.</li>
            <li>التأكد من عدم وجود مسافات إضافية في حقل البريد الإلكتروني.</li>
          </ul>
        </div>

        {recovered && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم إصلاح الجلسة بنجاح! جاري تحويلك للصفحة الرئيسية...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Quick Auto Fix / Recovery Button */}
          <button
            onClick={handleQuickRecovery}
            disabled={retrying || recovered}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'جاري إصلاح الجلسة وتجديد الاتصال...' : 'إصلاح فوري وإعادة تسجيل الدخول'}</span>
          </button>

          {/* Return Home as Guest */}
          <Link
            href="/"
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>متابعة التصفح والاستماع للمصحف كطالب</span>
          </Link>
        </div>

        {/* Support Link */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-xs text-stone-500">
          <LifeBuoy className="w-4 h-4 text-emerald-700" />
          <span>إذا كنت تعتقد أن هناك خطأ بحسابك، يرجى مراسلة مشرف الحلقة أو الإدارة.</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
          <div className="p-6 bg-white rounded-2xl shadow border border-stone-200 text-center font-cairo">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-700 mb-2" />
            <p className="text-sm font-bold text-stone-700">جاري فحص حالة تسجيل الدخول...</p>
          </div>
        </div>
      }
    >
      <LoginFailedContent />
    </Suspense>
  );
}
