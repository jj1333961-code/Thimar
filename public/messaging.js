(function () {
  "use strict";

  var activeContact = { admin: null, student: null, parent: null };
  var cloudIdentity = null;
  var cloudLoadPromise = null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function formatCloudTime(value) {
    var date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? String(value || "") : date.toLocaleString("ar-EG");
  }

  function cloudMessageToLocal(message) {
    return {
      id: message.id,
      cloudId: message.id,
      type: message.senderRole,
      sender: message.senderName,
      senderId: String(message.senderId),
      senderRole: message.senderRole,
      receiverType: message.recipientRole,
      receiverId: message.recipientId,
      receiverName: message.recipientName,
      recipientId: message.recipientId,
      recipientName: message.recipientName,
      recipientRole: message.recipientRole,
      text: message.body,
      time: formatCloudTime(message.createdAt),
      read: Boolean(message.readAt),
      approved: true,
      cloudPersisted: true,
    };
  }

  function mergeCloudMessages(remoteMessages) {
    var local = getData("messages") || [];
    remoteMessages.forEach(function (remote) {
      var normalizedRemote = cloudMessageToLocal(remote);
      var existing = local.find(function (message) {
        return String(message.cloudId || message.id) === String(normalizedRemote.id);
      });
      if (existing) {
        var attachment = existing.attachment;
        Object.assign(existing, normalizedRemote);
        if (attachment) existing.attachment = attachment;
      } else {
        local.push(normalizedRemote);
      }
    });
    setData("messages", local);
    return local;
  }

  function roleForCurrentUser() {
    return typeof currentType === "string" && ["admin", "student", "parent"].indexOf(currentType) >= 0 ? currentType : null;
  }

  async function loadCloudMessages() {
    if (cloudLoadPromise) return cloudLoadPromise;
    cloudLoadPromise = fetch("/api/messages", { cache: "no-store", credentials: "same-origin" })
      .then(function (response) {
        return response.json().then(function (payload) {
          if (!response.ok) throw new Error(payload.error || "messages-unavailable");
          return payload;
        });
      })
      .then(function (payload) {
        cloudIdentity = payload.identity || null;
        if (Array.isArray(payload.messages)) mergeCloudMessages(payload.messages);
        window.dispatchEvent(new Event("cloudmessagesready"));
        var role = roleForCurrentUser();
        if (role) render(role);
        return true;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        cloudLoadPromise = null;
      });
    return cloudLoadPromise;
  }

  function currentActor(role) {
    var ids = [], names = [];
    if (role === "admin") {
      ids.push("admin");
      names.push("المسؤول");
    } else if (role === "student") {
      ids.push(String(currentUser.id));
      names.push(String(currentUser.name || ""));
    } else {
      var parentName = currentUser && currentUser[0] ? currentUser[0].parent : "ولي الأمر";
      ids.push(String(parentName));
      names.push(String(parentName));
    }
    if (cloudIdentity && cloudIdentity.id) ids.push(String(cloudIdentity.id));
    if (cloudIdentity && cloudIdentity.name) names.push(String(cloudIdentity.name));
    return { id: ids[0], ids: ids, role: role, name: names[0], names: names };
  }

  function actor(role) {
    if (role === "admin") return currentActor("admin");
    if (role === "student") return currentActor("student");
    return currentActor("parent");
  }

  function contacts(role) {
    var me = actor(role);
    var result = [];

    // 1. Groups
    var allGroups = getData("messaging_groups") || [];
    var myGroups = allGroups.filter(function (g) {
      if (!g || !g.id) return false;
      if (g.creatorId === me.id || (me.ids && me.ids.indexOf(String(g.creatorId)) >= 0)) return true;
      return Array.isArray(g.members) && g.members.some(function (m) {
        return String(m.id) === String(me.id) || (me.ids && me.ids.indexOf(String(m.id)) >= 0);
      });
    });
    if (myGroups.length > 0) {
      result.push({
        title: "المجموعات (جروبات)",
        items: myGroups.map(function (g) {
          return {
            id: String(g.id),
            role: "group",
            isGroup: true,
            name: g.name,
            subtitle: "مشرف: " + (g.creatorName || "المسؤول") + " (" + (g.members ? g.members.length : 1) + " أعضاء)",
            creatorId: g.creatorId,
            creatorName: g.creatorName,
            members: g.members || []
          };
        })
      });
    }

    // 2. Pending Registration Requests (For Admin)
    if (role === "admin") {
      var requests = getData("joinRequests") || [];
      var pending = requests.filter(function (r) { return r && (r.status === "pending" || r.status === "معلق"); });
      if (pending.length > 0) {
        result.push({
          title: "طلبات الانضمام والحسابات المعلقة (" + pending.length + ")",
          items: pending.map(function (r) {
            return {
              id: String(r.id),
              role: "applicant",
              name: r.name || "مستخدم جديد",
              subtitle: "طلب جديد (" + (r.authProvider || r.provider || "معلق") + ")",
              requestData: r
            };
          })
        });
      }
    }

    // 3. Custom Contacts (Added via + button)
    var custom = getData("custom_contacts") || [];
    var myCustom = custom.filter(function (c) {
      return c && c.ownerId === me.id;
    });
    if (myCustom.length > 0) {
      result.push({
        title: "الأصدقاء وجهات الاتصال المضافة",
        items: myCustom.map(function (c) {
          return {
            id: String(c.id),
            role: c.role || "student",
            name: c.name,
            subtitle: "صديق (" + (c.username || c.national || c.id) + ")"
          };
        })
      });
    }

    // 4. Default Base Contacts
    var students = getData("students") || [];
    if (role === "admin") {
      var parents = [];
      students.forEach(function (student) {
        if (student.parent && !parents.some(function (parent) { return parent.id === student.parent; })) {
          parents.push({ id: student.parent, role: "parent", name: student.parent, subtitle: "ولي أمر" });
        }
      });
      result.push({
        title: "الطلاب",
        items: students.map(function (student) { return { id: String(student.id), role: "student", name: student.name, subtitle: student.username || "طالب" }; })
      });
      result.push({
        title: "أولياء الأمور",
        items: parents
      });
      return result;
    }

    if (role === "student") {
      result.push({
        title: "المسؤول والمعلمون",
        items: [
          { id: "admin", role: "admin", name: "المسؤول", subtitle: "إدارة المنصة" },
          { id: currentUser.parent || "", role: "parent", name: currentUser.parent || "ولي الأمر", subtitle: "ولي الأمر" }
        ].filter(function (item) { return item.id; })
      });
      return result;
    }

    result.push({
      title: "جهات الاتصال",
      items: [{ id: "admin", role: "admin", name: "المسؤول", subtitle: "المعلم" }].concat((currentUser || []).map(function (student) {
        return { id: String(student.id), role: "student", name: student.name, subtitle: "الابن / الابنة" };
      }))
    });
    return result;
  }

  function contactButton(item, role) {
    var selected = activeContact[role] && activeContact[role].role === item.role && activeContact[role].id === item.id;
    var icon = item.isGroup ? "👥" : (item.role === "applicant" ? "⏳" : esc((item.name || "؟").trim().charAt(0)));
    var avatarStyle = item.isGroup ? ' style="background:#4f46e5;"' : (item.role === "applicant" ? ' style="background:#d97706;"' : '');
    return '<button type="button" class="messenger-contact'+(selected ? ' active' : '')+'" data-chat-role="'+esc(role)+'" data-contact-role="'+esc(item.role)+'" data-contact-id="'+esc(item.id)+'">'+
      '<span class="messenger-avatar"'+avatarStyle+' aria-hidden="true">'+icon+'</span><span class="messenger-contact-copy"><span class="messenger-contact-name">'+esc(item.name)+'</span><span class="messenger-contact-role">'+esc(item.subtitle)+'</span></span></button>';
  }

  function render(role) {
    var host = document.getElementById(role === "admin" ? "messagesList" : role + "InboxList");
    if (!host) return;
    var groups = contacts(role);
    var list = groups.map(function (group) {
      return '<div class="messenger-group-title">'+esc(group.title)+'</div>'+group.items.map(function (item) { return contactButton(item, role); }).join("");
    }).join("");
    host.innerHTML = '<div class="messenger-shell'+(activeContact[role] ? ' has-selection' : '')+'" data-messenger="'+role+'"><aside class="messenger-contacts"><div class="messenger-contacts-head"><div class="messenger-head-row"><h3>المحادثات <span class="messenger-unread-summary" data-message-badge="'+(role === "admin" ? "admin" : "student")+'" hidden></span></h3><button type="button" class="messenger-add-action-btn" id="messengerAddActionBtn" title="خيارات إضافية: عمل جروب أو إضافة صديق">+</button></div><p>اختر محادثة لبدء الدردشة</p></div>'+list+'</aside><section class="messenger-chat">'+(activeContact[role] ? chatHtml(role) : '<div class="messenger-placeholder">اختر محادثة من القائمة لعرض الرسائل أو اضغط (+) لعمل جروب / إضافة صديق</div>')+'</section></div>';
    bind(host, role);
    scrollThread(host);
    updateBadges();
    if (window.__thimarCloudDataReady && !cloudIdentity) loadCloudMessages();
  }

  function voiceAudioHTML(message) {
    if (!message.attachment || String(message.attachment.type || "").indexOf("audio/") !== 0) return "";
    return '<audio class="messenger-audio" controls preload="metadata" src="'+message.attachment.data+'"></audio>';
  }

  function attachmentHTML(message, role) {
    if (!message.attachment || !message.attachment.data) return "";
    var file = message.attachment;
    var type = String(file.type || "");
    var media = type.indexOf("image/") === 0 ? '<img class="messenger-attachment-image" src="'+file.data+'" alt="'+esc(file.name)+'">' : type.indexOf("audio/") === 0 ? '<audio class="messenger-audio" controls preload="metadata" src="'+file.data+'"></audio>' : type === "application/pdf" ? '<iframe class="messenger-attachment-pdf" title="'+esc(file.name)+'" src="'+file.data+'"></iframe>' : '<div class="messenger-file-preview">معاينة داخلية غير متاحة لهذا النوع</div>';
    var status = message.attachmentStatus || (message.senderRole === "student" ? "pending" : "approved");
    var statusText = status === "pending" ? "بانتظار مراجعة المسؤول" : status === "approved" ? "تم قبول الملف" : "تم رفض الملف";
    var review = role === "admin" && status === "pending" ? '<div class="messenger-review-actions"><button type="button" class="messenger-approve" data-review="approved" data-message-id="'+esc(message.id)+'">موافقة</button><button type="button" class="messenger-reject" data-review="rejected" data-message-id="'+esc(message.id)+'">رفض</button></div>' : '';
    return '<div class="messenger-attachment"><div class="messenger-attachment-preview">'+media+'</div><div class="messenger-attachment-meta"><strong>'+esc(file.name)+'</strong><span>'+esc(file.type || "ملف")+'</span><span class="messenger-file-status '+status+'">'+statusText+'</span><button type="button" class="messenger-view-file" data-view-file="'+esc(message.id)+'">عرض داخل الموقع</button></div></div>'+review;
  }

  function messageForId(id) {
    return (getData("messages") || []).find(function (message) { return String(message.id) === String(id); });
  }

  function addStatusMessage(source, status) {
    var messages = getData("messages") || [];
    var recipientRole = source.senderRole || source.type || "student";
    var recipientId = String(source.senderId || source.sender || "");
    var text = status === "approved" ? "تم قبول الملف المرسل واعتماده بنجاح." : "تم رفض الملف. يرجى إرسال ملف آخر للمراجعة.";
    if (messages.some(function (message) { return message.sourceMessageId === source.id && message.attachmentStatus === status; })) return;
    messages.push({ id: "status-" + source.id + "-" + status, senderRole: "admin", senderId: "admin", sender: "المسؤول", recipientRole: recipientRole, recipientId: recipientId, receiverType: recipientRole, receiverId: recipientId, text: text, sourceMessageId: source.id, attachmentStatus: status, read: false, time: new Date().toLocaleString("ar-EG") });
    setData("messages", messages);
  }

  function reviewAttachment(id, status) {
    var messages = getData("messages") || [], message = messageForId(id);
    if (!message || !message.attachment) return;
    message.attachmentStatus = status;
    message.approved = status === "approved";
    message.rejected = status === "rejected";
    addStatusMessage(message, status);
    setData("messages", messages);
    render("admin");
    showToast(status === "approved" ? "تم قبول الملف وإرسال إشعار للطالب" : "تم رفض الملف وإرسال إشعار للطالب", status === "approved" ? "success" : "error");
  }

  function endpointMatches(id, name, expected) {
    return expected.ids.some(function (value) { return String(id) === String(value); }) || expected.names.some(function (value) { return value && String(name || "") === String(value); });
  }

  function normalized(message) {
    var fromRole = message.senderRole || message.type || "admin";
    var fromId = message.senderId != null ? String(message.senderId) : (fromRole === "admin" ? "admin" : String(message.sender || ""));
    var toRole = message.recipientRole || message.receiverType || (fromRole === "admin" ? "student" : "admin");
    var toId = message.recipientId != null ? String(message.recipientId) : message.receiverId != null ? String(message.receiverId) : message.receiverName ? String(message.receiverName) : (toRole === "admin" ? "admin" : "");
    if (fromRole === "parent" && (!fromId || fromId === "0")) fromId = String(message.sender || "");
    return { raw: message, fromRole: fromRole, fromId: fromId, toRole: toRole, toId: toId };
  }

  function isBetween(message, me, contact) {
    if (contact.isGroup || contact.role === "group") {
      return String(message.groupId) === String(contact.id) || String(message.recipientId) === String(contact.id) || String(message.receiverId) === String(contact.id);
    }
    if (contact.role === "applicant") {
      return String(message.senderId) === String(contact.id) || String(message.recipientId) === String(contact.id) || String(message.receiverId) === String(contact.id);
    }
    var item = normalized(message);
    return (item.fromRole === me.role && endpointMatches(item.fromId, message.senderName || message.sender, me) && item.toRole === contact.role && item.toId === contact.id) ||
      (item.fromRole === contact.role && item.fromId === contact.id && item.toRole === me.role && endpointMatches(item.toId, message.recipientName, me));
  }

  function allContacts(role) {
    return contacts(role).reduce(function (list, group) { return list.concat(group.items); }, []);
  }

  function markCloudMessagesRead(ids) {
    var validIds = ids.map(function (id) { return Number(id); }).filter(function (id) { return Number.isSafeInteger(id) && id > 0; });
    if (!validIds.length) return;
    fetch("/api/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify({ ids: validIds }) }).catch(function () {});
  }

  function markVisibleMessagesRead(role, contact) {
    var me = actor(role), messages = getData("messages") || [], changed = false, cloudIds = [];
    messages.forEach(function (message) {
      if (isBetween(message, me, contact) && normalized(message).toRole === me.role && !message.read) {
        message.read = true;
        changed = true;
        if (message.cloudPersisted || (message.cloudId && Number.isSafeInteger(Number(message.cloudId)))) cloudIds.push(message.cloudId || message.id);
      }
    });
    if (changed) setData("messages", messages);
    if (cloudIds.length) markCloudMessagesRead(cloudIds);
  }

  function updateBadges() {
    var messages = getData("messages") || [];
    var adminUnread = messages.filter(function (m) { return (m.recipientRole === "admin" || m.receiverType === "admin" || !m.receiverType) && !m.read; }).length;
    var studentUnread = currentUser && currentType === "student" ? messages.filter(function (m) { return String(m.recipientId || m.receiverId) === String(currentUser.id) && !m.read; }).length : 0;
    document.querySelectorAll("[data-message-badge]").forEach(function (badge) { var count = badge.dataset.messageBadge === "admin" ? adminUnread : studentUnread; badge.textContent = count; badge.hidden = count === 0; });
    var legacy = document.getElementById("msgBadge"); if (legacy) { legacy.textContent = adminUnread; legacy.classList.toggle("hidden", adminUnread === 0); }
  }

  function chatHtml(role) {
    var contact = activeContact[role];
    if (!contact) return '<div class="messenger-placeholder">اختر شخصًا أو مجموعة لبدء المحادثة</div>';
    var me = actor(role);
    markVisibleMessagesRead(role, contact);
    var messages = (getData("messages") || []).filter(function (message) { return isBetween(message, me, contact); });
    var thread = messages.length ? messages.map(function (message) {
      var item = normalized(message);
      var sent = item.fromRole === me.role && endpointMatches(item.fromId, message.senderName || message.sender, me);
      var senderLabel = (contact.isGroup && !sent) ? '<div style="font-size:0.75rem;font-weight:700;color:var(--primary);margin-bottom:3px;">'+esc(message.sender || message.senderName || "عضو")+'</div>' : '';
      return '<article class="messenger-bubble '+(sent ? 'sent' : 'received')+'">'+senderLabel+(message.text ? '<p>'+esc(message.text)+'</p>' : '')+voiceAudioHTML(message)+attachmentHTML(message, role)+'<time>'+esc(message.time || "")+'</time></article>';
    }).join("") : '<div class="messenger-empty">لا توجد رسائل بعد. ابدأ المحادثة الآن.</div>';

    // Group Creator Check
    var isCreator = contact.isGroup && (contact.creatorId === me.id || (me.ids && me.ids.indexOf(String(contact.creatorId)) >= 0));

    // Applicant Status Banner for Admin
    var applicantBanner = "";
    if (role === "admin" && contact.role === "applicant") {
      applicantBanner = '<div class="messenger-applicant-status-banner">' +
        '<div class="messenger-applicant-status-text">⚠️ حساب معلق: طلب انضمام جديد باسم ('+esc(contact.name)+') بانتظار القرار</div>' +
        '<div class="messenger-applicant-actions">' +
        '<button type="button" class="messenger-applicant-btn approve" data-applicant-action="approve" data-applicant-id="'+esc(contact.id)+'">✅ موافقة وتفعيل</button>' +
        '<button type="button" class="messenger-applicant-btn reject" data-applicant-action="reject" data-applicant-id="'+esc(contact.id)+'">❌ رفض الطلب</button>' +
        '<button type="button" class="messenger-applicant-btn ban" data-applicant-action="ban" data-applicant-id="'+esc(contact.id)+'">🚫 حظر الحساب</button>' +
        '</div></div>';
    }

    var avatarIcon = contact.isGroup ? "👥" : (contact.role === "applicant" ? "⏳" : esc(contact.name.charAt(0)));
    var avatarStyle = contact.isGroup ? ' style="background:#4f46e5;"' : (contact.role === "applicant" ? ' style="background:#d97706;"' : '');

    var groupMenuHtml = "";
    if (contact.isGroup) {
      groupMenuHtml = 
        '<div class="messenger-group-menu-wrap">' +
          '<button type="button" class="messenger-dots-btn" id="groupMenuTriggerBtn" title="خيارات المجموعة">' +
            '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' +
              '<circle cx="12" cy="5" r="2.2"></circle>' +
              '<circle cx="12" cy="12" r="2.2"></circle>' +
              '<circle cx="12" cy="19" r="2.2"></circle>' +
            '</svg>' +
          '</button>' +
          '<div class="messenger-dots-dropdown" id="groupMenuDropdown">' +
            '<button type="button" class="messenger-dots-item" data-group-action="info" data-group-id="'+esc(contact.id)+'">' +
              '<span>👥</span><span>معلومات المجموعة ('+((contact.members || []).length)+' أعضاء)</span>' +
            '</button>' +
            '<button type="button" class="messenger-dots-item" data-group-action="add-member" data-group-id="'+esc(contact.id)+'">' +
              '<span>➕</span><span>إضافة أعضاء للمجموعة</span>' +
            '</button>' +
            '<button type="button" class="messenger-dots-item" data-group-action="clear-chat" data-group-id="'+esc(contact.id)+'">' +
              '<span>🧹</span><span>مسح محتوى المحادثة</span>' +
            '</button>' +
            '<div class="messenger-dots-divider"></div>' +
            '<button type="button" class="messenger-dots-item text-warning" data-group-action="leave-group" data-group-id="'+esc(contact.id)+'">' +
              '<span>🚪</span><span>مغادرة المجموعة</span>' +
            '</button>' +
            (isCreator ? 
              '<button type="button" class="messenger-dots-item text-danger" data-group-action="delete-group" data-group-id="'+esc(contact.id)+'">' +
                '<span>🗑️</span><span>حذف المجموعة نهائياً</span>' +
              '</button>' : '') +
          '</div>' +
        '</div>';
    }

    return '<header class="messenger-chat-head">' +
      '<div class="messenger-chat-head-user">' +
        '<button type="button" class="messenger-back" aria-label="العودة إلى المحادثات">رجوع</button>' +
        '<span class="messenger-avatar"'+avatarStyle+' aria-hidden="true">'+avatarIcon+'</span>' +
        '<div><strong>'+esc(contact.name)+'</strong><div class="messenger-contact-role">'+esc(contact.subtitle)+'</div></div>' +
      '</div>' +
      '<div class="messenger-call-tools">' +
        '<button type="button" class="messenger-call-btn" data-call-type="video" title="بدء مكالمة فيديو">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>' +
        '</button>' +
        '<button type="button" class="messenger-call-btn" data-call-type="audio" title="بدء مكالمة هاتفية">' +
          '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>' +
        '</button>' +
        groupMenuHtml +
      '</div>' +
      '</header>' +
      applicantBanner +
      '<div class="messenger-thread" aria-live="polite">'+thread+'</div>' +
      '<div class="messenger-preview" hidden></div>' +
      /* SCREENSHOT-MATCHED COMPOSER */
      '<div class="messenger-composer-pill-bar">' +
        '<button type="button" class="messenger-pill-action messenger-pill-voice" id="messengerVoiceBtn" title="تسجيل صوتي">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>' +
            '<path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>' +
            '<line x1="12" y1="19" x2="12" y2="23"></line>' +
            '<line x1="8" y1="23" x2="16" y2="23"></line>' +
          '</svg>' +
        '</button>' +
        '<label class="messenger-pill-action messenger-pill-file" title="إرفاق ملف">' +
          '<input class="messenger-file" type="file" hidden>' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>' +
          '</svg>' +
        '</label>' +
        '<div class="messenger-pill-input-box">' +
          '<textarea rows="1" aria-label="نص الرسالة" placeholder="اكتب سؤالك أو استفسارك هنا"></textarea>' +
        '</div>' +
        '<button type="button" class="messenger-send-pill-btn">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="22" y1="2" x2="11" y2="13"></line>' +
            '<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>' +
          '</svg>' +
          '<span>إرسال</span>' +
        '</button>' +
      '</div>';
  }

  function persistCloudMessage(message) {
    return fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(message) })
      .then(function (response) {
        return response.json().then(function (payload) {
          if (!response.ok || !payload.saved || !payload.message) throw new Error(payload.error || "message-not-saved");
          return payload.message;
        });
      })
      .catch(function () { return null; });
  }

  // ===== VIDEO / AUDIO CALL SCREEN =====
  function openCallScreen(role, contact, callType) {
    var isVideo = callType === "video";
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";

    var callDurationSeconds = 0;
    var timerInterval = null;
    var ringInterval = null;
    var noAnswerTimeout = null;
    var ringingTimeout = null;
    var localStream = null;
    var isMuted = false;
    var isCameraOff = false;
    var callState = "calling"; // 'calling', 'ringing', 'connected', 'busy', 'no_answer', 'ended'

    // Web Audio Tone Generator for Ringing / Busy sounds
    var audioCtx = null;
    try {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    } catch(e){}

    function playTone(freq, duration, type) {
      if (!audioCtx) return;
      try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch(err){}
    }

    function startRingingSound() {
      // Ring tone every 3 seconds (two gentle chimes)
      playTone(440, 0.4);
      setTimeout(function(){ playTone(480, 0.6); }, 200);
      ringInterval = setInterval(function(){
        if (callState !== 'calling' && callState !== 'ringing') {
          clearInterval(ringInterval);
          return;
        }
        playTone(440, 0.4);
        setTimeout(function(){ playTone(480, 0.6); }, 200);
      }, 3000);
    }

    function playBusySound() {
      if (ringInterval) clearInterval(ringInterval);
      for (var i = 0; i < 3; i++) {
        setTimeout(function(){ playTone(480, 0.25, 'triangle'); }, i * 350);
      }
    }

    modalBackdrop.innerHTML = '<div class="messenger-call-screen">' +
      '<div style="font-size:0.9rem;opacity:0.85;margin-bottom:8px;">' + (isVideo ? '📹 مكالمة فيديو' : '📞 مكالمة صوتية') + '</div>' +
      '<h3 style="margin:0 0 4px;font-size:1.3rem;">' + esc(contact.name) + '</h3>' +
      '<div id="callStatusText" style="font-size:0.9rem;color:#6ee7b7;margin-bottom:14px;font-weight:700;">جارٍ الاتصال بالشبكة...</div>' +
      (isVideo ?
        '<div class="messenger-call-video-container">' +
          '<div style="width:100%;height:100%;display:grid;place-items:center;background:#062319;">' +
            '<div class="messenger-call-avatar">' + esc(contact.name.charAt(0)) + '</div>' +
          '</div>' +
          '<video id="callSelfVideo" class="messenger-call-self-video" autoplay playsinline muted></video>' +
        '</div>'
        :
        '<div class="messenger-call-avatar">' + esc(contact.name.charAt(0)) + '</div>'
      ) +
      '<div id="callSimulateBox" style="margin:12px 0 16px;">' +
        '<button type="button" id="callAnswerSimBtn" style="background:#059669;color:#fff;border:none;padding:7px 14px;border-radius:20px;font-size:12px;font-weight:800;cursor:pointer;">' +
          '📞 محاكاة رد ' + esc(contact.name) + ' (بدء التحدث)' +
        '</button>' +
      '</div>' +
      '<div class="messenger-call-controls">' +
        '<button type="button" class="messenger-call-action-btn" id="callMuteBtn" style="background:#1e3a30;color:#fff;" title="كتم الصوت">🎙️</button>' +
        (isVideo ? '<button type="button" class="messenger-call-action-btn" id="callCamBtn" style="background:#1e3a30;color:#fff;" title="إيقاف الكاميرا">📷</button>' : '') +
        '<button type="button" class="messenger-call-action-btn messenger-call-end-btn" id="callEndBtn" title="إنهاء المكالمة">🔴</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(modalBackdrop);

    function formatTime(s) {
      var m = Math.floor(s / 60);
      var sec = s % 60;
      return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
    }

    // Try camera/audio access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true }).then(function (stream) {
        localStream = stream;
        if (isVideo) {
          var vid = document.getElementById("callSelfVideo");
          if (vid) vid.srcObject = stream;
        }
      }).catch(function () {});
    }

    // Progression: calling -> ringing -> no-answer
    startRingingSound();

    ringingTimeout = setTimeout(function () {
      if (callState === "calling") {
        callState = "ringing";
        var statusEl = document.getElementById("callStatusText");
        if (statusEl) {
          statusEl.textContent = "🔔 يرن الآن لدى " + contact.name + "...";
          statusEl.style.color = "#a7f3d0";
        }
      }
    }, 1800);

    // If 14 seconds pass without answer: marked as No Answer (فائتة)
    noAnswerTimeout = setTimeout(function () {
      if (callState === "calling" || callState === "ringing") {
        callState = "no_answer";
        if (ringInterval) clearInterval(ringInterval);
        playBusySound();
        var statusEl = document.getElementById("callStatusText");
        if (statusEl) {
          statusEl.textContent = "📵 لم يتم الرد — المستخدم غير متاح حالياً";
          statusEl.style.color = "#f87171";
        }
        var simBox = document.getElementById("callSimulateBox");
        if (simBox) simBox.style.display = "none";

        setTimeout(function(){
          closeAndLogCall("لم يتم الرد (مكالمة فائتة)");
        }, 2200);
      }
    }, 14000);

    // Simulate answering the call
    function connectCall() {
      if (callState === "connected" || callState === "busy" || callState === "no_answer") return;
      callState = "connected";
      clearTimeout(noAnswerTimeout);
      clearTimeout(ringingTimeout);
      if (ringInterval) clearInterval(ringInterval);

      var simBox = document.getElementById("callSimulateBox");
      if (simBox) simBox.style.display = "none";

      var statusEl = document.getElementById("callStatusText");
      if (statusEl) {
        statusEl.textContent = "متصل الآن — 00:00";
        statusEl.style.color = "#34d399";
      }

      timerInterval = setInterval(function () {
        callDurationSeconds++;
        var el = document.getElementById("callStatusText");
        if (el) el.textContent = "متصل الآن — " + formatTime(callDurationSeconds);
      }, 1000);
    }

    var answerBtn = document.getElementById("callAnswerSimBtn");
    if (answerBtn) {
      answerBtn.addEventListener("click", connectCall);
    }

    function closeAndLogCall(customReason) {
      clearTimeout(noAnswerTimeout);
      clearTimeout(ringingTimeout);
      if (ringInterval) clearInterval(ringInterval);
      if (timerInterval) clearInterval(timerInterval);
      if (localStream) {
        localStream.getTracks().forEach(function (t) { t.stop(); });
      }
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);

      // Log call into messages thread
      var me = actor(role);
      var textDetail = "";
      if (customReason) {
        textDetail = customReason;
      } else if (callDurationSeconds > 0) {
        textDetail = "(المدة: " + formatTime(callDurationSeconds) + ")";
      } else {
        textDetail = "لم يُرد عليها (الطرف الآخر مشغول)";
      }

      var callLog = {
        id: "call-" + Date.now(),
        senderRole: me.role,
        senderId: me.id,
        sender: me.name,
        recipientRole: contact.role,
        recipientId: contact.id,
        groupId: contact.isGroup ? contact.id : undefined,
        text: (isVideo ? "📹 مكالمة فيديو " : "📞 مكالمة صوتية ") + textDetail,
        time: new Date().toLocaleString("ar-EG"),
        read: true
      };
      var msgs = getData("messages") || [];
      msgs.push(callLog);
      setData("messages", msgs);
      render(role);
    }

    function handleEndCallClick() {
      if (callState === "calling" || callState === "ringing") {
        // User hung up while ringing: play busy tone and show busy state as requested!
        callState = "busy";
        clearTimeout(noAnswerTimeout);
        clearTimeout(ringingTimeout);
        if (ringInterval) clearInterval(ringInterval);
        playBusySound();

        var statusEl = document.getElementById("callStatusText");
        if (statusEl) {
          statusEl.textContent = "📵 تم إنهاء المكالمة — الطرف الآخر مشغول";
          statusEl.style.color = "#fbbf24";
        }
        var simBox = document.getElementById("callSimulateBox");
        if (simBox) simBox.style.display = "none";

        setTimeout(function(){
          closeAndLogCall("لم يُرد عليها (الطرف الآخر مشغول)");
        }, 1500);
      } else {
        closeAndLogCall();
      }
    }

    document.getElementById("callEndBtn").addEventListener("click", handleEndCallClick);

    var muteBtn = document.getElementById("callMuteBtn");
    if (muteBtn) {
      muteBtn.addEventListener("click", function () {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? "🔇" : "🎙️";
        muteBtn.style.background = isMuted ? "#dc2626" : "#1e3a30";
        if (localStream) {
          localStream.getAudioTracks().forEach(function (t) { t.enabled = !isMuted; });
        }
      });
    }

    var camBtn = document.getElementById("callCamBtn");
    if (camBtn) {
      camBtn.addEventListener("click", function () {
        isCameraOff = !isCameraOff;
        camBtn.textContent = isCameraOff ? "🚫" : "📷";
        camBtn.style.background = isCameraOff ? "#dc2626" : "#1e3a30";
        if (localStream) {
          localStream.getVideoTracks().forEach(function (t) { t.enabled = !isCameraOff; });
        }
      });
    }
  }

  // ===== (+) ACTION MODAL (CREATE GROUP / ADD CONTACT) =====
  function openAddActionModal(role) {
    var me = actor(role);
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";

    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog">' +
      '<div class="messenger-modal-head">' +
        '<h4>خيارات التواصل والمحادثات</h4>' +
        '<button type="button" class="messenger-modal-close" id="closeAddModal">×</button>' +
      '</div>' +
      '<div class="messenger-modal-body">' +
        '<button type="button" class="btn btn-primary" id="openCreateGroupBtn" style="padding:14px;font-size:1rem;display:flex;align-items:center;justify-content:center;gap:10px;">' +
          '<span>👥</span> <strong>إنشاء مجموعة جديدة (جروب)</strong>' +
        '</button>' +
        '<button type="button" class="btn btn-outline" id="openAddFriendBtn" style="padding:14px;font-size:1rem;display:flex;align-items:center;justify-content:center;gap:10px;">' +
          '<span>👤</span> <strong>إضافة صديق / مستخدم جديد</strong>' +
        '</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(modalBackdrop);

    function close() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }

    document.getElementById("closeAddModal").addEventListener("click", close);
    modalBackdrop.addEventListener("click", function (e) { if (e.target === modalBackdrop) close(); });

    document.getElementById("openCreateGroupBtn").addEventListener("click", function () {
      close();
      openCreateGroupModal(role);
    });

    document.getElementById("openAddFriendBtn").addEventListener("click", function () {
      close();
      openAddFriendModal(role);
    });
  }

  // Modal: Create Group
  function openCreateGroupModal(role) {
    var me = actor(role);
    var availableContacts = allContacts(role).filter(function (c) { return !c.isGroup; });
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";

    var contactsCheckboxes = availableContacts.map(function (c) {
      return '<label style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid var(--border);cursor:pointer;">' +
        '<input type="checkbox" value="'+esc(c.id)+'" data-role="'+esc(c.role)+'" data-name="'+esc(c.name)+'" style="width:18px;height:18px;">' +
        '<span><strong>'+esc(c.name)+'</strong> ('+esc(c.subtitle || c.role)+')</span>' +
      '</label>';
    }).join("");

    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog">' +
      '<div class="messenger-modal-head">' +
        '<h4>👥 إنشاء مجموعة جديدة (جروب)</h4>' +
        '<button type="button" class="messenger-modal-close" id="closeCreateGroup">×</button>' +
      '</div>' +
      '<div class="messenger-modal-body">' +
        '<div class="form-group">' +
          '<label>اسم المجموعة *</label>' +
          '<input type="text" id="newGroupName" placeholder="اكتب اسم المجموعة (مثلاً: حلقة تحفيظ، نقاش المعلمين)" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;">' +
        '</div>' +
        '<div class="form-group">' +
          '<label>اختر الأعضاء من جهات الاتصال الخاصة بك:</label>' +
          '<div style="max-height:180px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px;">' +
            (contactsCheckboxes || '<div style="padding:10px;color:var(--text-light);text-align:center;">لا توجد جهات اتصال متاحة حالياً</div>') +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn btn-success" id="submitCreateGroupBtn" style="width:100%;padding:12px;">✅ تأكيد إنشاء المجموعة</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(modalBackdrop);

    function close() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }

    document.getElementById("closeCreateGroup").addEventListener("click", close);

    document.getElementById("submitCreateGroupBtn").addEventListener("click", function () {
      var nameInput = document.getElementById("newGroupName");
      var name = nameInput ? nameInput.value.trim() : "";
      if (!name) {
        showToast("يرجى كتابة اسم المجموعة أولاً", "error");
        return;
      }

      var selectedMembers = [{ id: me.id, name: me.name, role: me.role }];
      modalBackdrop.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
        selectedMembers.push({ id: cb.value, name: cb.dataset.name, role: cb.dataset.role });
      });

      var newGroup = {
        id: "grp-" + Date.now(),
        name: name,
        creatorId: me.id,
        creatorName: me.name,
        creatorRole: me.role,
        members: selectedMembers,
        createdAt: new Date().toLocaleString("ar-EG")
      };

      var groups = getData("messaging_groups") || [];
      groups.push(newGroup);
      setData("messaging_groups", groups);

      // Post initial message
      var msgs = getData("messages") || [];
      msgs.push({
        id: "msg-" + Date.now(),
        groupId: newGroup.id,
        senderRole: me.role,
        senderId: me.id,
        sender: me.name,
        recipientRole: "group",
        recipientId: newGroup.id,
        text: "🎉 تم إنشاء المجموعة (" + name + ") بواسطة مشرف المجموعة: " + me.name,
        time: new Date().toLocaleString("ar-EG"),
        read: true
      });
      setData("messages", msgs);

      close();
      activeContact[role] = {
        id: newGroup.id,
        role: "group",
        isGroup: true,
        name: newGroup.name,
        subtitle: "مشرف: " + me.name + " (" + newGroup.members.length + " أعضاء)",
        creatorId: me.id,
        creatorName: me.name,
        members: newGroup.members
      };
      render(role);
      showToast("تم إنشاء المجموعة بنجاح!", "success");
    });
  }

  // Modal: Add Friend / Contact
  function openAddFriendModal(role) {
    var me = actor(role);
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";

    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog">' +
      '<div class="messenger-modal-head">' +
        '<h4>👤 إضافة صديق أو مستخدم جديد</h4>' +
        '<button type="button" class="messenger-modal-close" id="closeAddFriend">×</button>' +
      '</div>' +
      '<div class="messenger-modal-body">' +
        '<p style="color:var(--text-light);font-size:0.88rem;margin:0;">أدخل اسم المستخدم أو كود الهوية الوطنية / جواز السفر لإضافته إلى قائمة الأصدقاء والمحادثات.</p>' +
        '<div class="form-group">' +
          '<label>اسم المستخدم أو كود الهوية *</label>' +
          '<input type="text" id="friendIdentifierInput" placeholder="أدخل اسم المستخدم أو الرقم القومي أو المعرّف" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;">' +
        '</div>' +
        '<div id="addFriendFeedback"></div>' +
        '<button type="button" class="btn btn-primary" id="searchAndAddFriendBtn" style="width:100%;padding:12px;">🔍 بحث وإضافة الصديق</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(modalBackdrop);

    function close() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }

    document.getElementById("closeAddFriend").addEventListener("click", close);

    document.getElementById("searchAndAddFriendBtn").addEventListener("click", function () {
      var input = document.getElementById("friendIdentifierInput");
      var val = input ? input.value.trim() : "";
      if (!val) {
        showToast("يرجى إدخال اسم المستخدم أو كود الهوية", "error");
        return;
      }

      var students = getData("students") || [];
      var parents = getData("parents") || [];
      var allRegisteredUsers = [];

      students.forEach(function(s) {
        allRegisteredUsers.push({
          id: String(s.id),
          role: "student",
          name: s.name,
          username: s.username || "",
          national: s.national || "",
          subtitle: "طالب مسجل"
        });
      });

      parents.forEach(function(p) {
        allRegisteredUsers.push({
          id: String(p.id),
          role: "parent",
          name: p.name,
          username: p.username || "",
          national: p.national || "",
          subtitle: "ولي أمر مسجل"
        });
      });

      var q = val.toLowerCase();
      var found = allRegisteredUsers.find(function (u) {
        return (u.username && u.username.toLowerCase() === q) ||
               (u.national && u.national === val) ||
               (u.name && u.name.toLowerCase() === q) ||
               (u.id === val);
      });

      if (!found) {
        showToast("❌ هذا المستخدم غير مسجل في تطبيق ثمار", "error");
        var fb = document.getElementById("addFriendFeedback");
        if (fb) {
          fb.innerHTML = '<div style="color:#ef4444;font-size:0.86rem;margin-top:10px;padding:8px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;font-weight:700;">' +
            '❌ هذا المستخدم غير مسجل في تطبيق ثمار. يرجى التأكد من اسم المستخدم أو رقم الهوية المسجل به في التطبيق.' +
          '</div>';
        }
        return;
      }

      if (String(found.id) === String(me.id) || (me.ids && me.ids.indexOf(String(found.id)) >= 0)) {
        showToast("⚠️ لا يمكنك إضافة حسابك الخاص كصديق في المحادثات", "error");
        return;
      }

      var friendData = {
        id: String(found.id),
        role: found.role,
        name: found.name,
        username: found.username || found.national || found.name,
        national: found.national || "",
        subtitle: found.subtitle,
        ownerId: String(me.id)
      };

      var custom = getData("custom_contacts") || [];
      // Add for me
      if (!custom.some(function (c) { return String(c.ownerId) === String(me.id) && String(c.id) === String(friendData.id); })) {
        custom.push(friendData);
      }
      // Add for the other user (bidirectional real chat relation)
      if (!custom.some(function (c) { return String(c.ownerId) === String(friendData.id) && String(c.id) === String(me.id); })) {
        custom.push({
          id: String(me.id),
          role: me.role,
          name: me.name,
          username: me.username || me.name,
          national: me.national || "",
          subtitle: "صديق مسجل (" + me.name + ")",
          ownerId: String(friendData.id)
        });
      }
      setData("custom_contacts", custom);

      close();
      activeContact[role] = {
        id: friendData.id,
        role: friendData.role,
        name: friendData.name,
        subtitle: "صديق (" + friendData.username + ")"
      };
      render(role);
      showToast("✅ تم العثور على الصديق المسجل بنجاح وإضافته للمحادثات", "success");
    });
  }

  // Modal: Add Member to existing Group (Creator Only)
  function openAddGroupMemberModal(role, groupId) {
    var groups = getData("messaging_groups") || [];
    var group = groups.find(function (g) { return String(g.id) === String(groupId); });
    if (!group) return;

    var existingMemberIds = (group.members || []).map(function (m) { return String(m.id); });
    var availableContacts = allContacts(role).filter(function (c) {
      return !c.isGroup && existingMemberIds.indexOf(String(c.id)) < 0;
    });

    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";

    var listHtml = availableContacts.map(function (c) {
      return '<label style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid var(--border);cursor:pointer;">' +
        '<input type="checkbox" value="'+esc(c.id)+'" data-role="'+esc(c.role)+'" data-name="'+esc(c.name)+'" style="width:18px;height:18px;">' +
        '<span><strong>'+esc(c.name)+'</strong> ('+esc(c.subtitle || c.role)+')</span>' +
      '</label>';
    }).join("");

    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog">' +
      '<div class="messenger-modal-head">' +
        '<h4>➕ إضافة أعضاء إلى ('+esc(group.name)+')</h4>' +
        '<button type="button" class="messenger-modal-close" id="closeAddMemberModal">×</button>' +
      '</div>' +
      '<div class="messenger-modal-body">' +
        '<div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:6px;">' +
          (listHtml || '<div style="padding:14px;color:var(--text-light);text-align:center;">جميع جهات اتصالك مضافة بالفعل في هذه المجموعة</div>') +
        '</div>' +
        '<button type="button" class="btn btn-success" id="confirmAddMembersBtn" style="width:100%;padding:12px;">✅ إضافة الأعضاء المحددين</button>' +
      '</div>' +
    '</div>';

    document.body.appendChild(modalBackdrop);

    function close() {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    }

    document.getElementById("closeAddMemberModal").addEventListener("click", close);

    document.getElementById("confirmAddMembersBtn").addEventListener("click", function () {
      var added = [];
      modalBackdrop.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
        var member = { id: cb.value, name: cb.dataset.name, role: cb.dataset.role };
        group.members.push(member);
        added.push(member.name);
      });

      if (added.length === 0) {
        showToast("لم تقم بتحديد أي عضو لإضافته", "info");
        return;
      }

      setData("messaging_groups", groups);

      // Post in chat
      var me = actor(role);
      var msgs = getData("messages") || [];
      msgs.push({
        id: "msg-" + Date.now(),
        groupId: group.id,
        senderRole: me.role,
        senderId: me.id,
        sender: me.name,
        recipientRole: "group",
        recipientId: group.id,
        text: "➕ قام مشرف المجموعة بإضافة: " + added.join("، "),
        time: new Date().toLocaleString("ar-EG"),
        read: true
      });
      setData("messages", msgs);

      close();
      if (activeContact[role] && activeContact[role].id === group.id) {
        activeContact[role].members = group.members;
        activeContact[role].subtitle = "مشرف: " + group.creatorName + " (" + group.members.length + " أعضاء)";
      }
      render(role);
      showToast("تمت إضافة الأعضاء بنجاح!", "success");
    });
  }

  // Modal: Group Info & Members List
  function openGroupInfoModal(group) {
    var modalBackdrop = document.createElement("div");
    modalBackdrop.className = "messenger-modal-backdrop";

    var membersListHtml = (group.members || []).map(function (m) {
      var isAdm = (String(m.id) === String(group.creatorId));
      return '<li style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid var(--border);">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<span style="width:34px;height:34px;border-radius:50%;background:#e0e7ff;color:#4338ca;display:inline-grid;place-items:center;font-weight:800;font-size:14px;">' + esc(m.name.charAt(0)) + '</span>' +
          '<div><strong>' + esc(m.name) + '</strong><div style="font-size:0.75rem;color:var(--text-light);">' + (m.role === 'admin' ? 'إدارة' : (m.role === 'parent' ? 'ولي أمر' : 'طالب')) + '</div></div>' +
        '</div>' +
        (isAdm ? '<span style="background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:700;">مشرف المجموعة</span>' : '') +
      '</li>';
    }).join("");

    modalBackdrop.innerHTML = '<div class="messenger-modal-dialog">' +
      '<div class="messenger-modal-head">' +
        '<h4>👥 معلومات المجموعة</h4>' +
        '<button type="button" class="messenger-modal-close" id="closeGroupInfo">×</button>' +
      '</div>' +
      '<div class="messenger-modal-body">' +
        '<div style="text-align:center;padding:12px 0 16px;border-bottom:1px solid var(--border);">' +
          '<div style="width:64px;height:64px;border-radius:50%;background:#4f46e5;color:#fff;display:inline-grid;place-items:center;font-size:26px;margin-bottom:8px;">👥</div>' +
          '<h3 style="margin:0 0 4px;font-size:1.2rem;">' + esc(group.name) + '</h3>' +
          '<p style="margin:0;font-size:0.85rem;color:var(--text-light);">' + esc(group.desc || "مجموعة تواصل تفاعلية") + '</p>' +
          '<div style="font-size:0.8rem;color:var(--text-light);margin-top:6px;">تم الإنشاء بتاريخ: ' + esc(group.createdAt || "حديثاً") + '</div>' +
        '</div>' +
        '<div style="margin-top:14px;">' +
          '<h5 style="margin:0 0 8px;font-size:0.9rem;">قائمة الأعضاء (' + ((group.members || []).length) + ' عضو):</h5>' +
          '<ul style="list-style:none;padding:0;margin:0;max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;">' +
            membersListHtml +
          '</ul>' +
        '</div>' +
      '</div>' +
    '</div>';

    document.body.appendChild(modalBackdrop);
    modalBackdrop.querySelector("#closeGroupInfo").addEventListener("click", function () {
      if (modalBackdrop.parentNode) modalBackdrop.parentNode.removeChild(modalBackdrop);
    });
  }

  // Handle Applicant Decision (Approve, Reject, Ban)
  function handleApplicantAction(action, applicantId) {
    var requests = getData("joinRequests") || [];
    var req = requests.find(function (r) { return String(r.id) === String(applicantId); });
    if (!req) return;

    var me = actor("admin");
    var msgs = getData("messages") || [];

    if (action === "approve") {
      req.status = "approved";
      req.approvedAt = new Date().toLocaleString("ar-EG");

      // Register student if not already present
      var students = getData("students") || [];
      if (!students.some(function (s) { return String(s.id) === String(req.studentId || req.id); })) {
        var newStudent = {
          id: req.studentId || Date.now(),
          name: req.name,
          username: req.username || (req.name ? req.name.replace(/\s+/g, "").toLowerCase() : "user_" + Date.now()),
          national: req.national || "",
          phone: req.phone || "",
          parent: req.relationshipName || req.parent || "ولي الأمر",
          subjects: req.subjects || [{ id: "quran", name: "قرآن كريم" }],
          authProvider: req.authProvider || "google",
          createdAt: new Date().toLocaleString("ar-EG")
        };
        students.push(newStudent);
        setData("students", students);
      }

      msgs.push({
        id: "msg-" + Date.now(),
        senderRole: "admin",
        senderId: "admin",
        sender: "المسؤول",
        recipientRole: "applicant",
        recipientId: applicantId,
        receiverId: applicantId,
        text: "🎉 تهانينا! تمت الموافقة على طلب تسجيل حسابك وتفعيله بنجاح. يمكنك الآن تسجيل الدخول بكامل الميزات.",
        time: new Date().toLocaleString("ar-EG"),
        read: false
      });

      setData("joinRequests", requests);
      setData("messages", msgs);
      render("admin");
      showToast("تم قبول الحساب وتفعيله بنجاح وإرسال إشعار للمستخدم", "success");
    } else if (action === "reject") {
      req.status = "rejected";
      msgs.push({
        id: "msg-" + Date.now(),
        senderRole: "admin",
        senderId: "admin",
        sender: "المسؤول",
        recipientRole: "applicant",
        recipientId: applicantId,
        receiverId: applicantId,
        text: "❌ نعتذر، تم رفض طلب تسجيل الحساب من قبل الإدارة.",
        time: new Date().toLocaleString("ar-EG"),
        read: false
      });
      setData("joinRequests", requests);
      setData("messages", msgs);
      render("admin");
      showToast("تم رفض الطلب", "info");
    } else if (action === "ban") {
      req.status = "banned";
      // Record in notifications
      var notifications = getData("notifications", []);
      notifications.unshift({
        id: "notif-ban-" + Date.now(),
        type: "account_ban",
        title: "⚠️ حظر حساب مستخدم",
        name: req.name,
        roleLabel: "حساب محظور",
        nationalId: req.national || "",
        phone: req.phone || "",
        message: "تم حظر حساب " + req.name + " (" + (req.authProvider || "طلب جديد") + ") ومنعه من الوصول للمنصة.",
        time: new Date().toLocaleString("ar-EG"),
        read: false
      });
      setData("notifications", notifications);

      msgs.push({
        id: "msg-" + Date.now(),
        senderRole: "admin",
        senderId: "admin",
        sender: "المسؤول",
        recipientRole: "applicant",
        recipientId: applicantId,
        receiverId: applicantId,
        text: "🚫 تم حظر هذا الحساب من قِبل إدارة التطبيق.",
        time: new Date().toLocaleString("ar-EG"),
        read: false
      });

      setData("joinRequests", requests);
      setData("messages", msgs);
      render("admin");
      showToast("تم حظر الحساب بنجاح وإدراجه في التنبيهات", "error");
    }
  }

  function bind(host, role) {
    host.querySelectorAll("[data-contact-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeContact[role] = allContacts(role).find(function (item) { return item.role === button.dataset.contactRole && item.id === button.dataset.contactId; }) || null;
        render(role);
        var shell = host.querySelector('.messenger-shell');
        if (shell) shell.classList.add('chat-open');
      });
    });

    // (+) Button
    var addBtn = host.querySelector("#messengerAddActionBtn");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        openAddActionModal(role);
      });
    }

    // Video & Phone call buttons
    host.querySelectorAll(".messenger-call-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var contact = activeContact[role];
        if (!contact) return;
        var callType = btn.dataset.callType;
        openCallScreen(role, contact, callType);
      });
    });

    // WhatsApp 3-dots dropdown menu for groups
    var groupMenuTrigger = host.querySelector("#groupMenuTriggerBtn");
    var groupMenuDropdown = host.querySelector("#groupMenuDropdown");
    if (groupMenuTrigger && groupMenuDropdown) {
      groupMenuTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        groupMenuDropdown.classList.toggle("show");
      });
      document.addEventListener("click", function (e) {
        if (!e.target.closest(".messenger-group-menu-wrap")) {
          groupMenuDropdown.classList.remove("show");
        }
      });
    }

    // Group action items from 3-dots menu
    host.querySelectorAll("[data-group-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (groupMenuDropdown) groupMenuDropdown.classList.remove("show");
        var action = btn.dataset.groupAction;
        var groupId = btn.dataset.groupId;
        var me = actor(role);
        var groups = getData("messaging_groups") || [];
        var group = groups.find(function (g) { return String(g.id) === String(groupId); });
        if (!group) return;

        if (action === "info") {
          openGroupInfoModal(group);
        } else if (action === "add-member") {
          openAddGroupMemberModal(role, groupId);
        } else if (action === "clear-chat") {
          if (!confirm("هل أنت متأكد من رغبتك في مسح كافة رسائل هذه المجموعة؟")) return;
          var allMsgs = getData("messages") || [];
          allMsgs = allMsgs.filter(function(m){ return String(m.groupId) !== String(groupId); });
          setData("messages", allMsgs);
          render(role);
          showToast("تم مسح محتوى المحادثة بنجاح", "info");
        } else if (action === "delete-group") {
          if (!confirm("هل أنت متأكد من رغبتك في حذف المجموعة بالكامل؟ هذا الإجراء لا يمكن التراجع عنه.")) return;
          groups = groups.filter(function (g) { return String(g.id) !== String(groupId); });
          setData("messaging_groups", groups);
          var allMessages = getData("messages") || [];
          allMessages = allMessages.filter(function(m){ return String(m.groupId) !== String(groupId); });
          setData("messages", allMessages);
          activeContact[role] = null;
          render(role);
          showToast("تم حذف المجموعة بالكامل بنجاح", "success");
        } else if (action === "leave-group") {
          if (!confirm("هل أنت متأكد من رغبتك في مغادرة المجموعة؟")) return;
          group.members = (group.members || []).filter(function (m) {
            return String(m.id) !== String(me.id) && (!me.ids || me.ids.indexOf(String(m.id)) < 0);
          });
          var isGroupCreator = (String(group.creatorId) === String(me.id) || (me.ids && me.ids.indexOf(String(group.creatorId)) >= 0));
          if (isGroupCreator) {
            if (group.members.length > 0) {
              group.creatorId = group.members[0].id;
              group.creatorName = group.members[0].name;
            } else {
              groups = groups.filter(function (g) { return String(g.id) !== String(groupId); });
            }
          }
          setData("messaging_groups", groups);
          activeContact[role] = null;
          render(role);
          showToast("تمت مغادرة المجموعة بنجاح", "info");
        }
      });
    });

    // Applicant action buttons (Admin only)
    host.querySelectorAll("[data-applicant-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleApplicantAction(btn.dataset.applicantAction, btn.dataset.applicantId);
      });
    });

    var back = host.querySelector(".messenger-back");
    if (back) back.addEventListener("click", function () { host.querySelector(".messenger-shell").classList.remove("chat-open"); });

    // Composer elements
    var textarea = host.querySelector(".messenger-pill-input-box textarea") || host.querySelector(".messenger-composer textarea");
    var send = host.querySelector(".messenger-send-pill-btn") || host.querySelector(".messenger-send");
    var fileInput = host.querySelector(".messenger-file");
    var recordButton = host.querySelector("#messengerVoiceBtn") || host.querySelector(".messenger-record");
    var preview = host.querySelector(".messenger-preview");

    host.querySelectorAll("[data-review]").forEach(function (button) { button.addEventListener("click", function () { reviewAttachment(button.dataset.messageId, button.dataset.review); }); });
    host.querySelectorAll("[data-view-file]").forEach(function (button) { button.addEventListener("click", function () { var message = messageForId(button.dataset.viewFile); if (message && message.attachment) { var type = String(message.attachment.type || ""); if (type.indexOf("image/") === 0 || type.indexOf("audio/") === 0 || type === "application/pdf") { window.open(message.attachment.data, "_blank", "noopener"); } else { showToast("هذا النوع لا يدعم المعاينة الداخلية", "info"); } } }); });

    var pendingAttachment = null, attachmentReady = true;
    if (fileInput) fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      var allowed = file.type && (file.type.indexOf("image/") === 0 || file.type.indexOf("audio/") === 0 || file.type === "application/pdf" || file.type === "text/plain" || file.type.indexOf("application/zip") === 0 || file.type.indexOf("application/vnd.") === 0);
      if (!allowed) { showToast("صيغة الملف غير مدعومة. استخدم صورة أو صوتًا أو PDF أو مستندًا معروفًا", "error"); fileInput.value = ""; return; }
      if (file.size > 3 * 1024 * 1024) { showToast("الملف أكبر من الحد الآمن للتخزين المحلي (3 ميجابايت)", "error"); fileInput.value = ""; return; }
      attachmentReady = false; pendingAttachment = null; if (send) send.disabled = true;
      var reader = new FileReader();
      reader.onprogress = function (event) { if (preview && event.lengthComputable) { preview.hidden = false; preview.innerHTML = '<div>جاري تجهيز الملف: <strong>'+Math.round(event.loaded / event.total * 100)+'%</strong></div><progress max="100" value="'+Math.round(event.loaded / event.total * 100)+'"></progress>'; } };
      reader.onload = function () { attachmentReady = true; if (send) send.disabled = false; pendingAttachment = { name: file.name, type: file.type || "application/octet-stream", data: reader.result }; if (preview) { preview.innerHTML = "<strong>100%</strong> — الملف جاهز للإرسال: " + esc(file.name); preview.hidden = false; } };
      reader.onerror = function () { attachmentReady = true; if (send) send.disabled = false; if (preview) { preview.hidden = false; preview.textContent = "فشل تجهيز الملف، حاول اختيار الملف مرة أخرى"; } showToast("تعذر تجهيز الملف", "error"); };
      reader.readAsDataURL(file);
    });

    if (recordButton) recordButton.addEventListener("click", function () { toggleRecording(recordButton, preview, function (audio) { pendingAttachment = audio; }); });
    if (send) send.addEventListener("click", function () { if (attachmentReady) sendDirect(role, textarea, pendingAttachment, fileInput); });
    if (textarea) textarea.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing && event.keyCode !== 229) { event.preventDefault(); if (attachmentReady) sendDirect(role, textarea, pendingAttachment, fileInput); }
    });
  }

  function toggleRecording(button, preview, onDone) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { showToast("تسجيل الصوت غير مدعوم في هذا المتصفح", "error"); return; }
    if (button._recorder) { button._recorder.stop(); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      var chunks = [], recorder = new MediaRecorder(stream);
      button._recorder = recorder;
      button.classList.add("recording");
      recorder.ondataavailable = function (event) { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = function () {
        stream.getTracks().forEach(function (track) { track.stop(); });
        button._recorder = null;
        button.classList.remove("recording");
        var blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 8 * 1024 * 1024) return showToast("التسجيل كبير جدًا", "error");
        var reader = new FileReader();
        reader.onload = function () {
          onDone({ name: "تسجيل صوتي.webm", type: blob.type, data: reader.result });
          if (preview) { preview.textContent = "التسجيل جاهز للإرسال"; preview.hidden = false; }
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
    }).catch(function () { showToast("تعذر الوصول إلى الميكروفون", "error"); });
  }

  async function sendDirect(role, textarea, attachment, fileInput) {
    var text = textarea ? textarea.value.trim() : "";
    var contact = activeContact[role];
    if ((!text && !attachment) || !contact) return;
    if (attachment && attachment.data && attachment.data.length > 3900000) {
      showToast("هذا الملف أكبر من سعة التخزين المحلي المتاحة، اختر ملفًا أصغر", "error");
      return;
    }
    var me = actor(role);
    var isGrp = contact.isGroup || contact.role === "group";
    var isApp = contact.role === "applicant";

    var cloudMessage = (!attachment && !isGrp && !isApp) ? await persistCloudMessage({
      recipientId: contact.id,
      recipientName: contact.name,
      recipientRole: contact.role,
      senderRole: me.role,
      text: text,
    }) : null;

    var localMessage = cloudMessage ? cloudMessageToLocal(cloudMessage) : {
      id: "chat-" + Date.now() + "-" + Math.random().toString(16).slice(2),
      type: me.role,
      sender: me.name,
      senderId: me.id,
      senderRole: me.role,
      receiverType: contact.role,
      receiverId: contact.role === "parent" ? undefined : contact.id,
      receiverName: contact.role === "parent" ? contact.id : undefined,
      recipientRole: contact.role,
      recipientId: contact.id,
      recipientName: contact.name,
      groupId: isGrp ? contact.id : undefined,
      text: text,
      attachment: attachment || null,
      attachmentStatus: attachment && me.role === "student" ? "pending" : "approved",
      time: new Date().toLocaleString("ar-EG"),
      read: false,
      approved: !(attachment && me.role === "student")
    };

    var messages = getData("messages") || [];
    messages.push(localMessage);
    try {
      setData("messages", messages);
    } catch (error) {
      console.error("[v0] Message attachment persistence failed", error);
      showToast("تعذر إرسال الملف: مساحة التخزين المحلية ممتلئة. احذف بعض الرسائل أو اختر ملفًا أصغر", "error");
      return;
    }
    if (textarea) textarea.value = "";
    if (fileInput) fileInput.value = "";
    render(role);
    showToast("تم إرسال الرسالة", "success");
  }

  function scrollThread(host) {
    var thread = host.querySelector(".messenger-thread");
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

  window.addEventListener("clouddataready", function () { loadCloudMessages(); });
  window.renderUnifiedMessenger = render;
  window.loadCloudMessages = loadCloudMessages;
})();
