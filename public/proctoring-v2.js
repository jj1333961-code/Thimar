(function () {
  'use strict';

  const FRAME_TIMEOUT_MS = 8000;
  const HOLD_MS = 2500;
  const STABLE_MS = 1800;
  const state = {
    generation: 0,
    frameCount: 0,
    lastVideoTime: -1,
    frameReady: false,
    playSucceeded: false,
    permission: 'unknown',
    devices: 0,
    error: '',
    holdStartedAt: 0,
    holdTimer: 0,
    activePointers: new Set(),
    stableSince: 0,
    checks: { camera: false, frame: false, face: false, light: false, eyes: false, pose: false, touch: false },
  };

  const byId = (id) => document.getElementById(id);
  const text = (id, value) => { const el = byId(id); if (el) el.textContent = value; };

  function cameraError(error) {
    const name = error && error.name;
    if (!window.isSecureContext) return 'الموقع غير آمن. افتح الصفحة عبر HTTPS.';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return 'الكاميرا غير مسموح بها. اسمح بها من إعدادات الموقع ثم أعد المحاولة.';
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'لا يوجد جهاز كاميرا متاح.';
    if (name === 'NotReadableError' || name === 'TrackStartError') return 'الكاميرا مستخدمة من تطبيق آخر أو تعذر على النظام تشغيلها.';
    if (name === 'OverconstrainedError') return 'الكاميرا لا تدعم إعدادات التصوير المطلوبة.';
    if (name === 'AbortError') return 'توقف تشغيل الكاميرا قبل اكتمال الاتصال.';
    if (name === 'VideoPlaybackError') return 'تم فتح الكاميرا لكن فشل تشغيل الفيديو.';
    if (name === 'FrameTimeoutError') return 'الكاميرا متصلة لكن لم تصل صورة فعلية منها.';
    if (name === 'SecurityError') return 'منع المتصفح أو التطبيق المضيف الوصول إلى الكاميرا. يجب تفعيل camera permission وWebChromeClient.';
    return 'تعذر تشغيل الكاميرا. تحقق من صلاحيات المتصفح أو التطبيق المضيف.';
  }

  async function diagnostics(error) {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' });
        state.permission = result.state;
      }
    } catch (_) {}
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      state.devices = devices.filter((device) => device.kind === 'videoinput').length;
    } catch (_) {}
    const video = byId('proctorVideo');
    const track = window.proctor && window.proctor.stream && window.proctor.stream.getVideoTracks()[0];
    state.error = error ? String(error.name || error.message || error) : '';
    const values = {
      proctorDiagPermission: state.permission,
      proctorDiagDevices: String(state.devices),
      proctorDiagStream: window.proctor && window.proctor.stream ? 'yes' : 'no',
      proctorDiagTrack: track ? track.readyState + (track.muted ? ' / muted' : '') : 'none',
      proctorDiagVideo: video ? `${video.videoWidth}×${video.videoHeight} / readyState ${video.readyState}` : 'none',
      proctorDiagPlay: state.playSucceeded ? 'yes' : 'no',
      proctorDiagFrames: state.frameReady ? `yes (${state.frameCount})` : 'no',
      proctorDiagError: state.error || 'none',
    };
    Object.keys(values).forEach((id) => text(id, values[id]));
  }

  function setCheck(id, ok, good, bad) {
    if (typeof window.setProctorCheck === 'function') window.setProctorCheck(id, ok, ok ? good : bad);
  }

  function updateReadyState() {
    setCheck('proctorCameraCheck', state.checks.camera, 'الكاميرا تعمل', 'الكاميرا غير متاحة');
    setCheck('proctorFrameCheck', state.checks.frame, 'صورة الكاميرا مباشرة', 'بانتظار إطارات فعلية');
    setCheck('proctorFaceCheck', state.checks.face, 'الوجه ظاهر بوضوح', 'اجعل وجهًا واحدًا داخل الإطار');
    setCheck('proctorLightCheck', state.checks.light, 'الإضاءة مناسبة', 'عدّل الإضاءة أمام الوجه');
    setCheck('proctorEyeCheck', state.checks.eyes, 'العينان ظاهرتان', 'افتح عينيك وانظر للشاشة');
    setCheck('proctorGazeCheck', state.checks.pose, 'اتجاه الوجه مناسب', 'انظر مباشرة إلى الشاشة');
    setCheck('proctorTouchCheck', state.checks.touch, 'الإصبع مثبت', 'ضع إصبعًا واحدًا وثبته');
    const visualReady = state.checks.camera && state.checks.frame && state.checks.face && state.checks.light && state.checks.eyes && state.checks.pose;
    setCheck('proctorReadyCheck', visualReady && state.checks.touch, 'الفحص جاهز', 'الفحص غير مكتمل');
    const hold = byId('proctorGateHold');
    if (hold) hold.setAttribute('aria-disabled', visualReady ? 'false' : 'true');
    if (visualReady) {
      if (!state.stableSince) state.stableSince = Date.now();
    } else state.stableSince = 0;
  }

  function stopV2Camera() {
    state.generation += 1;
    state.frameCount = 0;
    state.frameReady = false;
    state.playSucceeded = false;
    state.stableSince = 0;
    clearTimeout(state.holdTimer);
    state.holdStartedAt = 0;
    state.activePointers.clear();
    Object.keys(state.checks).forEach((key) => { state.checks[key] = false; });
  }

  async function waitForMetadata(video, generation) {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA && video.videoWidth > 0) return;
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Object.assign(new Error('metadata-timeout'), { name: 'FrameTimeoutError' })), FRAME_TIMEOUT_MS);
      const ready = () => { if (generation !== state.generation) return; clearTimeout(timeout); video.removeEventListener('loadedmetadata', ready); resolve(); };
      video.addEventListener('loadedmetadata', ready, { once: true });
    });
  }

  async function waitForFrames(video, generation) {
    const startedAt = performance.now();
    return new Promise((resolve, reject) => {
      const done = () => { state.frameReady = true; state.checks.frame = true; resolve(); };
      const tick = (_, metadata) => {
        if (generation !== state.generation) return;
        state.frameCount += 1;
        if (state.frameCount >= 2 && video.videoWidth > 0 && video.videoHeight > 0) return done();
        if (performance.now() - startedAt > FRAME_TIMEOUT_MS) return reject(Object.assign(new Error('frame-timeout'), { name: 'FrameTimeoutError' }));
        video.requestVideoFrameCallback(tick);
      };
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(tick);
      else {
        const timer = setInterval(() => {
          if (generation !== state.generation) return clearInterval(timer);
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.currentTime !== state.lastVideoTime && video.videoWidth > 0) {
            state.lastVideoTime = video.currentTime; state.frameCount += 1;
            if (state.frameCount >= 2) { clearInterval(timer); done(); }
          }
          if (performance.now() - startedAt > FRAME_TIMEOUT_MS) { clearInterval(timer); reject(Object.assign(new Error('frame-timeout'), { name: 'FrameTimeoutError' })); }
        }, 120);
      }
    });
  }

  window.proctorStopCamera = (function (original) {
    return function () { stopV2Camera(); return original.apply(this, arguments); };
  })(window.proctorStopCamera);

  window.startProctorScan = async function startProctorScanV2() {
    const generation = ++state.generation;
    const video = byId('proctorVideo');
    const button = byId('proctorScanBtn');
    const status = byId('proctorCameraStatus');
    stopV2Camera();
    state.generation = generation;
    if (button) button.disabled = true;
    if (status) { status.hidden = false; status.textContent = 'جارٍ طلب الكاميرا…'; }
    text('proctorHelp', 'يتم التحقق من الإذن ثم البث ثم مسار الفيديو ثم وصول الإطارات الفعلية.');
    try {
      if (!window.isSecureContext) throw Object.assign(new Error('insecure-context'), { name: 'SecurityError' });
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw Object.assign(new Error('unsupported'), { name: 'NotSupportedError' });
      if (window.proctor.stream) window.proctor.stream.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'user' }, width: { ideal: 640, min: 320 }, height: { ideal: 480, min: 240 }, frameRate: { ideal: 24, min: 10 } }, audio: false });
      if (generation !== state.generation) { stream.getTracks().forEach((track) => track.stop()); return; }
      const track = stream.getVideoTracks()[0];
      if (!track || track.readyState !== 'live') throw Object.assign(new Error('track-not-live'), { name: 'NotReadableError' });
      window.proctor.stream = stream;
      track.addEventListener('ended', () => failLiveCamera('توقفت الكاميرا أو فُصلت من الجهاز.'));
      track.addEventListener('mute', () => failLiveCamera('توقفت إطارات الكاميرا مؤقتًا.'));
      video.autoplay = true; video.muted = true; video.playsInline = true; video.setAttribute('playsinline', ''); video.srcObject = stream;
      await waitForMetadata(video, generation);
      try { await video.play(); state.playSucceeded = true; } catch (error) { throw Object.assign(error || new Error('play-failed'), { name: 'VideoPlaybackError' }); }
      await waitForFrames(video, generation);
      state.checks.camera = true;
      if (status) status.hidden = true;
      video.classList.add('is-live');
      if ('FaceDetector' in window) {
        window.proctor.detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 2 }); window.proctor.detectorType = 'native';
      } else if (window.FaceMesh) {
        const mesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}` });
        mesh.setOptions({ maxNumFaces: 2, refineLandmarks: true, minDetectionConfidence: .6, minTrackingConfidence: .6 });
        mesh.onResults((results) => { window.proctor.faceMeshResults = results.multiFaceLandmarks || []; });
        window.proctor.detector = mesh; window.proctor.detectorType = 'mediapipe';
      } else throw Object.assign(new Error('face-model-unavailable'), { name: 'NotSupportedError' });
      window.proctor.scanTimer = setInterval(window.proctorAnalyzeFrame, 300);
      await window.proctorAnalyzeFrame();
      text('proctorHelp', 'الكاميرا تعمل. اجعل وجهك داخل الإطار ثم ضع إصبعًا واحدًا في أي مكان داخل نافذة الفحص.');
      await diagnostics(); updateReadyState();
    } catch (error) {
      if (generation !== state.generation) return;
      state.error = String(error && (error.name || error.message) || error);
      if (window.proctor.stream) { window.proctor.stream.getTracks().forEach((track) => track.stop()); window.proctor.stream = null; }
      if (video) { video.srcObject = null; video.classList.remove('is-live'); }
      text('proctorHelp', cameraError(error));
      if (status) { status.hidden = false; status.textContent = cameraError(error); }
      if (button) { button.disabled = false; button.textContent = 'إعادة تشغيل الكاميرا'; }
      await diagnostics(error); updateReadyState();
    }
  };

  function failLiveCamera(message) {
    state.checks.camera = false; state.checks.frame = false;
    text('proctorHelp', message + ' استخدم زر إعادة تشغيل الكاميرا.');
    const status = byId('proctorCameraStatus'); if (status) { status.hidden = false; status.textContent = message; }
    const button = byId('proctorScanBtn'); if (button) { button.disabled = false; button.textContent = 'إعادة تشغيل الكاميرا'; }
    updateReadyState(); void diagnostics(new Error(message));
  }

  window.proctorAnalyzeFrame = async function analyzeFrameV2() {
    const video = byId('proctorVideo'), canvas = byId('proctorCanvas');
    if (!video || !canvas || !state.frameReady || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !window.proctor.detector || window.proctor.analyzing) return;
    window.proctor.analyzing = true;
    try {
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let sum = 0, sumSq = 0, edges = 0, previous = 0;
      for (let i = 0; i < pixels.length; i += 16) { const lum = .2126 * pixels[i] + .7152 * pixels[i + 1] + .0722 * pixels[i + 2]; sum += lum; sumSq += lum * lum; edges += Math.abs(lum - previous); previous = lum; }
      const samples = pixels.length / 16, light = sum / samples, contrast = Math.sqrt(Math.max(0, sumSq / samples - light * light));
      state.checks.light = light >= 42 && light <= 225 && contrast >= 12 && edges / samples >= 3;
      let faces = [];
      try { faces = await window.proctorDetectFaces(video); } catch (_) {}
      state.checks.face = faces.length === 1;
      state.checks.eyes = false; state.checks.pose = false;
      if (faces.length === 1) {
        const face = faces[0], box = face.boundingBox;
        const cx = (box.x + box.width / 2) / video.videoWidth, cy = (box.y + box.height / 2) / video.videoHeight, size = box.width / video.videoWidth;
        state.checks.face = size > .17 && size < .78 && cx > .25 && cx < .75 && cy > .2 && cy < .82;
        state.checks.pose = Math.abs(cx - .5) < .16 && Math.abs(cy - .5) < .2;
        if (face.landmarks) {
          const ratio = (a, b, c, d) => Math.hypot(face.landmarks[a].x - face.landmarks[b].x, face.landmarks[a].y - face.landmarks[b].y) / Math.max(.001, Math.hypot(face.landmarks[c].x - face.landmarks[d].x, face.landmarks[c].y - face.landmarks[d].y));
          state.checks.eyes = (ratio(159, 145, 33, 133) + ratio(386, 374, 362, 263)) / 2 > .055;
        } else state.checks.eyes = true;
      }
      updateReadyState();
    } finally { window.proctor.analyzing = false; }
  };

  function finishHold() {
    const hold = byId('proctorGateHold');
    if (!hold || hold.getAttribute('aria-disabled') !== 'false' || state.activePointers.size !== 1) return;
    state.checks.touch = true; hold.classList.add('holding'); hold.textContent = 'تم تثبيت إصبع واحد بنجاح'; updateReadyState();
    const callback = window.proctor.onReady, context = window.proctor.context;
    if (callback) {
      window.proctor.onReady = null; byId('proctorGate').classList.add('hidden'); window.proctor.active = true; window.proctor.context = context;
      callback();
    }
  }

  function pointerDown(event) {
    if (event.pointerType === 'mouse') return;
    state.activePointers.add(event.pointerId); event.currentTarget.setPointerCapture && event.currentTarget.setPointerCapture(event.pointerId);
    if (state.activePointers.size === 1) {
      state.holdStartedAt = Date.now(); text('proctorGateHold', 'ثبّت إصبعك…'); clearTimeout(state.holdTimer); state.holdTimer = setTimeout(finishHold, HOLD_MS);
    } else { clearTimeout(state.holdTimer); state.checks.touch = false; text('proctorGateHold', 'استخدم إصبعًا واحدًا فقط'); updateReadyState(); }
  }
  function pointerUp(event) { state.activePointers.delete(event.pointerId); if (!state.checks.touch) { clearTimeout(state.holdTimer); text('proctorGateHold', 'ضع إصبعًا واحدًا هنا وثبته لمدة قصيرة'); } }

  document.addEventListener('DOMContentLoaded', () => {
    const hold = byId('proctorGateHold');
    if (hold && window.PointerEvent) {
      hold.addEventListener('pointerdown', pointerDown); hold.addEventListener('pointerup', pointerUp); hold.addEventListener('pointercancel', pointerUp); hold.addEventListener('contextmenu', (event) => event.preventDefault());
    }
    const diagnostic = byId('proctorDiagnostics');
    if (diagnostic) diagnostic.hidden = !(location.hostname === 'localhost' || location.hostname.endsWith('.vercel.app') || new URLSearchParams(location.search).has('proctorDebug'));
    void diagnostics(); updateReadyState();
  });
})();
