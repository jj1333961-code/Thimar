/**
 * Thimar Gemini AI Assistant
 * Supports:
 * - Multi-turn conversation with history
 * - Google Search Grounding with Gemini 3.5 Flash
 * - Role-based System Instructions
 * - Voice recording and real-time audio interaction
 * - Fast mode (gemini-3.1-flash-lite), Standard (gemini-3.5-flash), Pro (gemini-3.1-pro-preview)
 */

(function () {
  let chatHistory = [];
  let currentModel = 'gemini-3.5-flash';
  let currentRole = 'general';
  let useSearch = false;
  let isRecording = false;
  let mediaRecorder = null;
  let audioChunks = [];

  function initGeminiChat() {
    if (document.getElementById('geminiFloatingButton')) return;

    // Inject Styles
    const style = document.createElement('style');
    style.id = 'gemini-chat-styles';
    style.textContent = `
      .gemini-fab {
        position: fixed;
        bottom: 24px;
        left: 24px;
        width: 58px;
        height: 58px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
        color: #ffffff;
        box-shadow: 0 8px 24px rgba(5, 150, 105, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 99999;
        transition: transform 0.2s, box-shadow 0.2s;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }
      .gemini-fab:hover {
        transform: scale(1.08);
        box-shadow: 0 12px 28px rgba(5, 150, 105, 0.5);
      }
      .gemini-fab svg {
        width: 28px;
        height: 28px;
      }
      .gemini-modal {
        position: fixed;
        bottom: 92px;
        left: 24px;
        width: 420px;
        max-width: calc(100vw - 48px);
        height: 600px;
        max-height: calc(100vh - 120px);
        background: var(--card-bg, #ffffff);
        color: var(--text-color, #1e293b);
        border: 1px solid var(--border, #e2e8f0);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        z-index: 99999;
        overflow: hidden;
        animation: geminiSlideUp 0.25s ease-out;
      }
      @keyframes geminiSlideUp {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .gemini-header {
        padding: 14px 18px;
        background: linear-gradient(135deg, #065f46, #047857);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .gemini-header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        font-size: 15px;
      }
      .gemini-header-tools {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .gemini-btn-icon {
        background: rgba(255, 255, 255, 0.15);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.2s;
      }
      .gemini-btn-icon:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .gemini-config-bar {
        padding: 8px 12px;
        background: var(--table-header, #f8fafc);
        border-bottom: 1px solid var(--border, #e2e8f0);
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        font-size: 12px;
      }
      .gemini-select {
        padding: 4px 8px;
        border-radius: 8px;
        border: 1px solid var(--border, #cbd5e1);
        background: var(--card-bg, #ffffff);
        color: inherit;
        font-size: 11px;
        outline: none;
      }
      .gemini-toggle-label {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        user-select: none;
        color: #047857;
        font-weight: 600;
      }
      .gemini-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .gemini-msg {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 13.5px;
        line-height: 1.5;
        word-break: break-word;
      }
      .gemini-msg.user {
        align-self: flex-start;
        background: linear-gradient(135deg, #059669, #047857);
        color: white;
        border-bottom-right-radius: 4px;
      }
      .gemini-msg.model {
        align-self: flex-end;
        background: var(--table-header, #f1f5f9);
        color: inherit;
        border: 1px solid var(--border, #e2e8f0);
        border-bottom-left-radius: 4px;
      }
      .gemini-grounding {
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px dashed #cbd5e1;
        font-size: 11px;
        color: #64748b;
      }
      .gemini-grounding a {
        color: #0284c7;
        text-decoration: underline;
        margin-right: 6px;
      }
      .gemini-input-area {
        padding: 12px;
        border-top: 1px solid var(--border, #e2e8f0);
        background: var(--card-bg, #ffffff);
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .gemini-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--border, #cbd5e1);
        border-radius: 12px;
        background: var(--table-header, #f8fafc);
        color: inherit;
        font-size: 13px;
        outline: none;
      }
      .gemini-input:focus {
        border-color: #059669;
      }
      .gemini-send-btn {
        background: #059669;
        color: white;
        border: none;
        padding: 10px 14px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .gemini-voice-btn {
        background: #f1f5f9;
        color: #0f172a;
        border: 1px solid #cbd5e1;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .gemini-voice-btn.recording {
        background: #ef4444;
        color: white;
        animation: pulse 1s infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .gemini-chips {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 6px 12px;
        border-top: 1px solid var(--border, #f1f5f9);
        background: var(--card-bg, #ffffff);
      }
      .gemini-chip {
        white-space: nowrap;
        font-size: 11px;
        padding: 4px 10px;
        background: var(--table-header, #f1f5f9);
        border: 1px solid var(--border, #e2e8f0);
        border-radius: 12px;
        cursor: pointer;
        color: var(--text-color, #334155);
      }
      .gemini-chip:hover {
        background: #e2e8f0;
        color: #047857;
      }
      @media(max-width: 600px) {
        .gemini-modal {
          bottom: 16px;
          left: 12px;
          right: 12px;
          width: auto;
          max-width: none;
          height: calc(100vh - 32px);
          max-height: none;
          border-radius: 16px;
        }
      }
    `;
    document.head.appendChild(style);

    // Create Floating Action Button
    const fab = document.createElement('div');
    fab.id = 'geminiFloatingButton';
    fab.className = 'gemini-fab';
    fab.title = 'مساعد ثمار الذكي (Gemini)';
    fab.innerHTML = `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    `;
    document.body.appendChild(fab);

    // Create Modal container
    const modal = document.createElement('div');
    modal.id = 'geminiChatModal';
    modal.className = 'gemini-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="gemini-header">
        <div class="gemini-header-title">
          <span>✨ مساعد ثمار الذكي (Gemini)</span>
        </div>
        <div class="gemini-header-tools">
          <button class="gemini-btn-icon" id="geminiClearBtn" title="مسح المحادثة">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
          <button class="gemini-btn-icon" id="geminiCloseBtn" title="إغلاق">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      </div>
      <div class="gemini-config-bar">
        <select class="gemini-select" id="geminiRoleSelect" title="الدور التخصصي">
          <option value="quran_expert">📖 خبير القرآن والتجويد</option>
          <option value="student_tutor">🎓 رفيق الطالب</option>
          <option value="teacher_assistant">👨‍🏫 مساعد المعلم</option>
          <option value="parent_advisor">👨‍👩‍👧 مستشار ولي الأمر</option>
          <option value="admin_consultant">⚙️ مستشار الإدارة</option>
          <option value="general" selected>💬 مساعد عام</option>
        </select>
        <select class="gemini-select" id="geminiModelSelect" title="النموذج">
          <option value="gemini-3.5-flash" selected>Gemini 3.5 Flash (دقيق ومتكامل)</option>
          <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (فائق السرعة)</option>
          <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (استدلال متقدم)</option>
        </select>
        <label class="gemini-toggle-label" title="تفعيل البحث المباشر عبر Google للتحقق من المعلومات الحية">
          <input type="checkbox" id="geminiSearchToggle">
          <span>🌐 بحث Google</span>
        </label>
      </div>
      <div class="gemini-messages" id="geminiMessagesContainer">
        <div class="gemini-msg model">
          مرحباً بك في منصة ثمار القرآنية! أنا مساعدك الذكي المدعوم بـ Gemini. كيف يمكنني إعانتك اليوم في تلاوة، حفظ، تفسير، أو إدارة الحلقات؟
        </div>
      </div>
      <div class="gemini-chips">
        <div class="gemini-chip" data-prompt="ما هي أحكام النون الساكنة والتنوين؟">أحكام النون الساكنة</div>
        <div class="gemini-chip" data-prompt="فسر لي سورة الإخلاص باختصار">تفسير سورة الإخلاص</div>
        <div class="gemini-chip" data-prompt="اقترح لي جدولاً لحفظ جزء عم في شهر">جدول حفظ جزء عم</div>
        <div class="gemini-chip" data-prompt="كيف أحفز ابني على مداومة تلاوة القرآن؟">نصائح لولي الأمر</div>
      </div>
      <div class="gemini-input-area">
        <button class="gemini-voice-btn" id="geminiVoiceBtn" title="تحدث بصوتك أو سجل تلاوتك">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
        </button>
        <input type="text" class="gemini-input" id="geminiTextInput" placeholder="اكتب سؤالك أو استفسارك هنا...">
        <button class="gemini-send-btn" id="geminiSendBtn">
          <span>إرسال</span>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    // Event Handlers
    fab.addEventListener('click', function () {
      modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
      if (modal.style.display === 'flex') {
        const input = document.getElementById('geminiTextInput');
        if (input) input.focus();
      }
    });

    document.getElementById('geminiCloseBtn').addEventListener('click', function () {
      modal.style.display = 'none';
    });

    document.getElementById('geminiClearBtn').addEventListener('click', function () {
      chatHistory = [];
      const cont = document.getElementById('geminiMessagesContainer');
      cont.innerHTML = `
        <div class="gemini-msg model">
          تم بدء محادثة جديدة. كيف يمكنني مساعدتك الآن؟
        </div>
      `;
    });

    document.getElementById('geminiRoleSelect').addEventListener('change', function (e) {
      currentRole = e.target.value;
    });

    document.getElementById('geminiModelSelect').addEventListener('change', function (e) {
      currentModel = e.target.value;
    });

    document.getElementById('geminiSearchToggle').addEventListener('change', function (e) {
      useSearch = e.target.checked;
    });

    // Chips
    modal.querySelectorAll('.gemini-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const prompt = this.dataset.prompt;
        const input = document.getElementById('geminiTextInput');
        if (input) {
          input.value = prompt;
          sendGeminiMessage();
        }
      });
    });

    // Input submission
    const textInput = document.getElementById('geminiTextInput');
    textInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && !e.isComposing) {
        sendGeminiMessage();
      }
    });

    document.getElementById('geminiSendBtn').addEventListener('click', sendGeminiMessage);

    // Voice button handling
    const voiceBtn = document.getElementById('geminiVoiceBtn');
    voiceBtn.addEventListener('click', toggleVoiceRecording);
  }

  async function sendGeminiMessage() {
    const input = document.getElementById('geminiTextInput');
    const text = input ? input.value.trim() : '';
    if (!text) return;
    input.value = '';

    const container = document.getElementById('geminiMessagesContainer');

    // Add user message to UI
    const userMsgEl = document.createElement('div');
    userMsgEl.className = 'gemini-msg user';
    userMsgEl.textContent = text;
    container.appendChild(userMsgEl);

    // Add loading model message
    const botMsgEl = document.createElement('div');
    botMsgEl.className = 'gemini-msg model';
    botMsgEl.innerHTML = '<em>جاري التفكير والتوليد عبر Gemini...</em>';
    container.appendChild(botMsgEl);
    container.scrollTop = container.scrollHeight;

    // Append to local history
    chatHistory.push({ role: 'user', text });

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory.slice(-10),
          message: text,
          role: currentRole,
          model: currentModel,
          useGoogleSearch: useSearch,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'تعذر الحصول على رد من خادم Gemini');
      }

      const replyText = data.text || 'لم يصل رد مناسب.';
      chatHistory.push({ role: 'model', text: replyText });

      let formattedHtml = replyText.replace(/\n/g, '<br>');

      // Render search grounding if available
      if (data.groundingMetadata && data.groundingMetadata.groundingChunks) {
        const chunks = data.groundingMetadata.groundingChunks;
        const links = chunks
          .filter(c => c.web && c.web.uri)
          .map(c => `<a href="${c.web.uri}" target="_blank" rel="noopener noreferrer">${c.web.title || 'مصدر خارجي'}</a>`)
          .join(' | ');
        if (links) {
          formattedHtml += `<div class="gemini-grounding">🌐 مصادر البحث: ${links}</div>`;
        }
      }

      botMsgEl.innerHTML = formattedHtml;
    } catch (err) {
      botMsgEl.innerHTML = `<span style="color: #ef4444;">⚠️ خطأ: ${err.message || 'تعذر الاتصال بالذكاء الاصطناعي'}</span>`;
    }

    container.scrollTop = container.scrollHeight;
  }

  async function toggleVoiceRecording() {
    const voiceBtn = document.getElementById('geminiVoiceBtn');
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = function (e) {
          if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = async function () {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async function () {
            const base64Audio = reader.result;
            handleVoiceSubmission(base64Audio);
          };
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        isRecording = true;
        voiceBtn.classList.add('recording');
        voiceBtn.title = 'اضغط للإيقاف وإرسال التسجيل';
      } catch (err) {
        alert('تعذر الوصول إلى الميكروفون: ' + err.message);
      }
    } else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      isRecording = false;
      voiceBtn.classList.remove('recording');
      voiceBtn.title = 'تحدث بصوتك أو سجل تلاوتك';
    }
  }

  async function handleVoiceSubmission(base64Audio) {
    const container = document.getElementById('geminiMessagesContainer');
    const userMsgEl = document.createElement('div');
    userMsgEl.className = 'gemini-msg user';
    userMsgEl.textContent = '🎙️ [تسجيل صوتي / تلاوة أُرسلت]';
    container.appendChild(userMsgEl);

    const botMsgEl = document.createElement('div');
    botMsgEl.className = 'gemini-msg model';
    botMsgEl.innerHTML = '<em>جاري الاستماع للتسجيل وتحليله صوتياً عبر Gemini...</em>';
    container.appendChild(botMsgEl);
    container.scrollTop = container.scrollHeight;

    try {
      const response = await fetch('/api/gemini/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: 'audio/webm',
          prompt: 'استمع للتسجيل الصوتي بدقة، وقدم تصحيحاً للتلاوة وأحكام التجويد وإجابة على أي تساؤل وارد.',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'تعذر تحليل الصوت');
      }

      const replyText = data.text || 'تم فحص التلاوة بنجاح.';
      chatHistory.push({ role: 'user', text: '[تسجيل صوتي]' });
      chatHistory.push({ role: 'model', text: replyText });

      botMsgEl.innerHTML = replyText.replace(/\n/g, '<br>');
    } catch (err) {
      botMsgEl.innerHTML = `<span style="color: #ef4444;">⚠️ خطأ في معالجة الصوت: ${err.message}</span>`;
    }

    container.scrollTop = container.scrollHeight;
  }

  // Auto initialize on DOMContentLoaded or load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGeminiChat);
  } else {
    initGeminiChat();
  }
})();
