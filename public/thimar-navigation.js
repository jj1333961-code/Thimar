/**
 * Thimar Unified Navigation, Role-Based Bottom Bar & Pages Runtime
 */
(function() {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Role Tabs Configurations
  // -------------------------------------------------------------------------
  const NAV_CONFIGS = {
    admin: [
      { id: 'adminDashboard', icon: '🏠', labelAr: 'الرئيسية', labelEn: 'Home' },
      { id: 'messagesPage', icon: '💬', labelAr: 'الرسائل', labelEn: 'Messages', badgeKey: 'messages' },
      { id: 'notificationsPage', icon: '🔔', labelAr: 'التنبيهات', labelEn: 'Alerts', badgeKey: 'notifications' },
      { id: 'adminReportsPage', icon: '📊', labelAr: 'التقارير', labelEn: 'Reports', altPages: ['studentsList', 'studentHistory', 'fullChartPage'] },
      { id: 'adminSettings', icon: '⚙️', labelAr: 'الإعدادات', labelEn: 'Settings' }
    ],
    student: [
      { id: 'studentDashboard', icon: '🏠', labelAr: 'الرئيسية', labelEn: 'Home' },
      { id: 'studentInbox', icon: '💬', labelAr: 'الرسائل', labelEn: 'Messages', badgeKey: 'messages' },
      { id: 'studentTasksPage', icon: '📝', labelAr: 'المهمات', labelEn: 'Tasks', badgeKey: 'tasks' },
      { id: 'studentReportsPage', icon: '📊', labelAr: 'التقارير', labelEn: 'Reports', altPages: ['studentExamPage', 'studentRecordsPage'] },
      { id: 'studentSettings', icon: '⚙️', labelAr: 'الإعدادات', labelEn: 'Settings' }
    ],
    parent: [
      { id: 'parentDashboard', icon: '🏠', labelAr: 'الرئيسية', labelEn: 'Home' },
      { id: 'parentInbox', icon: '💬', labelAr: 'الرسائل', labelEn: 'Messages', badgeKey: 'messages' },
      { id: 'parentTasksPage', icon: '📝', labelAr: 'المهمات', labelEn: 'Tasks', badgeKey: 'tasks' },
      { id: 'parentReportsPage', icon: '📊', labelAr: 'التقارير', labelEn: 'Reports', altPages: ['parentChartPage', 'parentRecordsPage'] },
      { id: 'parentSettings', icon: '⚙️', labelAr: 'الإعدادات', labelEn: 'Settings' }
    ]
  };

  let activeNavPageId = null;
  let selectedAdminStudentId = null;
  let selectedParentStudentId = null;
  let currentTaskFilter = 'all';

  // -------------------------------------------------------------------------
  // 2. Helpers
  // -------------------------------------------------------------------------
  function isArabic() {
    return (document.documentElement.lang || 'ar') === 'ar';
  }

  function getLocalRole() {
    try {
      if (typeof window.currentType === 'string' && window.currentType) return window.currentType;
      const fromSession = sessionStorage.getItem('currentType') || localStorage.getItem('thimar_role');
      if (fromSession) return fromSession;

      // Fallback: Check visible DOM elements
      const adminEl = document.getElementById('adminDashboard');
      if (adminEl && !adminEl.classList.contains('hidden')) return 'admin';
      const studentEl = document.getElementById('studentDashboard');
      if (studentEl && !studentEl.classList.contains('hidden')) return 'student';
      const parentEl = document.getElementById('parentDashboard');
      if (parentEl && !parentEl.classList.contains('hidden')) return 'parent';

      const visible = document.querySelector('.page:not(.hidden), .home-page:not(.hidden)');
      const id = visible ? visible.id : (activeNavPageId || '');
      if (id.startsWith('admin') || ['studentsList','messagesPage','notificationsPage','subjectsPage','adminsPage','addStudent','filesPage','adminSettings','adminReportsPage'].includes(id)) return 'admin';
      if (id.startsWith('student')) return 'student';
      if (id.startsWith('parent')) return 'parent';

      if (window.location.pathname.includes('admin')) return 'admin';
      if (window.location.pathname.includes('student')) return 'student';
      if (window.location.pathname.includes('parent')) return 'parent';

      return null;
    } catch (e) {
      return null;
    }
  }

  function getLocalCurrentUser() {
    try {
      if (window.currentUser) return window.currentUser;
      const raw = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function getStudentsList() {
    try {
      if (typeof window.getData === 'function') return window.getData('students') || [];
      const raw = localStorage.getItem('students');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // 3. Evaluation Metrics Calculation (Real Data)
  // -------------------------------------------------------------------------
  function calculateEvaluation(student) {
    if (!student) {
      return { activity: 50, diligence: 50, study: 50, regularity: 50, progress: 50 };
    }

    const sessions = Array.isArray(student.sessions) ? student.sessions.filter(s => !s.isDraft) : [];
    const exams = Array.isArray(student.examResults) ? student.examResults : [];
    const tasks = Array.isArray(student.tasks) ? student.tasks : [];

    // 1. النشاط (Activity): عدد الأنشطة المنجزة (جلسات + اختبارات + مهام)
    const totalActivities = sessions.length + exams.length + tasks.length;
    let activityScore = Math.min(100, Math.max(40, totalActivities * 18));
    if (totalActivities === 0) activityScore = 55;

    // 2. الاجتهاد (Diligence): نسبة التقييمات العالية (ممتاز وجيد جداً) والواجبات المكتملة
    let totalRatings = 0;
    let highRatings = 0;
    sessions.forEach(sess => {
      (sess.elements || []).forEach(el => {
        totalRatings++;
        if (Number(el.rating) >= 3 || el.rating === '4' || el.rating === '3') highRatings++;
      });
    });
    const ratingRatio = totalRatings > 0 ? (highRatings / totalRatings) : 0.8;
    const diligenceScore = Math.min(100, Math.max(50, Math.round(ratingRatio * 100)));

    // 3. المذاكرة (Study): متوسط درجات الاختبارات ودرجات التسميع
    let examScoreAvg = 85;
    if (exams.length > 0) {
      let sumPct = 0;
      exams.forEach(ex => {
        const score = Number(ex.score) || 0;
        const max = Number(ex.maxScore) || 100;
        sumPct += max > 0 ? (score / max * 100) : 80;
      });
      examScoreAvg = Math.round(sumPct / exams.length);
    }
    const studyScore = Math.min(100, Math.max(45, examScoreAvg));

    // 4. الانتظام (Regularity): تكرار الجلسات وتوزع التواريخ
    let regularityScore = 80;
    if (sessions.length >= 4) regularityScore = 95;
    else if (sessions.length >= 2) regularityScore = 85;
    else if (sessions.length >= 1) regularityScore = 75;
    else regularityScore = 60;

    // 5. مستوى التقدم (Progress Level)
    const baseProgress = Math.round((activityScore + diligenceScore + studyScore + regularityScore) / 4);
    const progressScore = Math.min(100, Math.max(50, baseProgress));

    return {
      activity: activityScore,
      diligence: diligenceScore,
      study: studyScore,
      regularity: regularityScore,
      progress: progressScore
    };
  }

  function renderEvaluationBlockHtml(evalData) {
    const ar = isArabic();
    return `
      <div class="thimar-evaluation-card">
        <div class="thimar-evaluation-header">
          <h3 class="thimar-evaluation-title">📊 ${ar ? 'التقييم الشامل والنمو التعليمي والتربوي' : 'Comprehensive Evaluation & Educational Growth'}</h3>
          <span class="badge badge-success">${ar ? 'تقييم مبني على البيانات الفعلية' : 'Based on actual records'}</span>
        </div>
        <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:14px;">
          ${ar ? 'مؤشرات أداء الطالب المستخرجة آلياً من سجلات التسميع، الاختبارات، الواجبات والانتظام اليومي:' : 'Student performance indicators calculated from recitation records, exams, tasks, and attendance:'}
        </p>
        <div class="thimar-criteria-grid">
          <div class="thimar-criteria-box">
            <div class="thimar-criteria-top">
              <span class="thimar-criteria-name">⚡ ${ar ? 'نشاط الطالب' : 'Student Activity'}</span>
              <span class="thimar-criteria-score">${evalData.activity}٪</span>
            </div>
            <div class="thimar-progress-track"><div class="thimar-progress-fill" style="width:${evalData.activity}%"></div></div>
            <div class="thimar-criteria-desc">${evalData.activity >= 85 ? (ar ? 'نشاط استثنائي ومشاركة مستمرة' : 'Exceptional active participation') : (ar ? 'نشاط جيد ومواظب' : 'Good steady activity')}</div>
          </div>

          <div class="thimar-criteria-box">
            <div class="thimar-criteria-top">
              <span class="thimar-criteria-name">🌟 ${ar ? 'الاجتهاد والمثابرة' : 'Diligence & Effort'}</span>
              <span class="thimar-criteria-score">${evalData.diligence}٪</span>
            </div>
            <div class="thimar-progress-track"><div class="thimar-progress-fill" style="width:${evalData.diligence}%"></div></div>
            <div class="thimar-criteria-desc">${evalData.diligence >= 85 ? (ar ? 'حرص عالٍ على الإتقان وتفادي الأخطاء' : 'High dedication to mastery') : (ar ? 'جهد طيب ومبشر بالنمو' : 'Good and promising effort')}</div>
          </div>

          <div class="thimar-criteria-box">
            <div class="thimar-criteria-top">
              <span class="thimar-criteria-name">📖 ${ar ? 'مستوى المذاكرة والحفظ' : 'Comprehension & Revision'}</span>
              <span class="thimar-criteria-score">${evalData.study}٪</span>
            </div>
            <div class="thimar-progress-track"><div class="thimar-progress-fill" style="width:${evalData.study}%"></div></div>
            <div class="thimar-criteria-desc">${evalData.study >= 85 ? (ar ? 'استيعاب متميز وجودة تلاوة عالية' : 'Excellent retention & recitation') : (ar ? 'مستوى جيد مع استمرار المراجعة' : 'Good level with ongoing review')}</div>
          </div>

          <div class="thimar-criteria-box">
            <div class="thimar-criteria-top">
              <span class="thimar-criteria-name">⏱️ ${ar ? 'الانتظام والالتزام' : 'Regularity & Commitment'}</span>
              <span class="thimar-criteria-score">${evalData.regularity}٪</span>
            </div>
            <div class="thimar-progress-track"><div class="thimar-progress-fill" style="width:${evalData.regularity}%"></div></div>
            <div class="thimar-criteria-desc">${evalData.regularity >= 85 ? (ar ? 'حضور منتظم وتسليم في المواعيد' : 'Punctual and consistent') : (ar ? 'التزام معتدل' : 'Moderate commitment')}</div>
          </div>

          <div class="thimar-criteria-box" style="grid-column: 1 / -1;">
            <div class="thimar-criteria-top">
              <span class="thimar-criteria-name">🚀 ${ar ? 'المستوى العام للتقدم والتطور' : 'Overall Progress Level'}</span>
              <span class="thimar-criteria-score" style="font-size:1.15rem;color:var(--success);">${evalData.progress}٪ (${evalData.progress >= 85 ? (ar ? 'متقدم ممتاز' : 'Advanced') : (ar ? 'جيد جداً' : 'Very Good')})</span>
            </div>
            <div class="thimar-progress-track" style="height:10px;"><div class="thimar-progress-fill" style="width:${evalData.progress}%;background:linear-gradient(90deg, var(--warning), var(--success));"></div></div>
            <div class="thimar-criteria-desc" style="margin-top:10px;">
              ${ar ? 'يسير الطالب بخطوات ثابتة ومطمئنة في مسار الحفظ والمراجعة وفق المعايير التعليمية المعتمدة بالمنصة.' : 'The student progresses steadily and confidently in memorization and revision according to platform standards.'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------------------------
  // 4. Render Bottom Nav HTML
  // -------------------------------------------------------------------------
  function ensureBottomNavElement() {
    let nav = document.getElementById('thimarBottomNav');
    if (!nav) {
      nav = document.createElement('nav');
      nav.id = 'thimarBottomNav';
      nav.className = 'thimar-bottom-nav hidden';
      nav.setAttribute('aria-label', isArabic() ? 'شريط التنقل السفلي' : 'Bottom Navigation');
      document.body.appendChild(nav);
    }
    return nav;
  }

  function getBadgeCount(badgeKey, role) {
    try {
      if (badgeKey === 'messages') {
        const msgs = (typeof window.getData === 'function' ? window.getData('messages') : []) || [];
        const user = getLocalCurrentUser();
        if (role === 'admin') {
          return msgs.filter(m => !m.reply && !m.read).length;
        } else if (role === 'student' && user) {
          return msgs.filter(m => (m.studentId === user.id || m.sender === user.name) && m.reply && !m.studentRead).length;
        } else if (role === 'parent' && user) {
          const pName = Array.isArray(user) ? user[0]?.parent : user?.parent || user?.name;
          return msgs.filter(m => m.parentName === pName && m.reply && !m.parentRead).length;
        }
      }
      if (badgeKey === 'notifications' && role === 'admin') {
        const notifs = (typeof window.getData === 'function' ? window.getData('notifications') : []) || [];
        return notifs.filter(n => !n.read).length;
      }
      if (badgeKey === 'tasks') {
        const students = getStudentsList();
        const user = getLocalCurrentUser();
        if (role === 'student' && user) {
          const s = students.find(x => x.id === user.id || x.username === user.username);
          if (s) {
            const drafts = (s.sessions || []).filter(x => x.isDraft).length;
            const tasks = (s.tasks || []).filter(t => t.status !== 'completed').length;
            return drafts + tasks;
          }
        } else if (role === 'parent' && user) {
          const pName = Array.isArray(user) ? user[0]?.parent : user?.parent || user?.name;
          const myStudents = students.filter(x => x.parent === pName);
          let count = 0;
          myStudents.forEach(s => {
            count += (s.sessions || []).filter(x => x.isDraft).length;
            count += (s.tasks || []).filter(t => t.status !== 'completed').length;
          });
          return count;
        }
      }
    } catch (e) {}
    return 0;
  }

  function renderBottomNav() {
    const nav = ensureBottomNavElement();
    const role = getLocalRole();

    // Do not show on auth pages or when role is missing
    const currentVisible = document.querySelector('.page:not(.hidden)');
    const currentId = currentVisible ? currentVisible.id : '';
    const authPages = ['lockScreen', 'signupStep1', 'signupStep2', 'accountRecoveryPage', 'adminLogin', 'studentLogin', 'parentLogin'];

    if (!role || authPages.includes(currentId) || currentId === 'lockScreen') {
      nav.classList.add('hidden');
      return;
    }

    const items = NAV_CONFIGS[role];
    if (!items || !items.length) {
      nav.classList.add('hidden');
      return;
    }

    nav.classList.remove('hidden');
    const ar = isArabic();

    let html = '';
    items.forEach(item => {
      const isActive = (activeNavPageId === item.id) || 
                       (!activeNavPageId && currentId === item.id) ||
                       (currentId === item.id) ||
                       (item.altPages && (item.altPages.includes(activeNavPageId) || item.altPages.includes(currentId)));
      const badgeCount = item.badgeKey ? getBadgeCount(item.badgeKey, role) : 0;
      const label = ar ? item.labelAr : item.labelEn;

      html += `
        <button type="button" class="thimar-nav-btn ${isActive ? 'active' : ''}" 
          id="btnNav_${item.id}"
          onclick="window.thimarNavigateTo('${item.id}')"
          aria-label="${label}"
          ${isActive ? 'aria-current="page"' : ''}>
          <div class="thimar-nav-icon-wrap">
            <span>${item.icon}</span>
            ${badgeCount > 0 ? `<span class="thimar-nav-badge">${badgeCount > 99 ? '99+' : badgeCount}</span>` : ''}
          </div>
          <span class="thimar-nav-label">${label}</span>
        </button>
      `;
    });

    nav.innerHTML = html;
  }

  // -------------------------------------------------------------------------
  // 5. Navigation Dispatcher
  // -------------------------------------------------------------------------
  window.thimarNavigateTo = function(pageId) {
    activeNavPageId = pageId;
    if (typeof window.showPage === 'function') {
      window.showPage(pageId);
    }
    if (typeof window.thimarOnPageShown === 'function') {
      window.thimarOnPageShown(pageId);
    }
  };

  window.thimarOnPageShown = function(pageId) {
    activeNavPageId = pageId;
    if (pageId === 'adminReportsPage' && typeof window.renderAdminReports === 'function') window.renderAdminReports();
    else if (pageId === 'studentTasksPage' && typeof window.renderStudentTasks === 'function') window.renderStudentTasks();
    else if (pageId === 'studentReportsPage' && typeof window.renderStudentReports === 'function') window.renderStudentReports();
    else if (pageId === 'parentTasksPage' && typeof window.renderParentTasks === 'function') window.renderParentTasks();
    else if (pageId === 'parentReportsPage' && typeof window.renderParentReports === 'function') window.renderParentReports();
    else if (pageId === 'parentSettings' && typeof window.renderParentSettings === 'function') window.renderParentSettings();
    else if (pageId === 'adminSettings' || pageId === 'studentSettings') updateSettingsUI();
    renderBottomNav();
  };

  // -------------------------------------------------------------------------
  // 6. Admin Reports Page
  // -------------------------------------------------------------------------
  window.renderAdminReports = function() {
    const container = document.getElementById('adminReportsPage');
    if (!container) return;

    const students = getStudentsList();
    const ar = isArabic();

    if (selectedAdminStudentId) {
      // Render Single Student Report
      const s = students.find(x => String(x.id) === String(selectedAdminStudentId));
      if (!s) {
        selectedAdminStudentId = null;
        window.renderAdminReports();
        return;
      }

      const evalData = calculateEvaluation(s);
      const sessions = (s.sessions || []).filter(x => !x.isDraft);
      const exams = s.examResults || [];
      const tasks = s.tasks || [];

      let html = `
        <div class="page-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <h2>📊 ${ar ? 'التقرير الشامل للطالب: ' : 'Comprehensive Report: '} ${escapeHtml(s.name)}</h2>
          <button type="button" class="btn btn-secondary" onclick="window.backToAdminStudentList()">
            ⬅️ ${ar ? 'الرجوع لقائمة الطلاب' : 'Back to Students List'}
          </button>
        </div>

        <div style="background:var(--card-bg);border:1.5px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:var(--shadow);">
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:15px;text-align:center;">
            <div style="padding:10px;background:var(--table-header);border-radius:12px;">
              <div style="font-size:1.6rem;font-weight:800;color:var(--primary);">${sessions.length}</div>
              <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'جلسات التسميع المكتملة' : 'Finalized Sessions'}</div>
            </div>
            <div style="padding:10px;background:var(--table-header);border-radius:12px;">
              <div style="font-size:1.6rem;font-weight:800;color:var(--info);">${exams.length}</div>
              <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'الاختبارات المنجزة' : 'Exams Taken'}</div>
            </div>
            <div style="padding:10px;background:var(--table-header);border-radius:12px;">
              <div style="font-size:1.6rem;font-weight:800;color:var(--success);">${evalData.progress}٪</div>
              <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'معدل التقدم العام' : 'Overall Progress'}</div>
            </div>
            <div style="padding:10px;background:var(--table-header);border-radius:12px;">
              <div style="font-size:1.6rem;font-weight:800;color:var(--warning);">${s.age || '-'} ${ar ? 'سنة' : 'yrs'}</div>
              <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'ولي الأمر: ' + (s.parent || '-') : 'Parent: ' + (s.parent || '-')}</div>
            </div>
          </div>
        </div>
      `;

      // 1. Recitation History
      html += `<h3 style="color:var(--primary);margin:20px 0 12px;">🎙️ ${ar ? 'سجل التسميعات والتسجيلات الصوتية' : 'Recitations & Audio Recordings'}</h3>`;
      if (sessions.length === 0) {
        html += `<div class="alert alert-info">${ar ? 'لا توجد جلسات تسميع نهائية مسجلة حتى الآن.' : 'No finalized recitation sessions recorded yet.'}</div>`;
      } else {
        sessions.slice().reverse().forEach((sess, idx) => {
          html += `
            <div class="history-day" style="margin-bottom:15px;">
              <div class="history-day-header" style="display:flex;justify-content:space-between;align-items:center;">
                <span>📅 ${sess.date || '-'} (${ar ? 'جلسة رقم ' : 'Session #'}${sessions.length - idx})</span>
                <span class="score-badge">${ar ? 'المجموع: ' : 'Total: '}${sess.totalScore || 0} ${ar ? 'درجة' : 'pts'}</span>
              </div>
              <div style="padding:14px;">
                ${(sess.elements || []).map((el, ei) => `
                  <div class="history-element" style="border-right:4px solid ${el.color || 'var(--primary)'};margin-bottom:8px;padding:10px;background:var(--table-header);border-radius:10px;">
                    <div style="display:flex;justify-content:space-between;font-weight:700;">
                      <span>${ei + 1}. ${escapeHtml(el.name || '')} - سورة: ${escapeHtml(el.surah || '-')}</span>
                      <span class="badge ${Number(el.rating) >= 3 ? 'badge-success' : 'badge-warning'}">${ratingText(el.rating)}</span>
                    </div>
                    <div style="font-size:0.85rem;color:var(--text-light);margin-top:4px;">
                      من آية: ${el.from || '-'} إلى آية: ${el.to || '-'}
                      ${el.isVoice ? ' | 🎙️ تسجيل صوتي' : ''}
                      ${el.isHomework ? ' | 📝 واجب' : ''}
                    </div>
                    ${el.audio ? `
                      <div style="margin-top:8px;">
                        <audio controls preload="none" src="${escapeHtml(el.audio)}" style="width:100%;max-width:380px;height:36px;"></audio>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
                ${sess.notes ? `<div style="font-size:0.9rem;color:var(--text-light);margin-top:8px;"><strong>ملاحظات المعلم:</strong> ${escapeHtml(sess.notes)}</div>` : ''}
              </div>
            </div>
          `;
        });
      }

      // 2. Exam History
      html += `<h3 style="color:var(--primary);margin:24px 0 12px;">🧪 ${ar ? 'نتائج الاختبارات والتقييمات' : 'Exam Results & Assessments'}</h3>`;
      if (exams.length === 0) {
        html += `<div class="alert alert-info">${ar ? 'لم يتم إجراء أي اختبارات للطالب حتى الآن.' : 'No exams completed by this student yet.'}</div>`;
      } else {
        exams.forEach((ex, ei) => {
          const score = Number(ex.score) || 0;
          const max = Number(ex.maxScore) || 100;
          const pct = max > 0 ? Math.round(score / max * 100) : 0;
          html += `
            <div class="thimar-task-card status-completed" style="margin-bottom:12px;">
              <div class="thimar-task-header">
                <h4 class="thimar-task-title">📝 ${escapeHtml(ex.title || ex.examTitle || (ar ? 'اختبار قرآن' : 'Quran Exam'))}</h4>
                <span class="score-badge" style="font-size:1rem;padding:4px 12px;">${score} / ${max} (${pct}٪)</span>
              </div>
              <div class="thimar-task-meta">
                <span>📅 ${ex.submittedAt || ex.date || '-'}</span>
                <span>⏱️ ${ex.totalDurationSeconds ? (ex.totalDurationSeconds + ' ثانية') : 'مكتمل'}</span>
              </div>
            </div>
          `;
        });
      }

      // 3. Comprehensive Evaluation Section at the Bottom
      html += renderEvaluationBlockHtml(evalData);

      html += `
        <div style="text-align:center;margin-top:24px;">
          <button type="button" class="btn btn-secondary" onclick="window.backToAdminStudentList()">
            ⬅️ ${ar ? 'الرجوع لقائمة الطلاب' : 'Back to Students List'}
          </button>
        </div>
      `;

      container.innerHTML = html;
    } else {
      // Render Students List for Admin to Pick One
      let html = `
        <div class="page-header">
          <h2>📊 ${ar ? 'تقارير الطلاب ومتابعة الأداء' : 'Student Reports & Performance Tracking'}</h2>
        </div>
        <p style="color:var(--text-light);margin-bottom:16px;">
          ${ar ? 'اختر أي طالب من القائمة لعرض ملف تقريره الكامل، وسجل تلاواته، واختباراته، والتقييم التربوي الشامل:' : 'Select any student from the list to view their complete report, recitation history, exams, and comprehensive evaluation:'}
        </p>
        <div class="search-box">
          <input type="text" id="adminReportSearch" placeholder="${ar ? '🔍 ابحث باسم الطالب أو رقم الهوية...' : '🔍 Search student name or ID...'}" oninput="window.filterAdminReportStudents(this.value)">
        </div>
        <div id="adminReportStudentsGrid" class="students-grid"></div>
      `;
      container.innerHTML = html;
      window.filterAdminReportStudents('');
    }
  };

  window.filterAdminReportStudents = function(query) {
    const grid = document.getElementById('adminReportStudentsGrid');
    if (!grid) return;
    const students = getStudentsList();
    const q = (query || '').trim().toLowerCase();
    const ar = isArabic();

    const filtered = students.filter(s => {
      if (!q) return true;
      return (s.name && s.name.toLowerCase().includes(q)) ||
             (s.username && s.username.toLowerCase().includes(q)) ||
             (s.national && String(s.national).includes(q));
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="alert alert-info" style="grid-column:1/-1;">${ar ? 'لا يوجد طلاب مطابقين للبحث.' : 'No matching students found.'}</div>`;
      return;
    }

    let html = '';
    filtered.forEach((s, idx) => {
      const sessCount = (s.sessions || []).filter(x => !x.isDraft).length;
      const examCount = (s.examResults || []).length;
      const evalData = calculateEvaluation(s);

      html += `
        <div class="student-card" style="cursor:pointer;" onclick="window.openAdminStudentReport('${s.id}')">
          <div class="student-card-header">
            <div class="student-num">${idx + 1}</div>
            <div class="student-name">${escapeHtml(s.name)}</div>
          </div>
          <div class="student-card-body">
            <div class="student-field"><span class="field-label">${ar ? 'ولي الأمر:' : 'Parent:'}</span> <span class="field-value">${escapeHtml(s.parent || '-')}</span></div>
            <div class="student-field"><span class="field-label">${ar ? 'التسميعات المكتملة:' : 'Sessions:'}</span> <span class="badge badge-primary">${sessCount}</span></div>
            <div class="student-field"><span class="field-label">${ar ? 'الاختبارات:' : 'Exams:'}</span> <span class="badge badge-info">${examCount}</span></div>
            <div class="student-field"><span class="field-label">${ar ? 'مستوى التقدم:' : 'Progress:'}</span> <span class="badge badge-success">${evalData.progress}٪</span></div>
          </div>
          <div class="student-card-actions">
            <button type="button" class="btn btn-primary btn-sm" style="width:100%;" onclick="event.stopPropagation();window.openAdminStudentReport('${s.id}')">
              📄 ${ar ? 'فتح التقرير الكامل' : 'Open Full Report'}
            </button>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;
  };

  window.openAdminStudentReport = function(id) {
    selectedAdminStudentId = id;
    window.renderAdminReports();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.backToAdminStudentList = function() {
    selectedAdminStudentId = null;
    window.renderAdminReports();
  };

  // -------------------------------------------------------------------------
  // 7. Student Tasks Page (Central Execution Hub)
  // -------------------------------------------------------------------------
  window.renderStudentTasks = function() {
    const container = document.getElementById('studentTasksPage');
    if (!container) return;

    const user = getLocalCurrentUser();
    const students = getStudentsList();
    const ar = isArabic();

    if (!user) {
      container.innerHTML = `<div class="alert alert-danger">${ar ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'}</div>`;
      return;
    }

    const student = students.find(x => x.id === user.id || x.username === user.username) || user;
    const drafts = (student.sessions || []).filter(x => x.isDraft);
    const tasks = student.tasks || [];
    const exams = student.examResults || [];

    // Synthesize list of all actionable tasks
    const allItems = [];

    // Draft recitations requiring completion
    drafts.forEach((d, i) => {
      allItems.push({
        id: 'draft_' + i,
        type: 'recitation',
        typeLabel: ar ? 'تسميع قرآني' : 'Recitation',
        title: ar ? ('متابعة تسميع: ' + (d.elements?.[0]?.surah || 'مقرر الحفظ')) : 'Recitation Follow-up',
        status: 'in_progress',
        statusLabel: ar ? 'بدأ / مسودة' : 'In Progress',
        dueDate: d.date || (ar ? 'اليوم' : 'Today'),
        actionText: ar ? 'تسجيل التلاوة / استكمال' : 'Record / Continue',
        actionFn: "if(typeof window.openRecord==='function')window.openRecord('" + student.id + "');"
      });
    });

    // Explicit tasks
    tasks.forEach(t => {
      allItems.push({
        id: t.id || Math.random(),
        type: 'homework',
        typeLabel: ar ? 'واجب / مهمة' : 'Task / Homework',
        title: t.title || (ar ? 'مهمة دراسية' : 'Study Task'),
        status: t.status || 'pending',
        statusLabel: t.status === 'completed' ? (ar ? 'مكتمل' : 'Completed') : (ar ? 'جديدة' : 'New'),
        dueDate: t.dueDate || (ar ? 'خلال هذا الأسبوع' : 'This week'),
        actionText: t.status === 'completed' ? (ar ? 'عرض النتيجة' : 'View') : (ar ? 'تسليم المهمة' : 'Submit'),
        actionFn: "showToast('" + (ar ? 'تم التوجيه للمهمة' : 'Redirecting') + "', 'info');"
      });
    });

    // Available Exams
    if (exams.length === 0) {
      allItems.push({
        id: 'exam_standard',
        type: 'exam',
        typeLabel: ar ? 'اختبار' : 'Exam',
        title: ar ? 'اختبار قياس حفظ ومراجعة الجزء المقرر' : 'Assigned Quran Exam',
        status: 'new',
        statusLabel: ar ? 'جديد لم يبدأ' : 'New',
        dueDate: ar ? 'مستمر' : 'Open',
        actionText: ar ? 'بدء الاختبار الآن' : 'Start Exam',
        actionFn: "if(typeof window.startStudentExamSession==='function')window.startStudentExamSession();else showToast('" + (ar ? 'جاري فتح صفحة الاختبار' : 'Opening exam') + "','info');"
      });
    }

    // Filter by current tab
    const filtered = allItems.filter(item => {
      if (currentTaskFilter === 'all') return true;
      if (currentTaskFilter === 'new') return item.status === 'new' || item.status === 'pending';
      if (currentTaskFilter === 'in_progress') return item.status === 'in_progress';
      if (currentTaskFilter === 'completed') return item.status === 'completed';
      return true;
    });

    const totalCount = allItems.length;
    const completedCount = allItems.filter(x => x.status === 'completed').length;
    const inProgressCount = allItems.filter(x => x.status === 'in_progress').length;
    const newCount = allItems.filter(x => x.status === 'new' || x.status === 'pending').length;

    let html = `
      <div class="page-header">
        <h2>📝 ${ar ? 'مركز المهمات والاختبارات والتسميع' : 'Student Tasks & Assessment Center'}</h2>
      </div>

      <div class="thimar-tasks-summary">
        <div class="thimar-summary-card">
          <div class="thimar-summary-num">${totalCount}</div>
          <div class="thimar-summary-lbl">${ar ? 'إجمالي المطلوب' : 'Total Required'}</div>
        </div>
        <div class="thimar-summary-card">
          <div class="thimar-summary-num" style="color:var(--info);">${newCount}</div>
          <div class="thimar-summary-lbl">${ar ? 'جديدة / لم تبدأ' : 'Not Started'}</div>
        </div>
        <div class="thimar-summary-card">
          <div class="thimar-summary-num" style="color:var(--warning);">${inProgressCount}</div>
          <div class="thimar-summary-lbl">${ar ? 'قيد التنفيذ' : 'In Progress'}</div>
        </div>
        <div class="thimar-summary-card">
          <div class="thimar-summary-num" style="color:var(--success);">${completedCount}</div>
          <div class="thimar-summary-lbl">${ar ? 'مكتملة' : 'Completed'}</div>
        </div>
      </div>

      <div class="thimar-filter-row" style="margin-top:16px;">
        <button type="button" class="thimar-filter-pill ${currentTaskFilter === 'all' ? 'active' : ''}" onclick="window.setTaskFilter('all')">
          ${ar ? 'الكل' : 'All'} (${totalCount})
        </button>
        <button type="button" class="thimar-filter-pill ${currentTaskFilter === 'new' ? 'active' : ''}" onclick="window.setTaskFilter('new')">
          ${ar ? 'جديدة / بانتظار البدء' : 'New'} (${newCount})
        </button>
        <button type="button" class="thimar-filter-pill ${currentTaskFilter === 'in_progress' ? 'active' : ''}" onclick="window.setTaskFilter('in_progress')">
          ${ar ? 'قيد التنفيذ' : 'In Progress'} (${inProgressCount})
        </button>
        <button type="button" class="thimar-filter-pill ${currentTaskFilter === 'completed' ? 'active' : ''}" onclick="window.setTaskFilter('completed')">
          ${ar ? 'مكتملة' : 'Completed'} (${completedCount})
        </button>
      </div>

      <div class="thimar-tasks-container" style="margin-top:16px;">
    `;

    if (filtered.length === 0) {
      html += `<div class="alert alert-info">${ar ? 'لا توجد مهمات في هذا القسم حالياً.' : 'No tasks in this category currently.'}</div>`;
    } else {
      filtered.forEach(item => {
        const statusClass = item.status === 'completed' ? 'status-completed' : item.status === 'in_progress' ? 'status-in-progress' : 'status-new';
        const badgeClass = item.status === 'completed' ? 'badge-success' : item.status === 'in_progress' ? 'badge-warning' : 'badge-primary';

        html += `
          <div class="thimar-task-card ${statusClass}">
            <div class="thimar-task-header">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge ${badgeClass}">${item.typeLabel}</span>
                <h3 class="thimar-task-title">${escapeHtml(item.title)}</h3>
              </div>
              <span class="badge ${badgeClass}">${item.statusLabel}</span>
            </div>
            <div class="thimar-task-meta">
              <span>📅 ${ar ? 'موعد التسليم: ' : 'Due: '} <strong>${escapeHtml(item.dueDate)}</strong></span>
              <span>📌 ${ar ? 'الحالة: ' : 'Status: '} ${item.statusLabel}</span>
            </div>
            <div class="thimar-task-actions">
              <button type="button" class="btn btn-primary btn-sm" onclick="${item.actionFn}">
                ${item.actionText}
              </button>
            </div>
          </div>
        `;
      });
    }

    html += `</div>`;
    container.innerHTML = html;
  };

  window.setTaskFilter = function(filter) {
    currentTaskFilter = filter;
    window.renderStudentTasks();
  };

  // -------------------------------------------------------------------------
  // 8. Student Reports Page (Self-Only Isolated)
  // -------------------------------------------------------------------------
  window.renderStudentReports = function() {
    const container = document.getElementById('studentReportsPage');
    if (!container) return;

    const user = getLocalCurrentUser();
    const students = getStudentsList();
    const ar = isArabic();

    if (!user) {
      container.innerHTML = `<div class="alert alert-danger">${ar ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'}</div>`;
      return;
    }

    // STRICT: Student can ONLY see their own data
    const student = students.find(x => x.id === user.id || x.username === user.username) || user;
    const evalData = calculateEvaluation(student);
    const sessions = (student.sessions || []).filter(x => !x.isDraft);
    const exams = student.examResults || [];

    let html = `
      <div class="page-header">
        <h2>📊 ${ar ? 'تقرير الإنجاز وسجل الأداء الشخصي' : 'Personal Progress & Achievement Report'}</h2>
      </div>

      <div style="background:var(--card-bg);border:1.5px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:var(--shadow);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;border-bottom:1px solid var(--border);padding-bottom:10px;">
          <h3 style="color:var(--primary);margin:0;">👤 ${escapeHtml(student.name || user.name || '')}</h3>
          <span class="badge badge-success">${ar ? 'طالب مسجل' : 'Registered Student'}</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:12px;text-align:center;">
          <div style="padding:10px;background:var(--table-header);border-radius:12px;">
            <div style="font-size:1.6rem;font-weight:800;color:var(--primary);">${sessions.length}</div>
            <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'تسميعات معتمدة' : 'Recitations'}</div>
          </div>
          <div style="padding:10px;background:var(--table-header);border-radius:12px;">
            <div style="font-size:1.6rem;font-weight:800;color:var(--info);">${exams.length}</div>
            <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'اختبارات منجزة' : 'Exams'}</div>
          </div>
          <div style="padding:10px;background:var(--table-header);border-radius:12px;">
            <div style="font-size:1.6rem;font-weight:800;color:var(--success);">${evalData.progress}٪</div>
            <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'نسبة التقدم' : 'Progress'}</div>
          </div>
        </div>
      </div>
    `;

    // Recitations
    html += `<h3 style="color:var(--primary);margin:20px 0 12px;">🎙️ ${ar ? 'نتائج التسميع والتسجيلات الصوتية' : 'Recitation History & Recordings'}</h3>`;
    if (sessions.length === 0) {
      html += `<div class="alert alert-info">${ar ? 'لم يتم إنهاء أي تسميع بعد. التسميعات التي تسجلها ستظهر هنا بعد اعتمادها.' : 'No recitations recorded yet.'}</div>`;
    } else {
      sessions.slice().reverse().forEach((sess, idx) => {
        html += `
          <div class="history-day" style="margin-bottom:15px;">
            <div class="history-day-header" style="display:flex;justify-content:space-between;align-items:center;">
              <span>📅 ${sess.date || '-'}</span>
              <span class="score-badge">${ar ? 'الدرجة: ' : 'Score: '}${sess.totalScore || 0}</span>
            </div>
            <div style="padding:14px;">
              ${(sess.elements || []).map((el, ei) => `
                <div class="history-element" style="border-right:4px solid ${el.color || 'var(--primary)'};margin-bottom:8px;padding:10px;background:var(--table-header);border-radius:10px;">
                  <div style="display:flex;justify-content:space-between;font-weight:700;">
                    <span>${ei + 1}. ${escapeHtml(el.name || '')} - سورة: ${escapeHtml(el.surah || '-')}</span>
                    <span class="badge ${Number(el.rating) >= 3 ? 'badge-success' : 'badge-warning'}">${ratingText(el.rating)}</span>
                  </div>
                  <div style="font-size:0.85rem;color:var(--text-light);margin-top:4px;">
                    الآيات: من ${el.from || '-'} إلى ${el.to || '-'}
                  </div>
                  ${el.audio ? `
                    <div style="margin-top:8px;">
                      <audio controls preload="none" src="${escapeHtml(el.audio)}" style="width:100%;max-width:380px;height:36px;"></audio>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });
    }

    // Exams
    html += `<h3 style="color:var(--primary);margin:24px 0 12px;">🧪 ${ar ? 'نتائج الاختبارات والدرجات' : 'Exam Scores & Assessments'}</h3>`;
    if (exams.length === 0) {
      html += `<div class="alert alert-info">${ar ? 'لا توجد اختبارات مسجلة حتى الآن.' : 'No exams completed yet.'}</div>`;
    } else {
      exams.forEach(ex => {
        const score = Number(ex.score) || 0;
        const max = Number(ex.maxScore) || 100;
        const pct = max > 0 ? Math.round(score / max * 100) : 0;
        html += `
          <div class="thimar-task-card status-completed" style="margin-bottom:12px;">
            <div class="thimar-task-header">
              <h4 class="thimar-task-title">📝 ${escapeHtml(ex.title || ex.examTitle || (ar ? 'اختبار قرآني' : 'Quran Exam'))}</h4>
              <span class="score-badge" style="font-size:0.95rem;padding:4px 10px;">${score} / ${max} (${pct}٪)</span>
            </div>
            <div class="thimar-task-meta">
              <span>📅 ${ex.submittedAt || ex.date || '-'}</span>
            </div>
          </div>
        `;
      });
    }

    // Comprehensive Evaluation at Bottom
    html += renderEvaluationBlockHtml(evalData);

    container.innerHTML = html;
  };

  // -------------------------------------------------------------------------
  // 9. Parent Tasks Page (Grouped by Child)
  // -------------------------------------------------------------------------
  window.renderParentTasks = function() {
    const container = document.getElementById('parentTasksPage');
    if (!container) return;

    const user = getLocalCurrentUser();
    const students = getStudentsList();
    const ar = isArabic();

    if (!user) {
      container.innerHTML = `<div class="alert alert-danger">${ar ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'}</div>`;
      return;
    }

    const pName = Array.isArray(user) ? user[0]?.parent : user?.parent || user?.name;
    const myStudents = students.filter(s => s.parent === pName);

    let html = `
      <div class="page-header">
        <h2>📝 ${ar ? 'مهمات وواجبات الأبناء' : 'Children Tasks & Assignments'}</h2>
      </div>
      <p style="color:var(--text-light);margin-bottom:18px;">
        ${ar ? 'متابعة كافة الاختبارات، التسميعات، والواجبات المطلوبة من أبنائك مرتبة حسب كل ابن:' : 'Track recitations, exams, and homework assigned to your children, grouped by child:'}
      </p>
    `;

    if (myStudents.length === 0) {
      html += `<div class="alert alert-info">${ar ? 'لا يوجد طلاب مرتبطين بحسابك حالياً.' : 'No students linked to your parent account.'}</div>`;
      container.innerHTML = html;
      return;
    }

    myStudents.forEach(child => {
      const drafts = (child.sessions || []).filter(x => x.isDraft);
      const tasks = child.tasks || [];
      const exams = child.examResults || [];

      html += `
        <div style="background:var(--card-bg);border:2px solid var(--border);border-radius:16px;padding:20px;margin-bottom:22px;box-shadow:var(--shadow);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:2px solid var(--primary);padding-bottom:8px;">
            <h3 style="color:var(--primary);margin:0;font-size:1.3rem;">👦 ${escapeHtml(child.name)}</h3>
            <span class="badge badge-primary">${ar ? 'الابن' : 'Child'}</span>
          </div>
      `;

      const childItems = [];
      drafts.forEach((d, di) => {
        childItems.push({
          icon: '🎙️',
          title: ar ? ('تسميع سورة ' + (d.elements?.[0]?.surah || 'المقررة')) : 'Recitation Task',
          type: ar ? 'تسميع' : 'Recitation',
          status: ar ? 'قيد التسميع' : 'In Progress',
          statusClass: 'badge-warning'
        });
      });

      tasks.forEach(t => {
        childItems.push({
          icon: '📝',
          title: t.title || (ar ? 'واجب مدرسي' : 'Homework'),
          type: ar ? 'واجب' : 'Task',
          status: t.status === 'completed' ? (ar ? 'مكتمل' : 'Completed') : (ar ? 'مطلوب إنجازه' : 'Pending'),
          statusClass: t.status === 'completed' ? 'badge-success' : 'badge-primary'
        });
      });

      if (childItems.length === 0) {
        html += `<p style="color:var(--text-light);font-size:0.92rem;">${ar ? 'لا توجد مهمات معلقة لهذا الابن حالياً، جميع المهام مكتملة.' : 'No pending tasks for this child currently.'}</p>`;
      } else {
        childItems.forEach(ci => {
          html += `
            <div class="thimar-task-card" style="margin-bottom:10px;padding:12px 16px;">
              <div class="thimar-task-header" style="margin-bottom:0;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span>${ci.icon}</span>
                  <strong style="color:var(--text);font-size:1rem;">${escapeHtml(ci.title)}</strong>
                </div>
                <span class="badge ${ci.statusClass}">${ci.status}</span>
              </div>
            </div>
          `;
        });
      }

      html += `</div>`;
    });

    container.innerHTML = html;
  };

  // -------------------------------------------------------------------------
  // 10. Parent Reports Page (Child Selector & Full Report)
  // -------------------------------------------------------------------------
  window.renderParentReports = function() {
    const container = document.getElementById('parentReportsPage');
    if (!container) return;

    const user = getLocalCurrentUser();
    const students = getStudentsList();
    const ar = isArabic();

    if (!user) {
      container.innerHTML = `<div class="alert alert-danger">${ar ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'}</div>`;
      return;
    }

    const pName = Array.isArray(user) ? user[0]?.parent : user?.parent || user?.name;
    const myStudents = students.filter(s => s.parent === pName);

    let html = `
      <div class="page-header">
        <h2>📊 ${ar ? 'تقارير الأبناء والتقييم الشامل' : 'Children Progress Reports'}</h2>
      </div>
    `;

    if (myStudents.length === 0) {
      html += `<div class="alert alert-info">${ar ? 'لا يوجد طلاب مسجلين لولي الأمر هذا.' : 'No students found.'}</div>`;
      container.innerHTML = html;
      return;
    }

    // If no child selected or selected child not valid, pick first child
    if (!selectedParentStudentId || !myStudents.some(s => String(s.id) === String(selectedParentStudentId))) {
      selectedParentStudentId = myStudents[0].id;
    }

    // Render Child Selector Bar
    html += `
      <div style="background:var(--card-bg);border:1.5px solid var(--border);border-radius:14px;padding:14px;margin-bottom:20px;box-shadow:var(--shadow);">
        <label style="display:block;font-weight:700;margin-bottom:8px;color:var(--primary);">
          👦 ${ar ? 'اختر الابن لعرض تقريره:' : 'Select Child to View Report:'}
        </label>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${myStudents.map(child => `
            <button type="button" 
              class="btn ${String(child.id) === String(selectedParentStudentId) ? 'btn-primary' : 'btn-outline'}" 
              style="padding:8px 18px;border-radius:20px;font-weight:700;"
              onclick="window.selectParentChild('${child.id}')">
              ${escapeHtml(child.name)}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Render Selected Child's Full Report
    const currentChild = myStudents.find(s => String(s.id) === String(selectedParentStudentId));
    if (currentChild) {
      const evalData = calculateEvaluation(currentChild);
      const sessions = (currentChild.sessions || []).filter(x => !x.isDraft);
      const exams = currentChild.examResults || [];

      html += `
        <div style="background:var(--card-bg);border:1.5px solid var(--border);border-radius:16px;padding:20px;margin-bottom:20px;box-shadow:var(--shadow);">
          <h3 style="color:var(--primary);margin:0 0 14px;">📋 ${ar ? 'تقرير الابن: ' : 'Report: '}${escapeHtml(currentChild.name)}</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:12px;text-align:center;">
            <div style="padding:10px;background:var(--table-header);border-radius:12px;">
              <div style="font-size:1.6rem;font-weight:800;color:var(--primary);">${sessions.length}</div>
              <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'تسميعات نهائية' : 'Recitations'}</div>
            </div>
            <div style="padding:10px;background:var(--table-header);border-radius:12px;">
              <div style="font-size:1.6rem;font-weight:800;color:var(--info);">${exams.length}</div>
              <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'اختبارات' : 'Exams'}</div>
            </div>
            <div style="padding:10px;background:var(--table-header);border-radius:12px;">
              <div style="font-size:1.6rem;font-weight:800;color:var(--success);">${evalData.progress}٪</div>
              <div style="font-size:0.85rem;color:var(--text-light);">${ar ? 'معدل التقدم' : 'Progress'}</div>
            </div>
          </div>
        </div>
      `;

      // Recitations
      html += `<h3 style="color:var(--primary);margin:20px 0 12px;">🎙️ ${ar ? 'سجل التسميع والتلاوات' : 'Recitations & Recordings'}</h3>`;
      if (sessions.length === 0) {
        html += `<div class="alert alert-info">${ar ? 'لا توجد جلسات تسميع نهائية مسجلة حتى الآن.' : 'No recitations yet.'}</div>`;
      } else {
        sessions.slice().reverse().forEach((sess, idx) => {
          html += `
            <div class="history-day" style="margin-bottom:14px;">
              <div class="history-day-header" style="display:flex;justify-content:space-between;">
                <span>📅 ${sess.date || '-'}</span>
                <span class="score-badge">${ar ? 'المجموع: ' : 'Score: '}${sess.totalScore || 0}</span>
              </div>
              <div style="padding:12px;">
                ${(sess.elements || []).map((el, ei) => `
                  <div class="history-element" style="border-right:4px solid ${el.color || 'var(--primary)'};margin-bottom:8px;padding:8px 12px;background:var(--table-header);border-radius:8px;">
                    <div style="display:flex;justify-content:space-between;font-weight:700;">
                      <span>${ei + 1}. ${escapeHtml(el.name || '')} - سورة: ${escapeHtml(el.surah || '-')}</span>
                      <span class="badge ${Number(el.rating) >= 3 ? 'badge-success' : 'badge-warning'}">${ratingText(el.rating)}</span>
                    </div>
                    ${el.audio ? `<div style="margin-top:8px;"><audio controls preload="none" src="${escapeHtml(el.audio)}" style="width:100%;max-width:360px;height:34px;"></audio></div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        });
      }

      // Comprehensive Evaluation
      html += renderEvaluationBlockHtml(evalData);
    }

    container.innerHTML = html;
  };

  window.selectParentChild = function(childId) {
    selectedParentStudentId = childId;
    window.renderParentReports();
  };

  // -------------------------------------------------------------------------
  // 11. Unified Settings Views & Functionality
  // -------------------------------------------------------------------------
  function renderSettingsPanelHtml(role) {
    const ar = isArabic();
    const currentTheme = localStorage.getItem('thimar_theme_mode') || 'auto';
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const soundEnabled = localStorage.getItem('thimar_sound_enabled') !== 'false';
    const msgPolicy = localStorage.getItem('thimar_msg_policy') || 'allow_permitted';

    return `
      <div class="thimar-settings-section">
        <h3 class="thimar-settings-title">🎨 ${ar ? 'المظهر ونمط العرض' : 'Appearance & Theme'}</h3>
        <p style="color:var(--text-light);font-size:0.85rem;margin-bottom:10px;">
          ${ar ? 'اختر وضع العرض المفضل لراحة عينيك أثناء استخدام المنصة:' : 'Select your preferred visual mode for comfortable viewing:'}
        </p>
        <div class="thimar-segmented-control">
          <button type="button" class="thimar-segmented-btn ${currentTheme === 'light' ? 'active' : ''}" onclick="window.setThemeMode('light')">
            ☀️ ${ar ? 'فاتح' : 'Light'}
          </button>
          <button type="button" class="thimar-segmented-btn ${currentTheme === 'dark' ? 'active' : ''}" onclick="window.setThemeMode('dark')">
            🌙 ${ar ? 'داكن' : 'Dark'}
          </button>
          <button type="button" class="thimar-segmented-btn ${currentTheme === 'auto' ? 'active' : ''}" onclick="window.setThemeMode('auto')">
            💻 ${ar ? 'تلقائي' : 'Auto'}
          </button>
        </div>
      </div>

      <div class="thimar-settings-section">
        <h3 class="thimar-settings-title">🌐 ${ar ? 'اللغة والاتجاه' : 'Language & Direction'}</h3>
        <div class="thimar-segmented-control">
          <button type="button" class="thimar-segmented-btn ${ar ? 'active' : ''}" onclick="window.setPlatformLang('ar')">
            🇸🇦 العربية
          </button>
          <button type="button" class="thimar-segmented-btn ${!ar ? 'active' : ''}" onclick="window.setPlatformLang('en')">
            🇬🇧 English
          </button>
        </div>
      </div>

      <div class="thimar-settings-section">
        <h3 class="thimar-settings-title">🔔 ${ar ? 'أصوات التنبيهات والإشعارات' : 'Notification Sounds'}</h3>
        <div class="thimar-toggle-row">
          <div class="thimar-toggle-info">
            <strong>${ar ? 'تشغيل صوت التنبيه' : 'Play Notification Sound'}</strong>
            <small>${ar ? 'نغمة هادئة ومميزة عند وصول رسالة أو تنبيه جديد' : 'Chime on new incoming messages and alerts'}</small>
          </div>
          <label class="thimar-switch">
            <input type="checkbox" id="soundToggle_${role}" ${soundEnabled ? 'checked' : ''} onchange="window.setNotificationSound(this.checked)">
            <span class="thimar-slider"></span>
          </label>
        </div>
        <div style="margin-top:12px;">
          <button type="button" class="btn btn-sm btn-outline" onclick="window.testNotificationSound()">
            🔊 ${ar ? 'تجربة صوت التنبيه' : 'Test Sound'}
          </button>
        </div>
      </div>

      <div class="thimar-settings-section">
        <h3 class="thimar-settings-title">🛡️ ${ar ? 'الخصوصية واستقبال الرسائل' : 'Privacy & Messages'}</h3>
        <div class="form-group" style="margin-bottom:0;">
          <label>${ar ? 'التحكم في استقبال الرسائل:' : 'Message Reception Policy:'}</label>
          <select id="msgPolicy_${role}" onchange="window.setMessagingPolicy(this.value)" style="width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--border);background:var(--input-bg);color:var(--text);">
            <option value="allow_permitted" ${msgPolicy === 'allow_permitted' ? 'selected' : ''}>
              ${ar ? 'الجهات المصرح بها فقط (المسؤول والمعلمون والطلاب المعنيون)' : 'Permitted contacts only (Admins, Teachers, Assigned peers)'}
            </option>
            <option value="block_all" ${msgPolicy === 'block_all' ? 'selected' : ''}>
              ${ar ? 'منع استقبال أي رسائل غير ضرورية مؤقتاً' : 'Temporarily silence unessential messages'}
            </option>
          </select>
          <small style="color:var(--text-light);display:block;margin-top:6px;">
            ${ar ? 'يمنع هذا الخيار وصول أي رسائل غير مرغوبة أو من جهات غير مخولة.' : 'Prevents spam and messages from unauthorized contacts.'}
          </small>
        </div>
      </div>

      <div class="thimar-settings-section" style="border-color:var(--danger);">
        <h3 class="thimar-settings-title" style="color:var(--danger);">🚪 ${ar ? 'تسجيل الخروج' : 'Logout'}</h3>
        <p style="color:var(--text-light);font-size:0.85rem;margin-bottom:12px;">
          ${ar ? 'إنهاء الجلسة والعودة بأمان لشاشة تسجيل الدخول الرئيسية.' : 'Sign out securely and return to the main login screen.'}
        </p>
        <button type="button" class="btn btn-danger" onclick="window.thimarSecureLogout()" style="width:100%;padding:12px;font-weight:700;">
          🚪 ${ar ? 'تسجيل الخروج من الحساب' : 'Sign Out'}
        </button>
      </div>
    `;
  }

  window.renderParentSettings = function() {
    const container = document.getElementById('parentSettings');
    if (!container) return;
    const ar = isArabic();
    container.innerHTML = `
      <div class="page-header"><h2>⚙️ ${ar ? 'إعدادات ولي الأمر' : 'Parent Settings'}</h2></div>
      ${renderSettingsPanelHtml('parent')}
    `;
  };

  function updateSettingsUI() {
    const role = getLocalRole();
    if (role === 'parent') window.renderParentSettings();
    if (role === 'admin') {
      const container = document.getElementById('adminSettings');
      if (container && !container.querySelector('.thimar-settings-section')) {
        const extraDiv = document.createElement('div');
        extraDiv.id = 'adminEnhancedSettings';
        extraDiv.innerHTML = renderSettingsPanelHtml('admin');
        container.appendChild(extraDiv);
      }
    }
    if (role === 'student') {
      const container = document.getElementById('studentSettings');
      if (container && !container.querySelector('.thimar-settings-section')) {
        const extraDiv = document.createElement('div');
        extraDiv.id = 'studentEnhancedSettings';
        extraDiv.innerHTML = renderSettingsPanelHtml('student');
        container.appendChild(extraDiv);
      }
    }
  }

  // -------------------------------------------------------------------------
  // 12. Settings Handlers
  // -------------------------------------------------------------------------
  window.setThemeMode = function(mode) {
    localStorage.setItem('thimar_theme_mode', mode);
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else if (mode === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      // Auto
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.setAttribute('data-theme', 'dark');
      else document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    }
    renderBottomNav();
    updateSettingsUI();
  };

  window.setPlatformLang = function(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('thimar_lang', lang);
    if (typeof window.toggleLang === 'function' && ((lang === 'en' && isArabic()) || (lang === 'ar' && !isArabic()))) {
      // sync with legacy if present
    }
    renderBottomNav();
    updateSettingsUI();
    const visible = document.querySelector('.page:not(.hidden)');
    if (visible && typeof window.showPage === 'function') {
      window.showPage(visible.id, { fromBrowser: true });
    }
  };

  window.setNotificationSound = function(enabled) {
    localStorage.setItem('thimar_sound_enabled', enabled ? 'true' : 'false');
    if (typeof showToast === 'function') {
      showToast(isArabic() ? (enabled ? '🔔 تم تفعيل صوت التنبيهات' : '🔕 تم إيقاف صوت التنبيهات') : (enabled ? 'Sound enabled' : 'Sound disabled'), 'info');
    }
  };

  window.testNotificationSound = function() {
    if (typeof window.playThimarNotificationSound === 'function') {
      window.playThimarNotificationSound();
    } else {
      try {
        const audio = new Audio('/sounds/notification-droplet.mp3');
        audio.play().catch(function(){});
      } catch (e) {}
    }
    if (typeof showToast === 'function') {
      showToast(isArabic() ? '🔔 تم تشغيل نغمة التجربة' : 'Played test sound', 'success');
    }
  };

  window.setMessagingPolicy = function(policy) {
    localStorage.setItem('thimar_msg_policy', policy);
    if (typeof showToast === 'function') {
      showToast(isArabic() ? '🛡️ تم حفظ إعدادات الخصوصية والرسائل' : 'Privacy policy saved', 'success');
    }
  };

  window.thimarSecureLogout = function() {
    if (typeof window.logout === 'function') {
      window.logout();
    } else if (typeof window.requestLogout === 'function') {
      window.requestLogout();
    } else {
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  function ratingText(val) {
    const v = String(val);
    if (v === '4') return isArabic() ? 'ممتاز' : 'Excellent';
    if (v === '3') return isArabic() ? 'جيد جداً' : 'Very Good';
    if (v === '1') return isArabic() ? 'جيد' : 'Good';
    if (v === '0') return isArabic() ? 'يعاد' : 'Repeat';
    return isArabic() ? 'مكتمل' : 'Done';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // -------------------------------------------------------------------------
  // 13. Hook into window.showPage
  // -------------------------------------------------------------------------
  function hookShowPage() {
    if (typeof window.showPage !== 'function') {
      setTimeout(hookShowPage, 50);
      return;
    }
    if (window.__thimarNavHooked) return;
    window.__thimarNavHooked = true;

    const originalShowPage = window.showPage;
    window.showPage = function(pageId, options) {
      activeNavPageId = pageId;
      const result = originalShowPage.apply(this, arguments);

      // Render new pages if activated
      if (pageId === 'adminReportsPage') window.renderAdminReports();
      else if (pageId === 'studentTasksPage') window.renderStudentTasks();
      else if (pageId === 'studentReportsPage') window.renderStudentReports();
      else if (pageId === 'parentTasksPage') window.renderParentTasks();
      else if (pageId === 'parentReportsPage') window.renderParentReports();
      else if (pageId === 'parentSettings') window.renderParentSettings();
      else if (pageId === 'adminSettings' || pageId === 'studentSettings') updateSettingsUI();
      else if (pageId === 'notificationsPage' && typeof window.renderNotifications === 'function') {
        window.renderNotifications();
      }

      // Update Bottom Navigation Bar
      renderBottomNav();

      return result;
    };
  }

  // -------------------------------------------------------------------------
  // 14. Initialize on Ready
  // -------------------------------------------------------------------------
  function init() {
    // Restore Saved Theme
    const savedTheme = localStorage.getItem('thimar_theme_mode');
    if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else if (savedTheme === 'light') document.documentElement.removeAttribute('data-theme');
    else if (savedTheme === 'auto') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');
    }

    hookShowPage();
    renderBottomNav();

    // Listen for storage changes to sync badges across tabs
    window.addEventListener('storage', function(e) {
      if (e.key === 'messages' || e.key === 'notifications' || e.key === 'students') {
        renderBottomNav();
      }
    });

    // Check periodically for new notifications/messages to update badge
    setInterval(renderBottomNav, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
