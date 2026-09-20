'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, Eye, EyeOff, Sun, Moon, Zap, CheckCircle2, X, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const isDark = theme === 'dark';

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال اسم المستخدم' : 'Please enter your username');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(
        lang === 'ar'
          ? `مرحباً بك مجدداً يا ${username}! تم تسجيل الدخول بنجاح.`
          : `Welcome back, ${username}! Login successful.`
      );
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    }, 600);
  };

  const handleQuickDemoAccess = () => {
    setUsername('طالب القرآن');
    setPassword('••••••••');
    setSuccessMessage(
      lang === 'ar'
        ? 'تم الدخول السريع عبر الوضع المباشر! مرحباً بك في رحاب القرآن.'
        : 'Quick access enabled! Welcome to the Quran platform.'
    );
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotStatus(
      lang === 'ar'
        ? 'تم إرسال تعليمات إعادة تعيين الرقم السري إلى بريدك الإلكتروني.'
        : 'Password reset link sent to your email.'
    );
    setTimeout(() => {
      setForgotStatus(null);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    }, 2500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail) return;
    setUsername(regName);
    setIsRegisterModalOpen(false);
    setSuccessMessage(
      lang === 'ar'
        ? `تم إنشاء الحساب بنجاح! مرحباً بك يا ${regName} في منصة ثمار.`
        : `Account created successfully! Welcome, ${regName}.`
    );
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        isDark
          ? 'bg-[#063327] text-white'
          : 'bg-[#0c4333] text-stone-100'
      } relative overflow-hidden select-none`}
      style={{
        backgroundImage: `radial-gradient(circle at 50% 10%, rgba(18, 92, 70, 0.4) 0%, rgba(6, 51, 39, 0.95) 75%)`,
      }}
    >
      {/* Decorative Side Borders / Watermarks */}
      <div className="absolute inset-y-0 left-0 w-8 sm:w-16 pointer-events-none opacity-10 bg-[radial-gradient(#caa354_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-16 pointer-events-none opacity-10 bg-[radial-gradient(#caa354_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto px-5 pt-4 pb-8 flex-1 flex flex-col justify-between relative z-10">
        {/* Top Header Row */}
        <div className="space-y-4">
          {/* Controls Bar: Language + Theme Toggle + Ayah Header */}
          <div className="flex items-start justify-between gap-2 pt-1">
            {/* Left Controls */}
            <div className="flex items-center gap-2 pt-1">
              {/* Language Button */}
              <button
                type="button"
                onClick={() => setLang(prev => (prev === 'ar' ? 'en' : 'ar'))}
                className="w-10 h-10 rounded-full border border-[#2b6d58] bg-[#073629]/80 text-[#caa354] font-bold text-xs flex items-center justify-center hover:bg-[#073629] transition shadow-sm"
                title="تغيير اللغة"
              >
                {lang === 'ar' ? 'EN' : 'عربي'}
              </button>

              {/* Theme/Light Toggle */}
              <button
                type="button"
                onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
                className="w-10 h-10 rounded-full border border-[#2b6d58] bg-[#073629]/80 text-[#f59e0b] flex items-center justify-center hover:bg-[#073629] transition shadow-sm"
                title="تبديل وضع الإضاءة"
              >
                {isDark ? <Sun className="w-5 h-5 fill-current" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Quranic Ayah Header Arched Badge */}
            <div className="flex-1 max-w-[280px] sm:max-w-xs text-center border border-[#2b6d58] rounded-[24px] px-3 py-2 bg-[#073629]/70 backdrop-blur-xs shadow-inner">
              <p className="text-xs sm:text-[13px] font-amiri font-bold text-white leading-relaxed tracking-wide">
                كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا
              </p>
              <p className="text-xs sm:text-[13px] font-amiri font-bold text-white leading-relaxed tracking-wide">
                ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ
              </p>
              <p className="text-[11px] font-amiri text-[#caa354] mt-0.5">
                (إبراهيم: 24)
              </p>
            </div>
          </div>

          {/* Quran Banner Card */}
          <div className="relative w-full aspect-[16/9] rounded-[26px] overflow-hidden border border-[#24624f] shadow-2xl bg-black/30 mt-2">
            <Image
              src="/images/quran_stand_clouds.jpg"
              alt="المصحف الشريف على الحامل الخشبي وسط السحاب"
              fill
              priority
              className="object-cover object-center transform hover:scale-105 transition duration-700"
            />
            {/* Subtle inner shadow and mist blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#063327]/80 via-transparent to-black/20 pointer-events-none" />
          </div>
        </div>

        {/* Feedback Alert Messages */}
        {successMessage && (
          <div className="my-2 p-3 rounded-2xl bg-emerald-900/90 border border-emerald-400 text-white text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="my-2 p-3 rounded-2xl bg-rose-950/90 border border-rose-400 text-rose-200 text-xs font-bold text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Login Form Section */}
        <form onSubmit={handleLogin} className="space-y-3.5 my-auto py-2">
          {/* Username Input */}
          <div className="relative flex items-center rounded-full border border-[#2b6d58] bg-[#073629]/90 px-4 py-3.5 shadow-sm focus-within:border-[#caa354] transition">
            {/* Left User Icon */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[#38bdf8] flex-shrink-0">
              <User className="w-5 h-5 fill-current" />
            </div>

            {/* Input field */}
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'}
              className="w-full bg-transparent px-3 text-sm text-white placeholder-[#7ca897] focus:outline-none font-cairo text-right"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Password Input */}
          <div className="relative flex items-center rounded-full border border-[#2b6d58] bg-[#073629]/90 px-4 py-3.5 shadow-sm focus-within:border-[#caa354] transition">
            {/* Left Eye / Toggle Icon */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#38bdf8] flex-shrink-0 hover:text-white transition"
              title="إظهار/إخفاء الرقم السري"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Input field */}
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={lang === 'ar' ? 'الرقم السري' : 'Password'}
              className="w-full bg-transparent px-3 text-sm text-white placeholder-[#7ca897] focus:outline-none font-cairo text-right"
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-center py-1">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-xs font-semibold text-[#caa354] hover:text-[#e4be6b] transition tracking-tight"
            >
              {lang === 'ar' ? 'هل نسيت الرقم السري؟' : 'Forgot password?'}
            </button>
          </div>

          {/* Primary Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#d5aa54] hover:bg-[#e2b761] active:scale-[0.99] text-[#083226] font-extrabold text-base sm:text-lg shadow-md transition flex items-center justify-center"
          >
            {loading ? (
              <span>{lang === 'ar' ? 'جاري التحقق...' : 'Signing in...'}</span>
            ) : (
              <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Secondary Action Row: Green Flash Button + Create Account Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Glowing Green Floating Flash Button on Left */}
          <button
            type="button"
            onClick={handleQuickDemoAccess}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#00b074] hover:bg-[#00c582] active:scale-95 text-white flex items-center justify-center shadow-[0_0_22px_rgba(0,176,116,0.6)] transition duration-200 flex-shrink-0"
            title="الدخول السريع المباشر"
          >
            <Zap className="w-6 h-6 fill-white text-white" />
          </button>

          {/* Create Account Outlined Button */}
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex-1 py-3 px-6 rounded-full border border-[#caa354] bg-[#073629]/50 text-[#caa354] hover:bg-[#caa354]/15 active:scale-[0.99] text-sm font-bold transition text-center shadow-sm"
          >
            {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
          </button>
        </div>

        {/* Bottom Holy Ayah Quote */}
        <div className="text-center pt-6 pb-2 space-y-1">
          <p className="text-[12px] text-[#caa354]/90 font-cairo">
            {lang === 'ar' ? 'قال تعالى:' : 'Allah the Almighty says:'}
          </p>
          <p className="font-amiri text-lg sm:text-xl font-bold text-white/95 tracking-wide">
            ﴿ وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا ﴾
          </p>
          <p className="text-[11px] text-[#caa354]/70 font-amiri">
            (المزمل: 4)
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#08382b] border border-[#2b6d58] rounded-3xl p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1b5141] pb-3">
              <h3 className="font-bold text-sm text-[#caa354]">استعادة الرقم السري</h3>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              أدخل بريدك الإلكتروني المسجل لإرسال رابط إعادة تعيين الرقم السري لحسابك.
            </p>

            {forgotStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-900/80 border border-emerald-400 text-xs font-bold text-emerald-200">
                {forgotStatus}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="البريد الإلكتروني..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#062b21] border border-[#24624f] text-xs text-white placeholder-[#78a896] focus:outline-none focus:border-[#caa354]"
                />
                <Mail className="w-4 h-4 text-[#78a896] absolute left-3 top-3" />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#d5aa54] hover:bg-[#e2b761] text-[#083226] font-bold text-xs transition"
              >
                إرسال رابط الاستعادة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create New Account Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#08382b] border border-[#2b6d58] rounded-3xl p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#1b5141] pb-3">
              <h3 className="font-bold text-sm text-[#caa354]">إنشاء حساب جديد في ثمار</h3>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="اسم المستخدم أو الاسم الكامل..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#062b21] border border-[#24624f] text-xs text-white placeholder-[#78a896] focus:outline-none focus:border-[#caa354]"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="البريد الإلكتروني..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#062b21] border border-[#24624f] text-xs text-white placeholder-[#78a896] focus:outline-none focus:border-[#caa354]"
                />
              </div>

              <div>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="الرقم السري الجديد..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#062b21] border border-[#24624f] text-xs text-white placeholder-[#78a896] focus:outline-none focus:border-[#caa354]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#d5aa54] hover:bg-[#e2b761] text-[#083226] font-bold text-xs transition mt-2"
              >
                تأكيد وتسجيل الحساب
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
