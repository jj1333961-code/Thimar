'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, Send, Sparkles, Volume2, Move, RefreshCw, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export function DraggableAIChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 120 }); // initial offset from bottom-left
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'السلام عليكم ورحمة الله وبركاته 🌿\nأنا رفيقك القرآني الذكي في منصة ثمار. يمكنك سؤالي عن أحكام التجويد، متن تحفة الأطفال، تفسير الآيات، أو نصائح لمراجعة وتثبيت الحفظ!',
      timestamp: 'الآن'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...position };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = dragStartRef.current.y - e.clientY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
    }

    const newX = Math.max(16, Math.min(window.innerWidth - 80, initialPosRef.current.x + deltaX));
    const newY = Math.max(80, Math.min(window.innerHeight - 100, initialPosRef.current.y + deltaY));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
  };

  const handleBubbleClick = (e: React.MouseEvent) => {
    if (!hasMovedRef.current) {
      setIsOpen(!isOpen);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      const aiReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'الحمد لله، نسأل الله أن يبارك في علمك وحفظك.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'يسعدني دائماً مساعدتك في أحكام التجويد ومراجعة الحفظ ومتن تحفة الأطفال.',
          timestamp: 'الآن'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const quickPrompts = [
    'اشرح لي أحكام النون الساكنة باختصار',
    'ما الفرق بين الإخفاء والإدغام؟',
    'ما هي أبيات المقدمة في تحفة الأطفال؟',
    'كيف أثبت حفظ سورة الملك؟'
  ];

  return (
    <>
      {/* Floating draggable circular button */}
      <div
        id="draggable-ai-chat-bubble"
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          bottom: `${position.y}px`,
          zIndex: 50,
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleBubbleClick}
        className={`group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-600 text-white shadow-2xl cursor-grab active:cursor-grabbing select-none transition-transform duration-150 ${
          isDragging ? 'scale-105 shadow-emerald-900/50' : 'hover:scale-105'
        }`}
        title="اسحب الدائرة الذكية أو انقر لبدء المحادثة"
      >
        {/* Animated ambient ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
        <span className="absolute inset-0 rounded-full border-2 border-emerald-300/40 pointer-events-none" />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          <Bot className="w-7 h-7 text-amber-300" />
          <span className="text-[10px] font-bold tracking-tight text-emerald-100 mt-0.5">ذكاء ثمار</span>
        </div>

        {/* Small drag hint badge */}
        <div className="absolute -top-1 -right-1 bg-amber-400 text-emerald-950 rounded-full p-1 shadow">
          <Move className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* Slide-over / Modal Chat Window */}
      {isOpen && (
        <div
          id="ai-chat-dialog-modal"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-start sm:p-6 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full sm:w-[440px] h-[85vh] sm:h-[620px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200 sm:mr-6"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-l from-emerald-900 via-emerald-800 to-teal-900 text-white flex items-center justify-between border-b border-emerald-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-500/50 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">رفيق ثمار القرآني</h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/30">
                      Gemini الذكي
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200">مساعدك في التجويد وتحفة الأطفال والحفظ</p>
                </div>
              </div>

              <button
                id="close-ai-chat-btn"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white rounded-bl-sm'
                        : 'bg-white text-stone-800 border border-stone-200 rounded-br-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line leading-relaxed font-cairo">{msg.text}</p>
                    
                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] opacity-75 border-t border-black/5 pt-1">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'ai' && (
                        <button
                          onClick={() => speakText(msg.text)}
                          title="استمع للإجابة"
                          className="hover:text-emerald-600 transition flex items-center gap-1"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>استمع</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-stone-200 w-fit text-stone-500 text-xs shadow-sm">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>الرفيق الذكي يراجع المصادر ويكتب الرد...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 py-2 bg-stone-100 border-t border-stone-200 overflow-x-auto whitespace-nowrap flex gap-2">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 text-xs rounded-full bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-300 hover:border-emerald-300 transition flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="p-3 bg-white border-t border-stone-200">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="اسأل عن آية، حكم تجويدي، أو بيت من التحفة..."
                  className="flex-1 px-4 py-2.5 text-sm bg-stone-50 rounded-2xl border border-stone-300 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  disabled={loading}
                />
                <button
                  id="send-ai-message-btn"
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-2xl transition shadow-md flex items-center justify-center"
                >
                  <Send className="w-4 h-4 transform rotate-180" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
