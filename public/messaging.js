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
    var students = getData("students") || [];
    if (role === "admin") {
      var parents = [];
      students.forEach(function (student) {
        if (student.parent && !parents.some(function (parent) { return parent.id === student.parent; })) {
          parents.push({ id: student.parent, role: "parent", name: student.parent, subtitle: "ولي أمر" });
        }
      });
      return [
        { title: "الطلاب", items: students.map(function (student) { return { id: String(student.id), role: "student", name: student.name, subtitle: student.username || "طالب" }; }) },
        { title: "أولياء الأمور", items: parents }
      ];
    }
    if (role === "student") {
      return [{ title: "جهات الاتصال", items: [
        { id: "admin", role: "admin", name: "المسؤول", subtitle: "المعلم" },
        { id: currentUser.parent || "", role: "parent", name: currentUser.parent || "ولي الأمر", subtitle: "ولي الأمر" }
      ].filter(function (item) { return item.id; }) }];
    }
    return [{ title: "جهات الاتصال", items: [{ id: "admin", role: "admin", name: "المسؤول", subtitle: "المعلم" }].concat((currentUser || []).map(function (student) {
      return { id: String(student.id), role: "student", name: student.name, subtitle: "الابن / الابنة" };
    })) }];
  }

  function contactButton(item, role) {
    var selected = activeContact[role] && activeContact[role].role === item.role && activeContact[role].id === item.id;
    return '<button type="button" class="messenger-contact'+(selected ? ' active' : '')+'" data-chat-role="'+esc(role)+'" data-contact-role="'+esc(item.role)+'" data-contact-id="'+esc(item.id)+'">'+
      '<span class="messenger-avatar" aria-hidden="true">'+esc((item.name || "؟").trim().charAt(0))+'</span><span class="messenger-contact-copy"><span class="messenger-contact-name">'+esc(item.name)+'</span><span class="messenger-contact-role">'+esc(item.subtitle)+'</span></span></button>';
  }

  function render(role) {
    var host = document.getElementById(role === "admin" ? "messagesList" : role + "InboxList");
    if (!host) return;
    var groups = contacts(role);
    var list = groups.map(function (group) {
      return '<div class="messenger-group-title">'+esc(group.title)+'</div>'+group.items.map(function (item) { return contactButton(item, role); }).join("");
    }).join("");
    host.innerHTML = '<div class="messenger-shell'+(activeContact[role] ? ' has-selection' : '')+'" data-messenger="'+role+'"><aside class="messenger-contacts"><div class="messenger-contacts-head"><h3>المحادثات <span class="messenger-unread-summary" data-message-badge="'+(role === "admin" ? "admin" : "student")+'" hidden></span></h3><p>اختر محادثة لبدء الدردشة</p></div>'+list+'</aside><section class="messenger-chat">'+(activeContact[role] ? chatHtml(role) : '<div class="messenger-placeholder">اختر محادثة من القائمة لعرض الرسائل</div>')+'</section></div>';
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
    if (!contact) return '<div class="messenger-placeholder">اختر شخصًا لبدء المحادثة</div>';
    var me = actor(role);
    markVisibleMessagesRead(role, contact);
    var messages = (getData("messages") || []).filter(function (message) { return isBetween(message, me, contact); });
    var thread = messages.length ? messages.map(function (message) {
      var item = normalized(message);
      var sent = item.fromRole === me.role && endpointMatches(item.fromId, message.senderName || message.sender, me);
      return '<article class="messenger-bubble '+(sent ? 'sent' : 'received')+'">'+(message.text ? '<p>'+esc(message.text)+'</p>' : '')+voiceAudioHTML(message)+attachmentHTML(message, role)+'<time>'+esc(message.time || "")+'</time></article>';
    }).join("") : '<div class="messenger-empty">لا توجد رسائل بعد. ابدأ المحادثة الآن.</div>';
    return '<header class="messenger-chat-head"><button type="button" class="messenger-back" aria-label="العودة إلى المحادثات">رجوع</button><span class="messenger-avatar" aria-hidden="true">'+esc(contact.name.charAt(0))+'</span><div><strong>'+esc(contact.name)+'</strong><div class="messenger-contact-role">'+esc(contact.subtitle)+'</div></div></header><div class="messenger-thread" aria-live="polite">'+thread+'</div><div class="messenger-preview" hidden></div><div class="messenger-composer"><label class="messenger-icon-button" title="إرفاق ملف"><input class="messenger-file" type="file" hidden>إرفاق</label><button type="button" class="messenger-record" title="تسجيل صوتي">تسجيل صوتي</button><textarea rows="1" aria-label="نص الرسالة" placeholder="اكتب رسالة..."></textarea><button type="button" class="messenger-send">إرسال</button></div>';
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

  function bind(host, role) {
    host.querySelectorAll("[data-contact-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        activeContact[role] = allContacts(role).find(function (item) { return item.role === button.dataset.contactRole && item.id === button.dataset.contactId; }) || null;
        render(role);
        var shell = host.querySelector('.messenger-shell');
        if (shell) shell.classList.add('chat-open');
      });
    });
    var back = host.querySelector(".messenger-back");
    if (back) back.addEventListener("click", function () { host.querySelector(".messenger-shell").classList.remove("chat-open"); });
    var textarea = host.querySelector(".messenger-composer textarea");
    var send = host.querySelector(".messenger-send");
    var fileInput = host.querySelector(".messenger-file");
    var recordButton = host.querySelector(".messenger-record");
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
      var chunks = [], recorder = new MediaRecorder(stream); button._recorder = recorder; button.textContent = "إيقاف التسجيل"; button.classList.add("recording");
      recorder.ondataavailable = function (event) { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = function () { stream.getTracks().forEach(function (track) { track.stop(); }); button._recorder = null; button.textContent = "تسجيل صوتي"; button.classList.remove("recording"); var blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" }); if (blob.size > 8 * 1024 * 1024) return showToast("التسجيل كبير جدًا", "error"); var reader = new FileReader(); reader.onload = function () { onDone({ name: "رسالة صوتية.webm", type: blob.type, data: reader.result }); if (preview) { preview.textContent = "التسجيل جاهز للإرسال"; preview.hidden = false; } }; reader.readAsDataURL(blob); };
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
    var cloudMessage = !attachment ? await persistCloudMessage({
      recipientId: contact.id,
      recipientName: contact.name,
      recipientRole: contact.role,
      senderRole: me.role,
      text: text,
    }) : null;
    var localMessage = cloudMessage ? cloudMessageToLocal(cloudMessage) : {
      id: "chat-"+Date.now()+"-"+Math.random().toString(16).slice(2),
      type: me.role, sender: me.name, senderId: me.id, senderRole: me.role,
      receiverType: contact.role, receiverId: contact.role === "parent" ? undefined : contact.id,
      receiverName: contact.role === "parent" ? contact.id : undefined,
      recipientRole: contact.role, recipientId: contact.id, recipientName: contact.name,
      text: text, attachment: attachment || null, attachmentStatus: attachment && me.role === "student" ? "pending" : "approved", time: new Date().toLocaleString("ar-EG"), read: false, approved: !(attachment && me.role === "student")
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
