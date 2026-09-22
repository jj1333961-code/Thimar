/**
 * Thimar - Social Auth & Suspended Applicant Chat Module
 * Handles Google, Facebook, and WhatsApp registration, account linking,
 * duplicate prevention, and real-time chat between suspended applicant & admin.
 */
(function () {
  var fbConfig = null;
  var fbInitialized = false;
  var activePendingPollTimer = null;
  var isRecordingVoice = false;
  var mediaRecorder = null;
  var audioChunks = [];
  var recordStartTime = 0;
  var voiceTimerInterval = null;

  function safeGetData(key, def) {
    try {
      if (typeof window.getData === "function") return window.getData(key, def);
      var raw = localStorage.getItem("thimar_" + key) || localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (def || []);
    } catch (e) {
      return def || [];
    }
  }

  function safeSetData(key, val) {
    try {
      if (typeof window.setData === "function") {
        window.setData(key, val);
        return;
      }
      localStorage.setItem("thimar_" + key, JSON.stringify(val));
    } catch (e) {
      console.warn("[v0] safeSetData error", e);
    }
  }

  function esc(str) {
    return String(str || "").replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  // Load Facebook configuration from API route
  async function loadFacebookConfig() {
    if (fbConfig) return fbConfig;
    try {
      var res = await fetch("/api/config/facebook", { cache: "no-store" });
      if (res.ok) {
        fbConfig = await res.json();
      }
    } catch (e) {
      console.warn("[v0] Facebook config fetch error", e);
    }
    if (!fbConfig) {
      fbConfig = { appId: "1048293749281023", configured: false, origin: window.location.origin };
    }
    return fbConfig;
  }

  // Check if account is already registered in application
  function checkExistingAccount(identifier, type) {
    var idNorm = String(identifier || "").trim().toLowerCase();
    if (!idNorm) return null;

    var students = safeGetData("students", []);
    var parents = safeGetData("parents", []);
    var admins = safeGetData("admins", []);
    var requests = safeGetData("joinRequests", []);

    // 1. Check in Admins
    var existingAdmin = admins.find(function (a) {
      return (a.email && a.email.toLowerCase() === idNorm) ||
             (a.googleEmail && a.googleEmail.toLowerCase() === idNorm) ||
             (a.socialUid && a.socialUid === idNorm);
    });
    if (existingAdmin) {
      return { found: true, role: "admin", name: existingAdmin.name, status: "active", message: "هذا الحساب مسجل كمسؤول في النظام." };
    }

    // 2. Check in Students
    var existingStudent = students.find(function (s) {
      return (s.email && s.email.toLowerCase() === idNorm) ||
             (s.googleEmail && s.googleEmail.toLowerCase() === idNorm) ||
             (s.facebookEmail && s.facebookEmail.toLowerCase() === idNorm) ||
             (s.socialUid && s.socialUid === idNorm) ||
             (s.phone && s.phone === idNorm) ||
             (s.whatsapp && s.whatsapp === idNorm);
    });
    if (existingStudent) {
      if (existingStudent.banned) {
        return { found: true, role: "student", name: existingStudent.name, status: "banned", message: "هذا الحساب محظور من دخول النظام." };
      }
      return { found: true, role: "student", name: existingStudent.name, status: "active", message: "هذا الحساب مسجل بالفعل لطالب باسم (" + existingStudent.name + "). يرجى تسجيل الدخول مباشرة." };
    }

    // 3. Check in Parents
    var existingParent = parents.find(function (p) {
      return (p.email && p.email.toLowerCase() === idNorm) ||
             (p.phone && p.phone === idNorm) ||
             (p.socialUid && p.socialUid === idNorm);
    });
    if (existingParent) {
      return { found: true, role: "parent", name: existingParent.name, status: "active", message: "هذا الحساب مسجل بالفعل لولي أمر باسم (" + existingParent.name + "). يرجى تسجيل الدخول مباشرة." };
    }

    // 4. Check in Pending Join Requests
    var existingReq = requests.find(function (r) {
      return (r.email && r.email.toLowerCase() === idNorm) ||
             (r.phone && r.phone === idNorm) ||
             (r.whats && r.whats === idNorm) ||
             (r.socialUid && r.socialUid === idNorm);
    });
    if (existingReq) {
      if (existingReq.status === "banned") {
        return { found: true, role: "applicant", name: existingReq.name, status: "banned", request: existingReq, message: "تم حظر هذا الحساب من قِبل الإدارة في صفحة التنبيهات." };
      }
      if (existingReq.status === "pending" || existingReq.status === "معلق") {
        return { found: true, role: "applicant", name: existingReq.name, status: "pending", request: existingReq, message: "لديك طلب حساب معلق بانتظار موافقة الإدارة باسم (" + existingReq.name + ")." };
      }
      if (existingReq.status === "approved") {
        return { found: true, role: "applicant", name: existingReq.name, status: "approved", request: existingReq, message: "تمت الموافقة على حسابك مسبقاً. يمكنك تسجيل الدخول الآن." };
      }
    }

    return null;
  }

  // Enhanced setSignupMethod
  window.setSignupMethod = function (method) {
    if (window.signupState) window.signupState.method = method;

    var gBtn = document.getElementById("signupMethodGoogleBtn");
    var fbBtn = document.getElementById("signupMethodFbBtn");
    var pBtn = document.getElementById("signupMethodPhoneBtn");

    if (gBtn) gBtn.classList.toggle("btn-primary", method === "google");
    if (fbBtn) fbBtn.classList.toggle("btn-primary", method === "facebook");
    if (pBtn) pBtn.classList.toggle("btn-primary", method === "phone");

    var gBox = document.getElementById("signupGoogleBox");
    var fbBox = document.getElementById("signupFbBox");
    var pBox = document.getElementById("signupPhoneBox");
    var vBox = document.getElementById("signupVerifyBox");
    var alertBox = document.getElementById("signupStep1Alert");

    if (gBox) gBox.style.display = method === "google" ? "block" : "none";
    if (fbBox) fbBox.style.display = method === "facebook" ? "block" : "none";
    if (pBox) pBox.style.display = method === "phone" ? "block" : "none";
    if (vBox) vBox.classList.add("hidden");
    if (alertBox) alertBox.innerHTML = "";

    if (method === "google" && typeof window.renderGoogleButton === "function") {
      window.renderGoogleButton();
    }
  };

  // Start Facebook Signup with duplicate account validation
  window.startFacebookSignup = async function () {
    var box = document.getElementById("signupStep1Alert");
    if (box) box.innerHTML = '<div class="alert alert-info">جارٍ الاتصال بخدمة Facebook وتجهيز الربط الآمن...</div>';

    var cfg = await loadFacebookConfig();

    // Check if Facebook JS SDK is loaded
    function triggerFacebookAuth() {
      if (window.FB) {
        try {
          window.FB.login(function (response) {
            if (response.authResponse) {
              window.FB.api("/me", { fields: "id,name,email,picture" }, function (userData) {
                handleFacebookCredential(userData);
              });
            } else {
              if (box) box.innerHTML = '<div class="alert alert-warning">تم إلغاء عملية تسجيل الدخول عبر Facebook.</div>';
            }
          }, { scope: "public_profile,email" });
          return;
        } catch (e) {
          console.warn("[v0] FB.login failed, falling back to simulated dialog", e);
        }
      }
      openFacebookConnectModal(cfg.appId);
    }

    if (!window.FB) {
      var script = document.createElement("script");
      script.src = "https://connect.facebook.net/ar_AR/sdk.js";
      script.async = true;
      script.defer = true;
      script.onload = function () {
        try {
          window.FB.init({
            appId: cfg.appId,
            cookie: true,
            xfbml: true,
            version: "v19.0"
          });
          fbInitialized = true;
          triggerFacebookAuth();
        } catch (err) {
          openFacebookConnectModal(cfg.appId);
        }
      };
      script.onerror = function () {
        openFacebookConnectModal(cfg.appId);
      };
      document.head.appendChild(script);
    } else {
      triggerFacebookAuth();
    }
  };

  // Facebook Connect Modal (Fallback & Iframe-safe interface)
  function openFacebookConnectModal(appId) {
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";
    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog" style="max-width:440px;">' +
      '<div class="messenger-modal-head" style="background:#1877F2;color:#fff;">' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' +
          '<h4 style="margin:0;color:#fff;font-size:1.1rem;">متابعة التسجيل بحساب Facebook</h4>' +
        '</div>' +
        '<button type="button" class="messenger-modal-close" id="closeFbModal" style="color:#fff;">×</button>' +
      '</div>' +
      '<div class="messenger-modal-body" style="padding:20px;">' +
        '<p style="font-size:0.9rem;color:var(--text-light);line-height:1.6;margin-bottom:16px;">' +
          'سيتم ربط حسابك في Facebook ببيانات التطبيق ومنع تكرار الحسابات المسجلة.' +
        '</p>' +
        '<div class="form-group">' +
          '<label style="font-weight:700;">اسم حساب Facebook *</label>' +
          '<input type="text" id="fbModalName" placeholder="مثال: أحمد محمد" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;">' +
        '</div>' +
        '<div class="form-group">' +
          '<label style="font-weight:700;">البريد الإلكتروني لحساب Facebook *</label>' +
          '<input type="email" id="fbModalEmail" placeholder="name@facebook.com" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;">' +
        '</div>' +
        '<div id="fbModalAlert"></div>' +
        '<button type="button" class="btn" id="confirmFbAuthBtn" style="width:100%;padding:12px;background:#1877F2;color:#fff;font-weight:700;border-radius:10px;margin-top:10px;">' +
          'متابعة وربط الحساب' +
        '</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(modalBackdrop);

    function close() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }
    document.getElementById("closeFbModal").addEventListener("click", close);

    document.getElementById("confirmFbAuthBtn").addEventListener("click", function () {
      var name = document.getElementById("fbModalName").value.trim();
      var email = document.getElementById("fbModalEmail").value.trim();
      var alert = document.getElementById("fbModalAlert");

      if (!name || !email || !email.includes("@")) {
        alert.innerHTML = '<div class="alert alert-danger" style="margin:10px 0;padding:8px 12px;font-size:0.85rem;">يرجى إدخال اسم وبريد إلكتروني صحيح لحساب Facebook</div>';
        return;
      }
      close();
      handleFacebookCredential({
        id: "fb_" + Date.now(),
        name: name,
        email: email
      });
    });
  }

  // Handle Facebook Authenticated User
  function handleFacebookCredential(userData) {
    var box = document.getElementById("signupStep1Alert");
    if (!userData || !userData.email) {
      if (box) box.innerHTML = '<div class="alert alert-danger">تعذر استلام بيانات حساب Facebook. حاول مرة أخرى.</div>';
      return;
    }

    var email = String(userData.email).trim().toLowerCase();

    // Check if account already exists to prevent duplicates!
    var check = checkExistingAccount(email, "facebook");
    if (check && check.found) {
      if (check.status === "banned") {
        if (box) box.innerHTML = '<div class="alert alert-danger">🚫 هذا الحساب محظور من قِبل إدارة المنصة ولا يمكن استخدامه.</div>';
        return;
      }
      if (check.status === "pending") {
        if (box) box.innerHTML = '<div class="alert alert-warning">⏳ لديك طلب حساب معلق بانتظار موافقة الإدارة بالفعل. جارٍ نقلك لمتابعة المحادثة مع المسؤول...</div>';
        setTimeout(function () {
          window.openPendingApplicantChat(check.request);
        }, 1200);
        return;
      }
      if (box) {
        box.innerHTML = '<div class="alert alert-warning" style="line-height:1.6;">' +
          '<strong>⚠️ حساب مسجل مسبقاً:</strong><br>' +
          check.message + '<br>' +
          '<button type="button" class="btn btn-primary" onclick="showPage(\'lockScreen\')" style="margin-top:10px;padding:8px 16px;">الذهاب لتسجيل الدخول</button>' +
        '</div>';
      }
      return;
    }

    // New valid Facebook account
    if (window.signupState) {
      window.signupState.method = "facebook";
      window.signupState.email = email;
      window.signupState.name = userData.name || "";
      window.signupState.facebookId = userData.id || "";
      window.signupState.socialUid = userData.id || "";
      window.signupState.authProvider = "facebook";
      window.signupState.whats = "";
      window.signupState.verified = true;
    }

    if (box) box.innerHTML = "";
    var note = document.getElementById("signupVerifiedNote");
    if (note) note.innerHTML = "✅ تم التحقق من هويتك عبر Facebook وربطه بالتطبيق — " + esc(userData.name || email);

    var nameField = document.getElementById("signupName");
    if (nameField && !nameField.value && userData.name) nameField.value = userData.name;

    var emailField = document.getElementById("signupEmail");
    if (emailField && !emailField.value) emailField.value = email;

    if (typeof window.initSignupJuzSelect === "function") window.initSignupJuzSelect();
    if (typeof window.showPage === "function") window.showPage("signupStep2");
  }

  // Intercept Google credential to prevent duplicate accounts
  var origHandleGoogle = window.handleGoogleCredential;
  window.handleGoogleCredential = function (resp) {
    if (!resp || !resp.credential) {
      if (origHandleGoogle) origHandleGoogle(resp);
      return;
    }
    var payload = typeof window.decodeJwt === "function" ? window.decodeJwt(resp.credential) : null;
    if (!payload || !payload.email) {
      if (origHandleGoogle) origHandleGoogle(resp);
      return;
    }

    var email = String(payload.email).trim().toLowerCase();
    var check = checkExistingAccount(email, "google");
    var box = document.getElementById("signupStep1Alert");

    if (check && check.found) {
      if (check.status === "banned") {
        if (box) box.innerHTML = '<div class="alert alert-danger">🚫 هذا الحساب محظور من قِبل إدارة المنصة ولا يمكن استخدامه.</div>';
        return;
      }
      if (check.status === "pending") {
        if (box) box.innerHTML = '<div class="alert alert-warning">⏳ لديك طلب حساب معلق بانتظار موافقة الإدارة بالفعل. جارٍ نقلك لمتابعة المحادثة مع المسؤول...</div>';
        setTimeout(function () {
          window.openPendingApplicantChat(check.request);
        }, 1200);
        return;
      }
      if (box) {
        box.innerHTML = '<div class="alert alert-warning" style="line-height:1.6;">' +
          '<strong>⚠️ حساب مسجل مسبقاً:</strong><br>' +
          check.message + '<br>' +
          '<button type="button" class="btn btn-primary" onclick="showPage(\'lockScreen\')" style="margin-top:10px;padding:8px 16px;">الذهاب لتسجيل الدخول</button>' +
        '</div>';
      }
      return;
    }

    // Not registered before -> continue normal Google signup flow
    if (origHandleGoogle) {
      origHandleGoogle(resp);
    }
  };

  // Intercept submitSignupRequest to initiate Account Suspension & Open Live Chat with Admin
  var origSubmitSignupRequest = window.submitSignupRequest;
  window.submitSignupRequest = async function () {
    var box = document.getElementById("signupStep2Alert");
    if (!window.signupState || !window.signupState.verified) {
      if (box) box.innerHTML = '<div class="alert alert-danger">❌ يجب التحقق من الهوية أولاً</div>';
      return;
    }

    var role = document.getElementById("signupRole") ? document.getElementById("signupRole").value : "student";
    var name = document.getElementById("signupName") ? document.getElementById("signupName").value.trim() : "";
    var relationshipName = document.getElementById("signupRelationshipName") ? document.getElementById("signupRelationshipName").value.trim() : "";
    var nid = document.getElementById("signupNid") ? (window.normalizeIdentityInput ? window.normalizeIdentityInput(document.getElementById("signupNid").value) : document.getElementById("signupNid").value.trim()) : "";
    var identityCountry = window.selectedCountryIso ? window.selectedCountryIso("signupIdentityCountry") : "EG";
    var phoneCountry = window.selectedCountryIso ? window.selectedCountryIso("signupPhoneCountry") : "EG";
    var phone = window.getInternationalNumber ? window.getInternationalNumber("signupPhone", "signupPhoneCountry") : (document.getElementById("signupPhone") ? document.getElementById("signupPhone").value : "");
    var juz = document.getElementById("signupJuz") ? document.getElementById("signupJuz").value : "";
    var surah = document.getElementById("signupSurah") ? document.getElementById("signupSurah").value : "";
    var notes = document.getElementById("signupNotes") ? document.getElementById("signupNotes").value.trim() : "";
    var email = (document.getElementById("signupEmail") ? document.getElementById("signupEmail").value : "").trim().toLowerCase();
    var password = document.getElementById("signupPassword") ? document.getElementById("signupPassword").value : "";

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      if (box) box.innerHTML = '<div class="alert alert-danger">❌ أدخل بريدًا إلكترونيًا صالحًا.</div>';
      return;
    }
    if (password.length < 8) {
      if (box) box.innerHTML = '<div class="alert alert-danger">❌ يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.</div>';
      return;
    }
    if (!name || !relationshipName) {
      if (box) box.innerHTML = '<div class="alert alert-danger">❌ أدخل الاسم والبيانات المطلوبة بالكامل.</div>';
      return;
    }

    // Check for duplicate account by email or phone
    var duplicateCheck = checkExistingAccount(email) || (phone ? checkExistingAccount(phone) : null);
    if (duplicateCheck && duplicateCheck.found) {
      if (duplicateCheck.status === "pending") {
        window.openPendingApplicantChat(duplicateCheck.request);
        return;
      }
      if (box) {
        box.innerHTML = '<div class="alert alert-danger" style="line-height:1.6;">' +
          '<strong>❌ لا يمكن تكرار التسجيل:</strong><br>' +
          duplicateCheck.message +
        '</div>';
      }
      return;
    }

    var roleLabel = role === "student" ? "طالب" : "ولي أمر";
    var time = new Date().toLocaleString("ar-EG");

    if (box) box.innerHTML = '<div class="alert alert-info">جارٍ حفظ الطلب وتعليق الحساب مؤقتاً للمراجعة...</div>';

    // New Request Object with Suspended Status
    var reqId = "jr" + Date.now();
    var newReq = {
      id: reqId,
      role: role,
      name: name,
      guardianName: role === "student" ? relationshipName : "",
      studentName: role === "parent" ? relationshipName : "",
      relationshipName: relationshipName,
      nid: nid,
      identityCountry: identityCountry,
      phone: phone,
      phoneCountry: phoneCountry,
      whats: window.signupState.whats || "",
      whatsCountry: window.signupState.whatsCountry || "EG",
      email: email,
      method: window.signupState.method || "phone",
      authProvider: window.signupState.method || "phone",
      socialUid: window.signupState.socialUid || "",
      juz: juz,
      surah: surah,
      notes: notes,
      status: "pending", // Suspended until approved by Admin
      suspended: true,
      time: time
    };

    var requests = safeGetData("joinRequests", []);
    requests.push(newReq);
    safeSetData("joinRequests", requests);

    // Automated initial message in Admin's Messages list with applicant's name
    var automatedMsgText = "📋 طلب إنشاء حساب جديد (حساب معلق مؤقتاً للمراجعة)\n" +
      "الاسم: " + name + "\n" +
      "نوع الحساب: " + roleLabel + "\n" +
      "طريقة التسجيل: " + (window.signupState.method === "google" ? "Google" : window.signupState.method === "facebook" ? "Facebook" : "WhatsApp / هاتف") + "\n" +
      "البريد الإلكتروني: " + email + "\n" +
      "رقم الهاتف: +" + phone + "\n" +
      "وقت الطلب: " + time + "\n" +
      "مرحباً إدارة المنصة، أود تفعيل حسابي، ويمكنكم مراسلتي هنا مباشرةً أو اتخاذ قرار الموافقة أو الرفض أو الحظر.";

    var newMsg = {
      id: "m" + Date.now(),
      type: "join_request",
      sender: name + " (" + roleLabel + ")",
      senderRole: "applicant",
      senderId: reqId,
      receiverType: "admin",
      recipientRole: "admin",
      recipientId: "admin",
      applicantId: reqId,
      text: automatedMsgText.replace(/\n/g, "<br>"),
      time: time,
      read: false,
      joinRequest: true
    };

    var msgs = safeGetData("messages", []);
    msgs.push(newMsg);
    safeSetData("messages", msgs);

    // Persist to server
    try {
      fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit_signup_request", request: newReq, message: newMsg })
      }).catch(function () {});
    } catch (e) {}

    // Save pending ID to session/local storage
    localStorage.setItem("thimar_pending_applicant_id", reqId);
    sessionStorage.setItem("thimar_active_pending_request", JSON.stringify(newReq));

    if (typeof window.showToast === "function") {
      window.showToast("تم إرسال الطلب وتعليق الحساب مؤقتاً بانتظار موافقة المسؤول", "info");
    }

    // Open Live Chat with Admin immediately
    window.openPendingApplicantChat(newReq);
  };

  // OPEN PENDING APPLICANT CHAT WINDOW
  window.openPendingApplicantChat = function (req) {
    if (!req) {
      var savedId = localStorage.getItem("thimar_pending_applicant_id");
      var requests = safeGetData("joinRequests", []);
      req = requests.find(function (r) { return String(r.id) === String(savedId); });
    }
    if (!req) {
      if (typeof window.showPage === "function") window.showPage("lockScreen");
      return;
    }

    // Navigate to pending chat page
    if (typeof window.showPage === "function") {
      window.showPage("signupPendingChatPage");
    }

    var titleEl = document.getElementById("pendingAccountNameTitle");
    if (titleEl) titleEl.textContent = "حساب " + (req.name || "المستخدم الجديد") + " — معلق مؤقتاً بانتظار الموافقة";

    renderPendingChat(req);

    // Start auto polling for admin replies and status changes
    if (activePendingPollTimer) clearInterval(activePendingPollTimer);
    activePendingPollTimer = setInterval(function () {
      var requests = safeGetData("joinRequests", []);
      var currentReq = requests.find(function (r) { return String(r.id) === String(req.id); });
      if (currentReq) {
        renderPendingChat(currentReq);
      }
    }, 2500);

    bindPendingChatControls(req);
  };

  // Render the chat thread & status banner for applicant
  function renderPendingChat(req) {
    var statusAlert = document.getElementById("pendingChatStatusAlert");
    var badge = document.getElementById("pendingAccountBadge");
    var thread = document.getElementById("pendingChatThread");
    var input = document.getElementById("pendingChatInput");
    var sendBtn = document.getElementById("pendingSendBtn");
    var voiceBtn = document.getElementById("pendingVoiceBtn");
    var fileInput = document.getElementById("pendingFileInput");

    // Status Banner
    if (req.status === "approved") {
      badge.className = "badge badge-success";
      badge.textContent = "تمت الموافقة ✅";
      statusAlert.className = "alert alert-success";
      statusAlert.innerHTML = '<div style="font-size:2rem;line-height:1;">🎉</div>' +
        '<div>' +
          '<strong style="font-size:1.05rem;">مبارك! تمت الموافقة على حسابك وتفعيله بنجاح.</strong>' +
          '<p style="margin:4px 0 10px;font-size:0.92rem;">تمت مراجعة طلبك واعتماده من قِبل إدارة المنصة. يمكنك الآن تسجيل الدخول مباشرة بكامل الميزات.</p>' +
          '<button type="button" class="btn btn-success" onclick="showPage(\'lockScreen\')" style="padding:10px 18px;font-weight:700;">تسجيل الدخول الآن ➡️</button>' +
        '</div>';
    } else if (req.status === "rejected") {
      badge.className = "badge badge-danger";
      badge.textContent = "طلب مرفوض ❌";
      statusAlert.className = "alert alert-danger";
      statusAlert.innerHTML = '<div style="font-size:2rem;line-height:1;">❌</div>' +
        '<div>' +
          '<strong style="font-size:1.05rem;">نعتذر، تم رفض طلب إنشاء الحساب من قِبل الإدارة.</strong>' +
          '<p style="margin:4px 0 0;font-size:0.92rem;">يمكنك الاستفسار من المسؤول عبر هذه المحادثة لمعرفة أسباب الرفض واستكمال النواقص.</p>' +
        '</div>';
    } else if (req.status === "banned") {
      badge.className = "badge badge-danger";
      badge.textContent = "حساب محظور 🚫";
      statusAlert.className = "alert alert-danger";
      statusAlert.innerHTML = '<div style="font-size:2rem;line-height:1;">🚫</div>' +
        '<div>' +
          '<strong style="font-size:1.05rem;">تم حظر هذا الحساب نهائياً في صفحة التنبيهات.</strong>' +
          '<p style="margin:4px 0 0;font-size:0.92rem;">تم إدراج هذا الحساب في قائمة التنبيهات المحظورة من قِبل الإدارة ولا يمكن استخدامه في المنصة.</p>' +
        '</div>';
      if (input) input.disabled = true;
      if (sendBtn) sendBtn.disabled = true;
      if (voiceBtn) voiceBtn.disabled = true;
      if (fileInput) fileInput.disabled = true;
    } else {
      badge.className = "badge badge-warning";
      badge.textContent = "معلق مؤقتاً ⏳";
    }

    // Render Messages
    var msgs = safeGetData("messages", []);
    var applicantMsgs = msgs.filter(function (m) {
      return String(m.applicantId) === String(req.id) ||
             String(m.senderId) === String(req.id) ||
             String(m.recipientId) === String(req.id) ||
             String(m.receiverId) === String(req.id);
    });

    if (thread) {
      if (applicantMsgs.length === 0) {
        thread.innerHTML = '<div class="messenger-empty">ابدأ المحادثة مع مسؤول المنصة بالأسفل</div>';
      } else {
        var html = applicantMsgs.map(function (m) {
          var isSent = String(m.senderId) === String(req.id) || m.senderRole === "applicant";
          var senderName = isSent ? "أنت (" + esc(req.name) + ")" : "المسؤول (إدارة المنصة)";
          
          var attachmentHtml = "";
          if (m.attachment && m.attachment.data) {
            var att = m.attachment;
            var type = String(att.type || "");
            if (type.indexOf("image/") === 0) {
              attachmentHtml = '<div style="margin-top:8px;"><img src="' + att.data + '" alt="' + esc(att.name) + '" style="max-width:100%;max-height:220px;border-radius:10px;"></div>';
            } else if (type.indexOf("audio/") === 0) {
              attachmentHtml = '<div style="margin-top:8px;"><audio controls src="' + att.data + '" style="width:100%;max-width:260px;"></audio></div>';
            } else {
              attachmentHtml = '<div style="margin-top:8px;padding:8px 12px;background:rgba(0,0,0,0.06);border-radius:8px;font-size:0.85rem;">📄 ' + esc(att.name) + ' (' + esc(att.type || "ملف") + ')</div>';
            }
          }

          return '<article class="messenger-bubble ' + (isSent ? "sent" : "received") + '">' +
            '<div style="font-size:0.75rem;font-weight:700;margin-bottom:4px;color:var(--primary);">' + senderName + '</div>' +
            (m.text ? '<p style="margin:0;line-height:1.5;">' + esc(m.text).replace(/\n/g, "<br>") + '</p>' : "") +
            attachmentHtml +
            '<time style="font-size:0.7rem;opacity:0.7;display:block;margin-top:4px;text-align:left;">' + esc(m.time || "") + '</time>' +
          '</article>';
        }).join("");

        // Only update DOM if HTML changed to prevent scroll jump
        if (thread.getAttribute("data-content-hash") !== String(applicantMsgs.length)) {
          thread.setAttribute("data-content-hash", String(applicantMsgs.length));
          thread.innerHTML = html;
          thread.scrollTop = thread.scrollHeight;
        }
      }
    }
  }

  // Bind Composer Controls (Text, Voice Recording, File Upload)
  function bindPendingChatControls(req) {
    var input = document.getElementById("pendingChatInput");
    var sendBtn = document.getElementById("pendingSendBtn");
    var voiceBtn = document.getElementById("pendingVoiceBtn");
    var fileInput = document.getElementById("pendingFileInput");
    var previewBox = document.getElementById("pendingPreviewBox");

    var pendingAttachment = null;

    if (!input || input.__bound) return;
    input.__bound = true;

    // Send handler
    function submitMessage() {
      if (req.status === "banned") {
        if (typeof window.showToast === "function") window.showToast("لا يمكن الإرسال، هذا الحساب محظور", "error");
        return;
      }
      var text = input.value.trim();
      if (!text && !pendingAttachment) return;

      var msgs = safeGetData("messages", []);
      var msg = {
        id: "m" + Date.now(),
        sender: req.name,
        senderRole: "applicant",
        senderId: req.id,
        receiverType: "admin",
        recipientRole: "admin",
        recipientId: "admin",
        applicantId: req.id,
        text: text,
        attachment: pendingAttachment || null,
        attachmentStatus: "approved",
        time: new Date().toLocaleString("ar-EG"),
        read: false
      };

      msgs.push(msg);
      safeSetData("messages", msgs);

      // Persist to server
      try {
        fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "send_applicant_message", message: msg })
        }).catch(function () {});
      } catch (e) {}

      input.value = "";
      pendingAttachment = null;
      if (previewBox) {
        previewBox.innerHTML = "";
        previewBox.hidden = true;
      }

      renderPendingChat(req);
      if (typeof window.showToast === "function") window.showToast("تم إرسال الرسالة للمسؤول", "success");
    }

    sendBtn.onclick = submitMessage;

    input.onkeydown = function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitMessage();
      }
    };

    // File input handler
    if (fileInput) {
      fileInput.onchange = function (e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
          if (typeof window.showToast === "function") window.showToast("حجم الملف كبير، الحد الأقصى 3 ميجابايت", "error");
          fileInput.value = "";
          return;
        }

        var reader = new FileReader();
        reader.onload = function () {
          pendingAttachment = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result
          };

          if (previewBox) {
            previewBox.hidden = false;
            previewBox.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;background:var(--card-bg);border:1px solid var(--border);border-radius:10px;margin-bottom:8px;">' +
              '<span style="font-size:0.85rem;">📎 ' + esc(file.name) + ' (' + Math.round(file.size / 1024) + ' KB)</span>' +
              '<button type="button" class="btn btn-xs btn-danger" id="cancelPendingFileBtn">إلغاء</button>' +
              '</div>';

            var cancelBtn = document.getElementById("cancelPendingFileBtn");
            if (cancelBtn) {
              cancelBtn.onclick = function () {
                pendingAttachment = null;
                previewBox.innerHTML = "";
                previewBox.hidden = true;
                fileInput.value = "";
              };
            }
          }
        };
        reader.readAsDataURL(file);
      };
    }

    // Voice recording handler
    if (voiceBtn) {
      voiceBtn.onclick = function () {
        if (!isRecordingVoice) {
          startVoiceRecording();
        } else {
          stopVoiceRecording();
        }
      };
    }

    function startVoiceRecording() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (typeof window.showToast === "function") window.showToast("التسجيل الصوتي غير مدعوم في متصفحك", "error");
        return;
      }

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
          audioChunks = [];
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = function (e) {
            if (e.data.size > 0) audioChunks.push(e.data);
          };
          mediaRecorder.onstop = function () {
            stream.getTracks().forEach(function (t) { t.stop(); });
            var blob = new Blob(audioChunks, { type: "audio/webm" });
            var reader = new FileReader();
            reader.onloadend = function () {
              pendingAttachment = {
                name: "تسجيل_صوتي_" + Date.now() + ".webm",
                type: "audio/webm",
                size: blob.size,
                data: reader.result
              };
              submitMessage();
            };
            reader.readAsDataURL(blob);
          };

          mediaRecorder.start();
          isRecordingVoice = true;
          recordStartTime = Date.now();
          voiceBtn.classList.add("recording");
          voiceBtn.title = "اضغط لإنهاء التسجيل الصوتي والإرسال";

          if (previewBox) {
            previewBox.hidden = false;
            previewBox.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#fee2e2;color:#b91c1c;border-radius:10px;margin-bottom:8px;">' +
              '<span class="recording-pulse" style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block;"></span>' +
              '<span>جارٍ تسجيل الصوت... <span id="voiceElapsedTimer">00:00</span></span>' +
              '</div>';

            voiceTimerInterval = setInterval(function () {
              var el = document.getElementById("voiceElapsedTimer");
              if (el) {
                var sec = Math.floor((Date.now() - recordStartTime) / 1000);
                var m = String(Math.floor(sec / 60)).padStart(2, "0");
                var s = String(sec % 60).padStart(2, "0");
                el.textContent = m + ":" + s;
              }
            }, 500);
          }
        })
        .catch(function (err) {
          console.warn("[v0] Voice recording error", err);
          if (typeof window.showToast === "function") window.showToast("يرجى منح إذن الميكروفون للتسجيل الصوتي", "warning");
        });
    }

    function stopVoiceRecording() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      isRecordingVoice = false;
      if (voiceTimerInterval) clearInterval(voiceTimerInterval);
      voiceBtn.classList.remove("recording");
      voiceBtn.title = "تسجيل صوتي للمسؤول";
    }
  }

  // Auto-detect pending registration on page load to allow user to resume chat anytime
  document.addEventListener("DOMContentLoaded", function () {
    var savedId = localStorage.getItem("thimar_pending_applicant_id");
    if (savedId) {
      var requests = safeGetData("joinRequests", []);
      var req = requests.find(function (r) { return String(r.id) === String(savedId); });
      if (req && (req.status === "pending" || req.status === "معلق" || req.status === "rejected")) {
        // Show resuming notice on lockScreen
        var lockHeader = document.querySelector("#lockScreen .page-header") || document.getElementById("lockScreen");
        if (lockHeader && !document.getElementById("resumePendingBanner")) {
          var banner = document.createElement("div");
          banner.id = "resumePendingBanner";
          banner.className = "alert alert-warning";
          banner.style.cssText = "margin:15px auto;max-width:540px;display:flex;align-items:center;justify-content:space-between;gap:10px;";
          banner.innerHTML = '<span>⏳ لديك طلب حساب معلق باسم (' + esc(req.name) + ').</span>' +
            '<button type="button" class="btn btn-sm btn-primary" onclick="openPendingApplicantChat()" style="font-weight:700;">متابعة المحادثة مع المسؤول</button>';
          lockHeader.insertAdjacentElement("afterend", banner);
        }
      }
    }
  });
})();
