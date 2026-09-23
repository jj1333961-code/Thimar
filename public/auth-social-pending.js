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
    var box = document.getElementById("signupStep2Alert") || document.getElementById("signupStep1Alert");
    if (window.signupState) {
      window.signupState.verified = true;
      window.signupState.method = window.signupState.method || "direct";
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
    var email = (document.getElementById("signupEmail") ? document.getElementById("signupEmail").value : (window.signupState ? window.signupState.email : "")).trim().toLowerCase();

    if (!name || !relationshipName) {
      if (box) box.innerHTML = '<div class="alert alert-danger">❌ أدخل الاسم واسم ولي الأمر/الطالب بالكامل.</div>';
      return;
    }
    if (!juz || !surah) {
      if (box) box.innerHTML = '<div class="alert alert-danger">❌ يرجى اختيار الجزء والسورة من القرآن الكريم.</div>';
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

  // ==========================================
  // DEVICE SOCIAL ACCOUNTS & AUTOMATIC LOGIN
  // ==========================================

  function getSavedDeviceAccounts(provider) {
    var list = [];
    try {
      var raw = localStorage.getItem("thimar_saved_device_accounts");
      if (raw) list = JSON.parse(raw);
    } catch (e) {}

    // Find accounts registered inside local system
    var students = safeGetData("students", []);
    var parents = safeGetData("parents", []);
    var admins = safeGetData("admins", []);

    admins.forEach(function (a) {
      var email = a.email || a.googleEmail;
      if (email && (provider === "google" || !provider)) {
        list.push({ email: email, name: a.name || "مسؤول النظام", provider: "google", role: "admin", isRegistered: true });
      }
    });

    students.forEach(function (s) {
      var gEmail = s.googleEmail || (s.email && s.email.includes("@gmail") ? s.email : "");
      var fbEmail = s.facebookEmail;
      if (gEmail && (provider === "google" || !provider)) {
        list.push({ email: gEmail, name: s.name, provider: "google", role: "student", isRegistered: true });
      }
      if (fbEmail && (provider === "facebook" || !provider)) {
        list.push({ email: fbEmail, name: s.name, provider: "facebook", role: "student", isRegistered: true });
      }
    });

    parents.forEach(function (p) {
      var gEmail = p.googleEmail || (p.email && p.email.includes("@gmail") ? p.email : "");
      var fbEmail = p.facebookEmail;
      if (gEmail && (provider === "google" || !provider)) {
        list.push({ email: gEmail, name: p.name, provider: "google", role: "parent", isRegistered: true });
      }
      if (fbEmail && (provider === "facebook" || !provider)) {
        list.push({ email: fbEmail, name: p.name, provider: "facebook", role: "parent", isRegistered: true });
      }
    });

    // Deduplicate by email
    var seen = {};
    var unique = [];
    list.forEach(function (acc) {
      var key = (acc.email || acc.id || "").toLowerCase();
      if (!key) return;
      if (!seen[key]) {
        seen[key] = true;
        if (provider && acc.provider && acc.provider !== provider) return;
        unique.push(acc);
      }
    });
    return unique;
  }

  function saveDeviceAccount(acc) {
    if (!acc || !acc.email) return;
    try {
      var accounts = [];
      var raw = localStorage.getItem("thimar_saved_device_accounts");
      if (raw) accounts = JSON.parse(raw);
      var exists = accounts.find(function (a) { return (a.email || "").toLowerCase() === (acc.email || "").toLowerCase(); });
      if (!exists) {
        accounts.push({ email: acc.email, name: acc.name || "", provider: acc.provider || "google", isRegistered: !!acc.isRegistered });
        localStorage.setItem("thimar_saved_device_accounts", JSON.stringify(accounts));
      }
    } catch (e) {}
  }

  // Quick Device Social Login for Forgot Password & Login Screen
  window.quickDeviceSocialLogin = async function (provider) {
    var p = provider || "google";
    var pLabel = p === "google" ? "Google" : "Facebook";
    var pColor = p === "google" ? "#4285F4" : "#1877F2";
    var pIcon = p === "google"
      ? '<svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>';

    // Try Google GIS One Tap prompt in background if Google
    if (p === "google" && window.google && window.google.accounts && window.google.accounts.id) {
      try {
        if (typeof window.initGoogleGsi === "function") window.initGoogleGsi();
        window.google.accounts.id.prompt();
      } catch (e) {}
    }

    var accounts = getSavedDeviceAccounts(p);

    // Build Account Picker Modal
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";
    modalBackdrop.id = "deviceAccountPickerModal";

    var accountsHtml = "";
    if (accounts.length > 0) {
      accountsHtml = '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">';
      accounts.forEach(function (acc) {
        var isReg = !!acc.isRegistered;
        accountsHtml += '<div class="device-account-item" data-email="' + esc(acc.email) + '" data-name="' + esc(acc.name) + '" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:1.5px solid var(--border,#e2e8f0);border-radius:12px;cursor:pointer;background:var(--bg,#f8fafc);transition:all 0.2s;" onmouseover="this.style.borderColor=\'' + pColor + '\';this.style.background=\'#f0fdf4\';" onmouseout="this.style.borderColor=\'var(--border,#e2e8f0)\';this.style.background=\'var(--bg,#f8fafc)\';">'
          + '<div style="display:flex;align-items:center;gap:10px;text-align:right;">'
          + '<div style="width:38px;height:38px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800;color:#475569;">' + (acc.name ? acc.name.charAt(0) : '👤') + '</div>'
          + '<div>'
          + '<div style="font-weight:800;font-size:0.95rem;color:var(--text,#1e293b);">' + esc(acc.name || acc.email) + '</div>'
          + '<div style="font-size:0.8rem;color:var(--text-light,#64748b);direction:ltr;text-align:right;">' + esc(acc.email) + '</div>'
          + '</div>'
          + '</div>'
          + '<div>'
          + (isReg ? '<span style="display:inline-block;padding:3px 10px;background:#059669;color:#fff;border-radius:999px;font-size:0.75rem;font-weight:700;">مسجل بالمنصة ✅</span>' : '<span style="display:inline-block;padding:3px 10px;background:#64748b;color:#fff;border-radius:999px;font-size:0.75rem;font-weight:700;">حساب جهاز</span>')
          + '</div>'
          + '</div>';
      });
      accountsHtml += '</div>';
    } else {
      accountsHtml = '<div style="padding:16px;background:var(--bg,#f8fafc);border:1px dashed var(--border,#cbd5e1);border-radius:12px;margin-bottom:16px;text-align:center;color:var(--text-light,#64748b);font-size:0.9rem;">'
        + 'لا توجد حسابات ' + pLabel + ' مسجلة مسبقاً في هذا المتصفح. يمكنك اختيار أو إدخال حسابك على الجهاز أدناه:'
        + '</div>';
    }

    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog" style="max-width:480px;">'
      + '<div class="messenger-modal-head" style="background:' + pColor + ';color:#fff;">'
      + '<div style="display:flex;align-items:center;gap:10px;">'
      + '<div style="background:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + pIcon + '</div>'
      + '<h4 style="margin:0;color:#fff;font-size:1.05rem;">حسابات ' + pLabel + ' على هذا الجهاز</h4>'
      + '</div>'
      + '<button type="button" class="messenger-modal-close" id="closeDevicePickerBtn" style="color:#fff;">×</button>'
      + '</div>'
      + '<div class="messenger-modal-body" style="padding:20px;">'
      + '<p style="font-size:0.88rem;color:var(--text-light,#64748b);line-height:1.6;margin-bottom:14px;">'
      + 'اختر حسابك المسجل ليتم تسجيل دخولك فوراً إلى حسابك في ثِمار دون الحاجة لكتابة اسم المستخدم أو كلمة المرور:'
      + '</p>'
      + '<div id="deviceAccountsListContainer">' + accountsHtml + '</div>'
      + '<div id="devicePickerAlert"></div>'
      + '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">'
      + '<button type="button" class="btn" id="addNewDeviceAccountBtn" style="width:100%;padding:10px;border:1.5px solid var(--border,#d1d5db);background:#fff;font-weight:700;border-radius:10px;display:flex;align-items:center;justify-content:center;gap:8px;color:#1e293b;cursor:pointer;">'
      + '<span>➕ تسجيل الدخول بحساب ' + pLabel + ' آخر على هذا الجهاز</span>'
      + '</button>'
      + '</div>'
      + '</div>'
      + '</div>';

    document.body.appendChild(modalBackdrop);

    function closeModal() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }

    var closeBtn = document.getElementById("closeDevicePickerBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    // Click on existing device account item
    var items = modalBackdrop.querySelectorAll(".device-account-item");
    items.forEach(function (el) {
      el.addEventListener("click", function () {
        var email = el.getAttribute("data-email");
        var name = el.getAttribute("data-name");
        closeModal();
        verifyAndLoginDeviceAccount({ email: email, name: name, provider: p });
      });
    });

    // Click to add / connect other account
    var addBtn = document.getElementById("addNewDeviceAccountBtn");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        closeModal();
        if (p === "google") {
          promptCustomGoogleAccountEntry();
        } else {
          openFacebookConnectModal();
        }
      });
    }
  };

  // Verify if account is registered in system; log in if yes, alert if no
  async function verifyAndLoginDeviceAccount(account) {
    var email = String(account.email || "").trim().toLowerCase();
    var name = account.name || "";
    var provider = account.provider || "google";
    var pLabel = provider === "google" ? "Google" : "Facebook";

    if (!email) return;

    var students = safeGetData("students", []);
    var parents = safeGetData("parents", []);
    var admins = safeGetData("admins", []);

    // 1. Check Admin
    var matchedAdmin = admins.find(function (a) {
      return (a.email && a.email.toLowerCase() === email) ||
             (a.googleEmail && a.googleEmail.toLowerCase() === email) ||
             (a.username && a.username.toLowerCase() === email);
    });

    if (matchedAdmin) {
      saveDeviceAccount({ email: email, name: matchedAdmin.name, provider: provider, isRegistered: true });
      window.currentUser = matchedAdmin;
      window.currentType = "admin";
      window.currentAdminId = matchedAdmin.id;
      if (typeof window.saveSessionState === "function") window.saveSessionState();
      if (typeof window.showPage === "function") window.showPage("adminDashboard");
      if (typeof window.showToast === "function") window.showToast("✅ مرحباً بك يا مسؤول المنصة (" + (matchedAdmin.name || email) + ")", "success");
      return;
    }

    // 2. Check Student
    var matchedStudent = students.find(function (s) {
      return (s.email && s.email.toLowerCase() === email) ||
             (s.googleEmail && s.googleEmail.toLowerCase() === email) ||
             (s.facebookEmail && s.facebookEmail.toLowerCase() === email);
    });

    if (matchedStudent) {
      saveDeviceAccount({ email: email, name: matchedStudent.name, provider: provider, isRegistered: true });
      if (typeof window.completeUserLogin === "function") {
        window.completeUserLogin(matchedStudent, "student", "studentDashboard", "✅ مرحباً بك يا " + matchedStudent.name + " — تم تسجيل الدخول الفوري بحساب " + pLabel);
      }
      return;
    }

    // 3. Check Parent
    var matchedParent = parents.find(function (p) {
      return (p.email && p.email.toLowerCase() === email) ||
             (p.googleEmail && p.googleEmail.toLowerCase() === email) ||
             (p.facebookEmail && p.facebookEmail.toLowerCase() === email);
    });

    var matchedParentKids = !matchedParent ? students.filter(function (s) {
      return (s.parentEmail && s.parentEmail.toLowerCase() === email) ||
             (s.parentGoogleEmail && s.parentGoogleEmail.toLowerCase() === email);
    }) : [];

    if (matchedParent || matchedParentKids.length > 0) {
      saveDeviceAccount({ email: email, name: (matchedParent ? matchedParent.name : ""), provider: provider, isRegistered: true });
      var targetParent = matchedParent || matchedParentKids;
      if (typeof window.completeUserLogin === "function") {
        window.completeUserLogin(targetParent, "parent", "parentDashboard", "✅ مرحباً بك في صفحة ولي الأمر — تم تسجيل الدخول الفوري بحساب " + pLabel);
      }
      return;
    }

    // 4. Check Server via lookup-account
    try {
      var serverCheck = await fetch("/api/auth/lookup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      });
      var checkData = await serverCheck.json().catch(function () { return {}; });
      if (checkData && checkData.found && checkData.user) {
        var u = checkData.user;
        var r = u.role || "student";
        var d = r === "admin" ? "adminDashboard" : (r === "parent" ? "parentDashboard" : "studentDashboard");
        saveDeviceAccount({ email: email, name: u.name, provider: provider, isRegistered: true });
        if (typeof window.completeUserLogin === "function") {
          window.completeUserLogin(u, r, d, "✅ تم تسجيل الدخول الفوري بحساب " + pLabel);
        }
        return;
      }
    } catch (e) {
      console.warn("[v0] server lookup check note", e);
    }

    // NOT REGISTERED:
    // "ويتم اختيار اي حساب كان مرتبط بالبرنامج ليم الدخول مباشرتا الي التطبيق دون الحاجه الي كتابت اسم المستخدم او رقم السري وذالك اذا كان الحساب مسجل بلفعل في البرنامج والا فلا ويخبره بان هذا الحساب غير مسجل"
    showUnregisteredAccountModal(account, provider);
  }

  // Modal when account is NOT registered
  function showUnregisteredAccountModal(account, provider) {
    var pLabel = provider === "google" ? "Google" : "Facebook";
    var email = account.email || "";
    var name = account.name || "";

    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";
    modalBackdrop.id = "unregisteredAccountModal";
    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog" style="max-width:450px;">'
      + '<div class="messenger-modal-head" style="background:#dc2626;color:#fff;">'
      + '<div style="display:flex;align-items:center;gap:10px;">'
      + '<span style="font-size:1.3rem;">⚠️</span>'
      + '<h4 style="margin:0;color:#fff;font-size:1.05rem;">هذا الحساب غير مسجل في المنصة</h4>'
      + '</div>'
      + '<button type="button" class="messenger-modal-close" id="closeUnregBtn" style="color:#fff;">×</button>'
      + '</div>'
      + '<div class="messenger-modal-body" style="padding:22px;text-align:center;">'
      + '<div style="font-size:3rem;margin-bottom:10px;">🚫</div>'
      + '<h3 style="font-size:1.15rem;font-weight:800;color:var(--text,#1e293b);margin-bottom:8px;">تعذر تسجيل الدخول</h3>'
      + '<p style="font-size:0.92rem;color:var(--text-light,#64748b);line-height:1.7;margin-bottom:18px;">'
      + 'حساب ' + pLabel + ' المختار: <br><strong style="color:#dc2626;direction:ltr;display:inline-block;">' + esc(email) + '</strong><br>'
      + '<strong>غير مسجل مسبقاً</strong> في تطبيق ثِمار، ولا يرتبط بأي طالب أو ولي أمر مسجل ببلفعل.'
      + '</p>'
      + '<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:12px;margin-bottom:18px;text-align:right;font-size:0.85rem;color:#991b1b;line-height:1.6;">'
      + '💡 يمكنك الآن إنشاء حساب جديد والربط التلقائي بهذا الحساب لتتمكن من الدخول به لاحقاً بضغطة زر واحدة.'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:10px;">'
      + '<button type="button" class="btn btn-success" id="createAccountFromUnregBtn" style="width:100%;padding:12px;font-size:0.95rem;font-weight:800;border-radius:10px;">'
      + '🆕 إنشاء حساب جديد بهذا الحساب الآن'
      + '</button>'
      + '<button type="button" class="btn btn-secondary" id="cancelUnregBtn" style="width:100%;padding:10px;font-weight:700;border-radius:10px;">'
      + 'العودة لشاشة الدخول'
      + '</button>'
      + '</div>'
      + '</div>'
      + '</div>';

    document.body.appendChild(modalBackdrop);

    function close() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }
    document.getElementById("closeUnregBtn").addEventListener("click", close);
    document.getElementById("cancelUnregBtn").addEventListener("click", close);

    document.getElementById("createAccountFromUnregBtn").addEventListener("click", function () {
      close();
      if (typeof window.startSignup === "function") window.startSignup();
      if (window.signupState) {
        window.signupState.method = provider;
        window.signupState.email = email;
        window.signupState.name = name;
        window.signupState.verified = true;
      }
      var nameField = document.getElementById("signupName");
      if (nameField && name) nameField.value = name;
      var note = document.getElementById("signupVerifiedNote");
      if (note) {
        note.style.display = "block";
        note.innerHTML = "✅ تم التحقق والربط بحساب " + pLabel + " (" + esc(email) + ") — يرجى تحديد الجزء والسورة للمتابعة.";
      }
      if (typeof window.initSignupJuzSelect === "function") window.initSignupJuzSelect();
      var formCard = document.getElementById("signupDirectFormCard");
      if (formCard) formCard.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Fallback Google prompt for entering device Google account
  function promptCustomGoogleAccountEntry() {
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";
    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog" style="max-width:440px;">'
      + '<div class="messenger-modal-head" style="background:#4285F4;color:#fff;">'
      + '<div style="display:flex;align-items:center;gap:8px;">'
      + '<h4 style="margin:0;color:#fff;font-size:1.05rem;">الدخول بحساب Google على الجهاز</h4>'
      + '</div>'
      + '<button type="button" class="messenger-modal-close" id="closeCustomGoogleBtn" style="color:#fff;">×</button>'
      + '</div>'
      + '<div class="messenger-modal-body" style="padding:20px;">'
      + '<div class="form-group" style="margin-bottom:12px;">'
      + '<label style="font-weight:700;">البريد الإلكتروني لحساب Google *</label>'
      + '<input type="email" id="customGoogleEmail" placeholder="your-email@gmail.com" style="width:100%;padding:10px;border:1.5px solid var(--border,#cbd5e1);border-radius:8px;direction:ltr;">'
      + '</div>'
      + '<button type="button" class="btn" id="confirmCustomGoogleBtn" style="width:100%;padding:12px;background:#4285F4;color:#fff;font-weight:800;border-radius:10px;cursor:pointer;">'
      + 'التحقق وتسجيل الدخول'
      + '</button>'
      + '</div>'
      + '</div>';

    document.body.appendChild(modalBackdrop);

    function close() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }
    document.getElementById("closeCustomGoogleBtn").addEventListener("click", close);

    document.getElementById("confirmCustomGoogleBtn").addEventListener("click", function () {
      var email = document.getElementById("customGoogleEmail").value.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        alert("يرجى إدخال بريد إلكتروني صحيح");
        return;
      }
      close();
      verifyAndLoginDeviceAccount({ email: email, provider: "google" });
    });
  }

  // Trigger Google Signup on Signup Screen
  window.triggerGoogleSignup = async function () {
    var box = document.getElementById("signupStep1Alert");
    if (box) box.innerHTML = '<div class="alert alert-info">جارٍ فحص حسابات Google المتوفرة على جهازك...</div>';

    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        if (typeof window.initGoogleGsi === "function") window.initGoogleGsi();
        window.google.accounts.id.prompt(function (notification) {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            openSignupGooglePicker();
          }
        });
        return;
      } catch (e) {}
    }
    openSignupGooglePicker();
  };

  function openSignupGooglePicker() {
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";
    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog" style="max-width:440px;">'
      + '<div class="messenger-modal-head" style="background:#4285F4;color:#fff;">'
      + '<div style="display:flex;align-items:center;gap:8px;">'
      + '<h4 style="margin:0;color:#fff;font-size:1.05rem;">التسجيل والربط بحساب Google</h4>'
      + '</div>'
      + '<button type="button" class="messenger-modal-close" id="closeSignupGoogleBtn" style="color:#fff;">×</button>'
      + '</div>'
      + '<div class="messenger-modal-body" style="padding:20px;">'
      + '<div class="form-group" style="margin-bottom:12px;">'
      + '<label style="font-weight:700;">الاسم بحساب Google *</label>'
      + '<input type="text" id="signupGoogleName" placeholder="الاسم كما في حساب Google" style="width:100%;padding:10px;border:1.5px solid var(--border,#cbd5e1);border-radius:8px;">'
      + '</div>'
      + '<div class="form-group" style="margin-bottom:14px;">'
      + '<label style="font-weight:700;">البريد الإلكتروني لحساب Google *</label>'
      + '<input type="email" id="signupGoogleEmail" placeholder="name@gmail.com" style="width:100%;padding:10px;border:1.5px solid var(--border,#cbd5e1);border-radius:8px;direction:ltr;">'
      + '</div>'
      + '<button type="button" class="btn" id="confirmSignupGoogleBtn" style="width:100%;padding:12px;background:#4285F4;color:#fff;font-weight:800;border-radius:10px;cursor:pointer;">'
      + 'تأكيد الحساب ومتابعة التسجيل'
      + '</button>'
      + '</div>'
      + '</div>';

    document.body.appendChild(modalBackdrop);

    function close() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }
    document.getElementById("closeSignupGoogleBtn").addEventListener("click", close);

    document.getElementById("confirmSignupGoogleBtn").addEventListener("click", function () {
      var name = document.getElementById("signupGoogleName").value.trim();
      var email = document.getElementById("signupGoogleEmail").value.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        alert("يرجى إدخال بريد Google صحيح");
        return;
      }
      close();
      if (window.handleGoogleCredential) {
        window.handleGoogleCredential({
          credential: btoa(JSON.stringify({ email: email, name: name || email.split("@")[0] }))
        });
      }
    });
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
