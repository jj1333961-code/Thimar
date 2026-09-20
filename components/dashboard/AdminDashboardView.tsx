'use client';

import React, { useState } from 'react';
import { Users, ShieldAlert, CheckCircle, Ban, AlertTriangle, Send, Search, Filter, ShieldCheck, UserX, Award, Bell, Eye } from 'lucide-react';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'طالب' | 'معلم' | 'ولي أمر';
  status: 'active' | 'blocked' | 'suspended';
  halaqa: string;
  joinedDate: string;
  lastActive: string;
  blockReason?: string;
}

export function AdminDashboardView() {
  const [users, setUsers] = useState<ManagedUser[]>([
    {
      id: 'u1',
      name: 'عثمان شعبان',
      email: 'othman.shaban@example.com',
      role: 'طالب',
      status: 'active',
      halaqa: 'حلقة الإتقان - المستوى الثاني',
      joinedDate: '2024-01-15',
      lastActive: 'منذ 10 دقائق'
    },
    {
      id: 'u2',
      name: 'عبد الرحمن خالد',
      email: 'abdulrahman.k@example.com',
      role: 'طالب',
      status: 'active',
      halaqa: 'حلقة تحفة الأطفال والتجويد',
      joinedDate: '2024-02-01',
      lastActive: 'منذ ساعتين'
    },
    {
      id: 'u3',
      name: 'سالم المحمدي',
      email: 'salem.m@example.com',
      role: 'طالب',
      status: 'blocked',
      halaqa: 'حلقة التثبيت المسائية',
      joinedDate: '2023-11-20',
      lastActive: 'منذ يومين',
      blockReason: 'تكرار الغياب ومخالفة آداب مجلس القرآن'
    },
    {
      id: 'u4',
      name: 'الشيخ إبراهيم عبد الله',
      email: 'sheikh.ibrahim@example.com',
      role: 'معلم',
      status: 'active',
      halaqa: 'معلم ومشرف حلقة النبأ',
      joinedDate: '2023-08-10',
      lastActive: 'الآن'
    },
    {
      id: 'u5',
      name: 'طارق السبيعي',
      email: 'tariq.s@example.com',
      role: 'ولي أمر',
      status: 'active',
      halaqa: 'ولي أمر الطالب محمد طارق',
      joinedDate: '2024-01-05',
      lastActive: 'أمس'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'طالب' | 'معلم' | 'ولي أمر'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Modal states
  const [blockingUser, setBlockingUser] = useState<ManagedUser | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState('مخالفة معايير السلوك في حلقة التسميع');
  const [warningUser, setWarningUser] = useState<ManagedUser | null>(null);
  const [warningMsgInput, setWarningMsgInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Broadcast announcement
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBlockUser = async () => {
    if (!blockingUser) return;
    try {
      await fetch('/api/admin/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: blockingUser.id, action: 'block', reason: blockReasonInput })
      });
      setUsers(prev =>
        prev.map(u =>
          u.id === blockingUser.id ? { ...u, status: 'blocked', blockReason: blockReasonInput } : u
        )
      );
      showToast(`تم حظر حساب ${blockingUser.name} وتجميد صلاحيات الدخول.`);
    } catch (err) {
      showToast('حدث خطأ أثناء تنفيذ الحظر');
    } finally {
      setBlockingUser(null);
    }
  };

  const handleUnblockUser = async (user: ManagedUser) => {
    try {
      await fetch('/api/admin/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, action: 'unblock' })
      });
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, status: 'active', blockReason: undefined } : u
        )
      );
      showToast(`تم فك حظر حساب ${user.name} بنجاح.`);
    } catch (err) {
      showToast('حدث خطأ أثناء فك الحظر');
    }
  };

  const handleSendWarning = () => {
    if (!warningUser || !warningMsgInput.trim()) return;
    showToast(`تم إرسال التنبيه الرسمي إلى ${warningUser.name}`);
    setWarningUser(null);
    setWarningMsgInput('');
  };

  const handleSendBroadcast = () => {
    if (!broadcastText.trim()) return;
    showToast('تم نشر الإعلان العام لجميع مستخدمي المنصة بنجاح.');
    setBroadcastText('');
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.includes(searchQuery) || u.email.includes(searchQuery) || u.halaqa.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div id="admin-dashboard-section" className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-900 text-white rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-4 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-emerald-300 hover:text-white">
            إغلاق
          </button>
        </div>
      )}

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-500">إجمالي الطلاب المسجلين</span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">1,420</div>
          <span className="text-[11px] text-emerald-700 font-semibold">+18 هذا الأسبوع</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-500">الحلقات القرآنية النشطة</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">38</div>
          <span className="text-[11px] text-stone-500 font-medium">بإشراف 24 معلماً مجازاً</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-500">جلسات التسميع المكتملة</span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">8,940</div>
          <span className="text-[11px] text-emerald-700 font-semibold">نسبة إتقان 94.2%</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-stone-500">الحسابات المحظورة والمقيدة</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {users.filter(u => u.status === 'blocked').length}
          </div>
          <span className="text-[11px] text-rose-700 font-medium">تم تطبيق العقوبة الإدارية</span>
        </div>
      </div>

      {/* Users Management & Moderation Section */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">إدارة المستخدمين وحظر الحسابات</h3>
            <p className="text-xs text-stone-500">التحكم بصلاحيات الطلاب والمعلمين وإصدار التنبيهات الرسمية</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو البريد..."
                className="w-full sm:w-60 px-3.5 py-2 pr-9 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>

            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-300 font-cairo"
            >
              <option value="all">كل الأدوار</option>
              <option value="طالب">الطلاب</option>
              <option value="معلم">المعلمون</option>
              <option value="ولي أمر">أولياء الأمور</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="pb-3 font-bold">المستخدم</th>
                <th className="pb-3 font-bold">الدور</th>
                <th className="pb-3 font-bold">الحلقة / المجموعة</th>
                <th className="pb-3 font-bold">حالة الحساب</th>
                <th className="pb-3 font-bold">آخر نشاط</th>
                <th className="pb-3 font-bold text-center">الإجراءات والتحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-stone-50/80 transition">
                  <td className="py-3.5">
                    <div className="font-bold text-stone-900">{user.name}</div>
                    <div className="text-stone-400 text-xs">{user.email}</div>
                  </td>

                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700">
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3.5 text-stone-600">{user.halaqa}</td>

                  <td className="py-3.5">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>نشط</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                        <Ban className="w-3.5 h-3.5" />
                        <span>محظور</span>
                      </span>
                    )}
                    {user.blockReason && (
                      <div className="text-[10px] text-rose-600 mt-1 max-w-[180px] truncate">
                        السبب: {user.blockReason}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 text-stone-500 text-xs">{user.lastActive}</td>

                  <td className="py-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      {user.status === 'active' ? (
                        <button
                          onClick={() => setBlockingUser(user)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1"
                          title="حظر الحساب"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>حظر</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnblockUser(user)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1"
                          title="فك الحظر"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>فك الحظر</span>
                        </button>
                      )}

                      <button
                        onClick={() => setWarningUser(user)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition flex items-center gap-1"
                        title="إرسال تنبيه رسمي"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>تنبيه</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Announcement Center */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-stone-900">إرسال إعلان عام وتنبيه شامل</h4>
            <p className="text-xs text-stone-500">نشر إشعار إداري يظهر في الصفحة الرئيسية للطلاب والمعلمين</p>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            value={broadcastText}
            onChange={e => setBroadcastText(e.target.value)}
            rows={3}
            placeholder="اكتب نص الإعلان الإداري (مثال: موعد اختبارات تجويد متن تحفة الأطفال لشهر رمضان)..."
            className="w-full p-4 text-xs sm:text-sm bg-stone-50 rounded-2xl border border-stone-300 focus:outline-none focus:border-emerald-600 resize-none"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-stone-600">الفئة المستهدفة:</label>
              <select
                value={broadcastTarget}
                onChange={e => setBroadcastTarget(e.target.value)}
                className="px-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-300 font-cairo"
              >
                <option value="all">جميع مستخدمي المنصة</option>
                <option value="students">الطلاب فقط</option>
                <option value="teachers">المعلمون فقط</option>
              </select>
            </div>

            <button
              onClick={handleSendBroadcast}
              disabled={!broadcastText.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 transform rotate-180" />
              <span>نشر وتعميم الإعلان</span>
            </button>
          </div>
        </div>
      </div>

      {/* Block Account Modal */}
      {blockingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setBlockingUser(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-stone-900">حظر حساب المستخدم</h4>
                <p className="text-xs text-stone-500">{blockingUser.name} ({blockingUser.email})</p>
              </div>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              سيؤدي هذا الإجراء إلى منع المستخدم من دخول المنصة وحضور جلسات التسميع وإرسال الرسائل.
            </p>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-bold text-stone-700 block">سبب الحظر:</label>
              <select
                value={blockReasonInput}
                onChange={e => setBlockReasonInput(e.target.value)}
                className="w-full p-2.5 text-xs bg-stone-50 rounded-xl border border-stone-300 font-cairo"
              >
                <option value="مخالفة معايير السلوك في حلقة التسميع">مخالفة معايير السلوك في حلقة التسميع</option>
                <option value="تكرار الغياب غير المبرر عن الحصص المقررة">تكرار الغياب غير المبرر عن الحصص المقررة</option>
                <option value="إساءة استخدام المنظومة الذكية">إساءة استخدام المنظومة الذكية</option>
                <option value="طلب من ولي الأمر أو إدارة الحلقة">طلب من ولي الأمر أو إدارة الحلقة</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleBlockUser}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition"
              >
                تأكيد حظر الحساب
              </button>
              <button
                onClick={() => setBlockingUser(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Notification Modal */}
      {warningUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setWarningUser(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-stone-900">إرسال تنبيه رسمي</h4>
                <p className="text-xs text-stone-500">إلى: {warningUser.name}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="text-xs font-bold text-stone-700 block">نص التنبيه أو الملاحظة:</label>
              <textarea
                value={warningMsgInput}
                onChange={e => setWarningMsgInput(e.target.value)}
                rows={3}
                placeholder="نلفت انتباهكم إلى ضرورة الالتزام بموعد الحلقة والتسميع اليومي..."
                className="w-full p-3 text-xs bg-stone-50 rounded-xl border border-stone-300 focus:outline-none focus:border-emerald-600 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSendWarning}
                disabled={!warningMsgInput.trim()}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold text-xs rounded-xl transition"
              >
                إرسال التنبيه
              </button>
              <button
                onClick={() => setWarningUser(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
