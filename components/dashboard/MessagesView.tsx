'use client';

import React, { useState } from 'react';
import { Search, Send, Mic, Paperclip, CheckCheck, Play, Pause, MoreVertical, Phone, Video, ShieldCheck, UserCheck, Bell, Circle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  badge: 'teacher' | 'admin' | 'group' | 'parent';
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  text?: string;
  isVoice?: boolean;
  voiceDuration?: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

export function MessagesView() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'c1',
      name: 'الشيخ أحمد الحافظ',
      role: 'معلم الحلقة والتجويد',
      badge: 'teacher',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'أحسنت في تطبيق أحكام النون الساكنة اليوم، استمر على هذا الإتقان!',
      time: '10:45 ص',
      unreadCount: 2,
      online: true
    },
    {
      id: 'c2',
      name: 'إدارة منصة ثمار',
      role: 'الدعم الفني والإشراف',
      badge: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'تم اعتماد جدول الاختبارات القرآنية الشهرية وتحديث منظومة التحفة.',
      time: 'أمس',
      unreadCount: 0,
      online: true
    },
    {
      id: 'c3',
      name: 'حلقة الإتقان (مجموعة التسميع)',
      role: 'حلقة تسميع جماعية',
      badge: 'group',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'محمد: سنبدأ التسميع بعد صلاة العصر مباشرة بإذن الله.',
      time: 'أمس',
      unreadCount: 5,
      online: false
    },
    {
      id: 'c4',
      name: 'ولي الأمر (أبو محمد)',
      role: 'متابعة تقدم الطالب',
      badge: 'parent',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      lastMessage: 'شكراً لكم على المتابعة الحثيثة والتقرير الأسبوعي المميز.',
      time: 'الخميس',
      unreadCount: 0,
      online: false
    }
  ]);

  const [activeContactId, setActiveContactId] = useState<string>('c1');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isPlayingVoice, setIsPlayingVoice] = useState<string | null>(null);

  const [chatThreads, setChatThreads] = useState<Record<string, Message[]>>({
    c1: [
      { id: 'm1', sender: 'other', text: 'السلام عليكم ورحمة الله يا بني، هل أتممت مراجعة باب النون الساكنة والتنوين في تحفة الأطفال؟', time: '10:30 ص', status: 'read' },
      { id: 'm2', sender: 'me', text: 'وعليكم السلام ورحمة الله شيخنا الفاضل، نعم حفظت الأبيات كاملة وأتقنت أمثلة الإظهار والإدغام بغنة.', time: '10:34 ص', status: 'read' },
      { id: 'm3', sender: 'other', isVoice: true, voiceDuration: '0:42', time: '10:40 ص', status: 'read' },
      { id: 'm4', sender: 'other', text: 'أحسنت في تطبيق أحكام النون الساكنة اليوم، استمر على هذا الإتقان!', time: '10:45 ص', status: 'read' }
    ],
    c2: [
      { id: 'm1', sender: 'other', text: 'مرحباً بك في منصة ثمار. تم تفعيل جميع ميزات حسابك بنجاح.', time: '09:00 ص', status: 'read' },
      { id: 'm2', sender: 'other', text: 'تم اعتماد جدول الاختبارات القرآنية الشهرية وتحديث منظومة التحفة.', time: '09:15 ص', status: 'read' }
    ]
  });

  const activeContact = contacts.find(c => c.id === activeContactId) || contacts[0];
  const currentMessages = chatThreads[activeContactId] || [];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };

    setChatThreads(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));

    if (!textToSend) setInputText('');

    // Simulated quick reply from teacher
    if (activeContactId === 'c1') {
      setTimeout(() => {
        const replyMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'other',
          text: 'بارك الله فيك ونفع بك، موعدنا في حلقة الغد لنختبر تثبيت الأبيات إن شاء الله.',
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        };
        setChatThreads(prev => ({
          ...prev,
          [activeContactId]: [...(prev[activeContactId] || []), replyMsg]
        }));
      }, 1500);
    }
  };

  const handleSendVoiceNote = () => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      isVoice: true,
      voiceDuration: '0:25',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };
    setChatThreads(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));
  };

  const filteredContacts = contacts.filter(c =>
    c.name.includes(searchQuery) || c.role.includes(searchQuery)
  );

  const quickReplies = [
    'جزاك الله خيراً يا شيخنا',
    'أتممت مراجعة الورد اليومي بحمد الله',
    'سأكون حاضراً في الحلقة بمشيئة الله',
    'أرجو تحديد موعد جلسة التسميع'
  ];

  return (
    <div id="messages-section" className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
      {/* Sidebar: Conversations list */}
      <div className="md:col-span-4 border-l border-stone-200 flex flex-col bg-stone-50/50">
        <div className="p-4 border-b border-stone-200 bg-white">
          <h3 className="font-bold text-lg text-stone-900 mb-3">الرسائل والمحادثات</h3>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث في المحادثات..."
              className="w-full px-4 py-2 pr-9 text-xs bg-stone-100 rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredContacts.map(c => (
            <button
              key={c.id}
              onClick={() => {
                setActiveContactId(c.id);
                // Mark unread as read
                setContacts(prev =>
                  prev.map(item => (item.id === c.id ? { ...item, unreadCount: 0 } : item))
                );
              }}
              className={`w-full text-right p-3 rounded-2xl transition flex items-center gap-3 ${
                activeContactId === c.id
                  ? 'bg-emerald-100/70 border border-emerald-300/80 shadow-xs'
                  : 'hover:bg-stone-100/80'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-stone-200"
                />
                {c.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">{c.name}</span>
                    {c.badge === 'teacher' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                    {c.badge === 'admin' && <UserCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] text-stone-400 flex-shrink-0">{c.time}</span>
                </div>

                <p className="text-xs text-stone-500 truncate mt-1">{c.lastMessage}</p>
              </div>

              {c.unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="md:col-span-8 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={activeContact.avatar}
                alt={activeContact.name}
                className="w-11 h-11 rounded-2xl object-cover border border-stone-200"
              />
              {activeContact.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-stone-900">{activeContact.name}</h4>
                {activeContact.badge === 'teacher' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    معلم معتمد
                  </span>
                )}
                {activeContact.badge === 'admin' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    إدارة النظام
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                {activeContact.online ? 'متصل الآن' : 'آخر ظهور اليوم'} • {activeContact.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-stone-400">
            <button className="p-2 hover:bg-stone-100 rounded-xl transition text-stone-600" title="اتصال صوتي بالحلقة">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-stone-100 rounded-xl transition text-stone-600" title="غرفة تسميع فيديو">
              <Video className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fbfbfa]">
          {currentMessages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-sm shadow-xs ${
                  msg.sender === 'me'
                    ? 'bg-emerald-800 text-white rounded-bl-sm'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-br-sm'
                }`}
              >
                {msg.isVoice ? (
                  /* Voice Note Bubble */
                  <div className="flex items-center gap-3 py-1">
                    <button
                      onClick={() =>
                        setIsPlayingVoice(isPlayingVoice === msg.id ? null : msg.id)
                      }
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs ${
                        msg.sender === 'me'
                          ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                      }`}
                    >
                      {isPlayingVoice === msg.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <div className="flex-1 space-y-1">
                      {/* Waveform graphic */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[40, 70, 30, 90, 60, 45, 80, 50, 65, 35, 75, 45, 60, 90, 50].map((h, i) => (
                          <span
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1 rounded-full transition-all ${
                              isPlayingVoice === msg.id
                                ? 'bg-amber-400 animate-pulse'
                                : msg.sender === 'me'
                                ? 'bg-emerald-300'
                                : 'bg-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] opacity-80">{msg.voiceDuration}</span>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                )}

                <div className="flex items-center justify-end gap-1 text-[10px] opacity-70 mt-1.5 pt-1 border-t border-black/5">
                  <span>{msg.time}</span>
                  {msg.sender === 'me' && (
                    <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-sky-300' : 'text-stone-300'}`} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick reply suggestions */}
        <div className="px-3 py-2 bg-stone-100/60 border-t border-stone-200 overflow-x-auto whitespace-nowrap flex gap-2">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qr)}
              className="px-2.5 py-1 text-xs rounded-full bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-300 hover:border-emerald-300 transition flex-shrink-0"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Chat input box */}
        <div className="p-3 border-t border-stone-200 bg-white">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleSendVoiceNote}
              className="p-2.5 bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-800 rounded-2xl transition"
              title="تسجيل رسالة صوتية للتسميع"
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="اكتب رسالتك للشيخ أو المجموعة..."
              className="flex-1 px-4 py-2.5 text-sm bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-white rounded-2xl transition shadow-sm flex items-center justify-center"
            >
              <Send className="w-4 h-4 transform rotate-180" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
