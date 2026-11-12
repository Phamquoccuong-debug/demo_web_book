/* ===================================================
   L’ÉCHELLE — Atelier des Livres Interactive Engine
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  initAuthSystem();
  initBook3DTilt();
  initEmotionTabs();
  initAudioPlayer();
  initMobileMenu();
});

/* ----------------------------------------------------
   0. Authentication & Member Session Management
---------------------------------------------------- */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('lechelle_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function isLoggedIn() {
  const user = getCurrentUser();
  return !!(user && user.isLoggedIn);
}

function initAuthSystem() {
  renderAuthUI();
  autoFillOrderFormIfLoggedIn();
}

function renderAuthUI() {
  const user = getCurrentUser();
  const authNav = document.getElementById('auth-nav-container');
  const mobileAuth = document.getElementById('mobile-auth-area');
  const preorderNotice = document.getElementById('preorder-auth-notice');

  if (isLoggedIn() && user) {
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'Đ';
    
    // Header desktop profile
    if (authNav) {
      authNav.innerHTML = `
        <div class="flex items-center gap-2 pl-2 border-l border-sandstone">
          <div class="w-8 h-8 rounded-full bg-sage text-linen flex items-center justify-center font-serif text-sm font-semibold shadow-sm" title="${user.name}">
            ${initial}
          </div>
          <div class="hidden xl:flex flex-col text-left">
            <span class="text-xs font-semibold text-charcoal truncate max-w-[110px]">${user.name}</span>
            <span class="text-[9px] uppercase tracking-wider text-terracotta font-medium">Thành Viên</span>
          </div>
          <button onclick="handleLogout()" class="text-xs text-charcoal/50 hover:text-terracotta p-1 transition" title="Đăng xuất">
            <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
    }

    // Mobile drawer profile
    if (mobileAuth) {
      mobileAuth.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-sage text-linen flex items-center justify-center font-serif font-bold">
              ${initial}
            </div>
            <div>
              <p class="text-xs font-bold text-charcoal">${user.name}</p>
              <p class="text-[10px] text-terracotta font-medium">Độc Giả Thành Viên</p>
            </div>
          </div>
          <button onclick="handleLogout()" class="px-3 py-1 rounded-full border border-sandstone text-xs text-charcoal/70 hover:text-terracotta">Đăng Xuất</button>
        </div>
      `;
    }

    // Preorder box notification
    if (preorderNotice) {
      preorderNotice.className = "p-4 rounded-2xl bg-sage-light border border-sage/30 flex items-center justify-between text-xs";
      preorderNotice.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="w-6 h-6 rounded-full bg-sage text-white flex items-center justify-center font-serif text-xs font-bold">${initial}</div>
          <span class="text-sage-dark font-medium">Đang đặt sách với tư cách độc giả thành viên: <b>${user.name}</b> (${user.email})</span>
        </div>
        <button onclick="handleLogout()" class="text-[11px] underline text-charcoal/60 hover:text-terracotta">Đổi tài khoản</button>
      `;
    }

  } else {
    // Guest state
    if (authNav) {
      authNav.innerHTML = `
        <a href="auth.html" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-sandstone hover:border-charcoal text-xs font-medium text-charcoal transition group">
          <i data-lucide="user" class="w-3.5 h-3.5 text-terracotta group-hover:scale-110 transition-transform"></i>
          <span>Đăng Nhập</span>
        </a>
      `;
    }

    if (mobileAuth) {
      mobileAuth.innerHTML = `
        <a href="auth.html" class="flex items-center justify-between py-2 text-xs font-semibold text-terracotta">
          <div class="flex items-center gap-2">
            <i data-lucide="user" class="w-4 h-4"></i>
            <span>Đăng Nhập / Tạo Tài Khoản</span>
          </div>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </a>
      `;
    }

    if (preorderNotice) {
      preorderNotice.className = "p-4 rounded-2xl bg-terracotta-light border border-terracotta/30 flex items-center justify-between text-xs";
      preorderNotice.innerHTML = `
        <div class="flex items-center gap-2">
          <i data-lucide="shield-alert" class="w-4 h-4 text-terracotta shrink-0"></i>
          <span class="text-charcoal/80">Bạn chưa đăng nhập. Vui lòng đăng nhập trước khi tiến hành đặt sách.</span>
        </div>
        <a href="auth.html?redirect=preorder" class="underline font-semibold text-terracotta hover:text-terracotta-hover">Đăng nhập ngay</a>
      `;
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

function autoFillOrderFormIfLoggedIn() {
  if (!isLoggedIn()) return;
  const user = getCurrentUser();
  if (!user) return;

  const nameInput = document.getElementById('order-name');
  const phoneInput = document.getElementById('order-phone');

  if (nameInput && !nameInput.value && user.name) {
    nameInput.value = user.name;
  }
  if (phoneInput && !phoneInput.value && user.phone) {
    phoneInput.value = user.phone;
  }
}

function handleLogout() {
  if (confirm('Bạn có muốn đăng xuất khỏi tài khoản độc giả này?')) {
    localStorage.removeItem('lechelle_current_user');
    renderAuthUI();
    const nameInput = document.getElementById('order-name');
    const phoneInput = document.getElementById('order-phone');
    if (nameInput) nameInput.value = '';
    if (phoneInput) phoneInput.value = '';
  }
}

/* ----------------------------------------------------
   0.1 Buy Click Interceptor: Redirect to Login if Guest
---------------------------------------------------- */
function handleBuyClick(event, targetSection = 'preorder') {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Check login
  if (!isLoggedIn()) {
    // Show toast warning
    const warningToast = document.getElementById('auth-warning-toast');
    if (warningToast) {
      warningToast.classList.remove('translate-y-32', 'opacity-0');
      warningToast.classList.add('translate-y-0', 'opacity-100');
    }

    // Redirect to auth page after slight delay for tactile feedback
    setTimeout(() => {
      window.location.href = `auth.html?redirect=${targetSection}&action=buy`;
    }, 700);
    return false;
  }

  // If already logged in, navigate smoothly to preorder and auto-fill
  autoFillOrderFormIfLoggedIn();
  const targetElem = document.getElementById(targetSection);
  if (targetElem) {
    targetElem.scrollIntoView({ behavior: 'smooth' });
    const nameInput = document.getElementById('order-name');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 600);
    }
  }
  return true;
}

/* ----------------------------------------------------
   1. Interactive 3D Book Hover & Tilt Effect
---------------------------------------------------- */
function initBook3DTilt() {
  const container = document.querySelector('.book-container');
  const book = document.getElementById('hero-book');

  if (!container || !book) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12 + 6;
    const rotateY = ((x - centerX) / centerX) * 16 - 12;

    book.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateY(-6px)`;
  });

  container.addEventListener('mouseleave', () => {
    book.style.transform = `rotateY(-18deg) rotateX(8deg)`;
  });
}

/* ----------------------------------------------------
   2. Emotion Curation Tabs Filter
---------------------------------------------------- */
const bookDatabase = {
  solitude: [
    {
      badge: "Solitude No.1",
      title: "Nghệ Thuật Của Sự Cô Độc Bình Yên",
      author: "Minh Thảo",
      tag: "Gợi ý cho những đêm một mình",
      icon: "compass",
      desc: "Những tản văn và suy ngẫm sâu lắng về việc kết bạn với chính mình giữa cuộc sống kết nối quá tải. Cuốn sách không khuyên bạn trốn chạy, mà chỉ cách dừng lại thở.",
      price: "265.000₫",
      color: "#334139",
      label: "Tái bản lần 3"
    },
    {
      badge: "Solitude No.2",
      title: "Mùa Đông Trên Những Đồi Chè Cũ",
      author: "Hoàng Phong",
      tag: "Trầm mặc & tĩnh tại",
      icon: "coffee",
      desc: "Hành trình một mình đi qua những đồn điền chè bỏ hoang tại vùng cao nguyên, lắng nghe tiếng sương nhỏ giọt và tìm lại sự bình yên nội tâm.",
      price: "245.000₫",
      color: "#2C3E50",
      label: "Ấn bản giới hạn"
    },
    {
      badge: "Solitude No.3",
      title: "Khoảng Cách Giữa Hai Hơi Thở",
      author: "Việt An",
      tag: "Chữa lành & thiền niệm",
      icon: "wind",
      desc: "Cuốn cẩm nang tinh thần ngắn gọn giúp bạn xây dựng một ốc đảo yên tĩnh ngay giữa những giờ nghỉ trưa ngắn ngủi nơi đô thị.",
      price: "195.000₫",
      color: "#4A4036",
      label: "Kèm podcast"
    }
  ],
  aesthetic: [
    {
      badge: "Aesthetic No.1",
      title: "Hình Học Của Ký Ức & Ánh Sáng",
      author: "Trần Duy Tân",
      tag: "Thị giác kiến trúc & nhiếp ảnh",
      icon: "palette",
      desc: "Khảo luận thị giác kết hợp hơn 120 bức ảnh phim medium format, kể câu chuyện về các công trình kiến trúc Đông Dương bị thời gian lãng quên.",
      price: "395.000₫",
      color: "#8C4A32",
      label: "Bìa lụa tơ tằm"
    },
    {
      badge: "Aesthetic No.2",
      title: "Màu Sắc Của Những Cánh Cổng Cũ",
      author: "Bảo Anh",
      tag: "Nghệ thuật & gam màu di sản",
      icon: "eye",
      desc: "Bộ sưu tập nghiên cứu màu sắc văn hóa từ gốm men lam, sơn ta truyền thống cho đến sắc vàng vôi trường tồn của phố cổ.",
      price: "360.000₫",
      color: "#A26953",
      label: "In màu 8 màu"
    },
    {
      badge: "Aesthetic No.3",
      title: "Bản Giao Hưởng Của Khoảng Trắng",
      author: "Vũ Nam",
      tag: "Nghệ thuật Typography tối giản",
      icon: "layout",
      desc: "Vẻ đẹp của sự tinh giản: cách những khoảng trống trong thiết kế và trang sách mở ra không gian cho tâm trí tự do liên tưởng.",
      price: "310.000₫",
      color: "#273C33",
      label: "Bìa dập nhũ vàng"
    }
  ],
  wisdom: [
    {
      badge: "Wisdom No.1",
      title: "Biên Niên Sử Những Đóa Hoa Tàn",
      author: "Nguyên Thảo",
      tag: "Tâm lý học chiều sâu",
      icon: "sparkles",
      desc: "Cuộc đối thoại giữa một bác sĩ tâm thần già và người họa sĩ mù về bản chất của vẻ đẹp ngắn ngủi và cái chết như một dạng tái sinh của ý thức.",
      price: "285.000₫",
      color: "#1E252B",
      label: "Giải Văn Học 2025"
    },
    {
      badge: "Wisdom No.2",
      title: "Minh Triết Bên Tách Trà Chiều",
      author: "Lâm Tuệ",
      tag: "Triết luận phương Đông",
      icon: "sun",
      desc: "Những bài học nhân sinh giản dị được đúc kết từ nghệ thuật Trà đạo và tư tưởng Lão Trang qua con mắt của người trẻ hiện đại.",
      price: "250.000₫",
      color: "#463B34",
      label: "Ấn bản bỏ túi"
    },
    {
      badge: "Wisdom No.3",
      title: "Tự Do Tuyệt Đối Trong Ý Nghĩ",
      author: "Jean-Marc / Bản dịch",
      tag: "Hiện sinh & nhân bản học",
      icon: "shield",
      desc: "Dù hoàn cảnh bên ngoài có ngặt nghèo đến đâu, tâm trí con người vẫn luôn có quyền năng tối thượng để chọn thái độ sống cho riêng mình.",
      price: "290.000₫",
      color: "#3F3244",
      label: "Dịch phẩm đoạt giải"
    }
  ],
  wandering: [
    {
      badge: "Journey No.1",
      title: "Những Chuyến Tàu Đi Về Miền Vắng",
      author: "Quang Khải",
      tag: "Du ký văn học & chiêm nghiệm",
      icon: "map-pin",
      desc: "Hành trình trên những tuyến đường sắt xuyên lục địa, ghi lại những mảnh đời vô danh gặp gỡ qua khung cửa sổ toa tàu mờ hơi nước sương mù.",
      price: "270.000₫",
      color: "#264653",
      label: "Tập 1 Bộ Du Ký"
    },
    {
      badge: "Journey No.2",
      title: "Bản Đồ Của Những Kẻ Lạc Lối",
      author: "Mai Lan",
      tag: "Văn chương xê dịch",
      icon: "navigation",
      desc: "Đôi khi phải lạc đường ta mới thật sự gặp lại chính mình. Những câu chuyện truyền cảm hứng từ những cung đường hoang sơ ít dấu chân người.",
      price: "255.000₫",
      color: "#2A9D8F",
      label: "Ấn bản bìa mềm"
    },
    {
      badge: "Journey No.3",
      title: "Dưới Bầu Trời Đầy Sao Patagonia",
      author: "Đình Trọng",
      tag: "Thiên nhiên & sự tráng lệ",
      icon: "star",
      desc: "Khúc ca ngợi sự bao la của vũ trụ và đất mẹ trước sự nhỏ bé khiêm nhường nhưng tràn ngập lòng biết ơn của loài người.",
      price: "320.000₫",
      color: "#1D3557",
      label: "Kèm phụ bản ảnh"
    }
  ]
};

function initEmotionTabs() {
  const tabs = document.querySelectorAll('.emotion-tab');
  const grid = document.getElementById('curated-grid');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.getAttribute('data-target');
      renderBooks(target);
    });
  });
}

function renderBooks(category) {
  const grid = document.getElementById('curated-grid');
  const books = bookDatabase[category] || bookDatabase.solitude;

  // Gentle fade transition
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(10px)';

  setTimeout(() => {
    grid.innerHTML = books.map((book, idx) => `
      <article class="curated-card group p-6 rounded-3xl bg-linen border border-sandstone hover:border-terracotta/40 transition-all duration-300 flex flex-col justify-between ${idx === 1 ? 'md:-translate-y-4 shadow-sm hover:shadow-md' : ''}">
        <div class="space-y-6">
          <div class="relative overflow-hidden rounded-2xl bg-[#EBE5DB] h-72 flex items-center justify-center p-6">
            <div class="w-36 h-52 rounded-r-md shadow-xl p-4 flex flex-col justify-between transform group-hover:scale-105 transition-transform duration-300" style="background-color: ${book.color}">
              <span class="text-[8px] uppercase tracking-widest text-sandstone/60">${book.badge}</span>
              <p class="font-serif text-sm font-semibold text-sandstone leading-snug">${book.title}</p>
              <span class="text-[8px] text-sandstone/50">${book.author}</span>
            </div>
            <span class="absolute top-4 right-4 text-xs font-serif italic text-charcoal/60">${book.label}</span>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-xs text-terracotta font-semibold uppercase tracking-wider">
              <i data-lucide="${book.icon}" class="w-3.5 h-3.5"></i>
              <span>${book.tag}</span>
            </div>
            <h3 class="font-serif text-2xl font-bold text-charcoal group-hover:text-terracotta transition-colors">
              ${book.title}
            </h3>
            <p class="text-xs text-charcoal/70 line-clamp-3 leading-relaxed">
              ${book.desc}
            </p>
          </div>
        </div>

        <div class="pt-6 mt-6 border-t border-sandstone/60 flex items-center justify-between gap-2">
          <div>
            <span class="text-xs text-charcoal/50 block">Ấn bản tuyển chọn</span>
            <span class="font-serif text-lg font-bold text-sage">${book.price}</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="openReadingModal()" class="px-3 py-1.5 rounded-full border border-sandstone text-[11px] font-medium text-charcoal hover:border-charcoal transition" title="Đọc trích đoạn">
              <span>Đọc Thử</span>
            </button>
            <button onclick="handleBuyClick(event, 'preorder')" class="px-3.5 py-1.5 rounded-full bg-sage hover:bg-sage-dark text-linen text-[11px] font-semibold tracking-wider uppercase transition shadow-sm" title="Đặt sách bản này">
              <span>Đặt Mua</span>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    if (window.lucide) {
      lucide.createIcons();
    }

    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0px)';
  }, 200);
}

/* ----------------------------------------------------
   3. The Quiet Reading Room Controls
---------------------------------------------------- */
let currentFontSize = 18;

function adjustFontSize(delta) {
  currentFontSize += delta;
  if (currentFontSize < 14) currentFontSize = 14;
  if (currentFontSize > 24) currentFontSize = 24;

  const content = document.getElementById('reading-content');
  const indicator = document.getElementById('font-size-indicator');
  
  if (content) {
    const paragraphs = content.querySelectorAll('.reader-paragraph');
    paragraphs.forEach(p => p.style.fontSize = `${currentFontSize}px`);
  }
  if (indicator) {
    indicator.textContent = `${currentFontSize}px`;
  }
}

function setReaderFont(fontType) {
  const content = document.getElementById('reading-content');
  const btnSerif = document.getElementById('btn-font-serif');
  const btnSans = document.getElementById('btn-font-sans');

  if (fontType === 'serif') {
    content.classList.remove('font-sans');
    content.classList.add('font-serif');
    btnSerif.classList.add('bg-sandstone/60', 'font-semibold');
    btnSans.classList.remove('bg-sandstone/60', 'font-semibold');
  } else {
    content.classList.remove('font-serif');
    content.classList.add('font-sans');
    btnSans.classList.add('bg-sandstone/60', 'font-semibold');
    btnSerif.classList.remove('bg-sandstone/60', 'font-semibold');
  }
}

function setReaderTheme(theme) {
  const paper = document.getElementById('reading-paper');
  const themeBtns = document.querySelectorAll('.theme-btn');

  paper.classList.remove('theme-parchment', 'theme-white', 'theme-night');
  themeBtns.forEach(b => b.classList.remove('ring-2', 'ring-terracotta'));

  if (theme === 'parchment') {
    paper.classList.add('theme-parchment');
  } else if (theme === 'white') {
    paper.classList.add('theme-white');
  } else if (theme === 'night') {
    paper.classList.add('theme-night');
  }
}

/* ----------------------------------------------------
   4. Audio Ambience & Synthesizer Engine (Web Audio API)
---------------------------------------------------- */
let audioCtx = null;
let isAudioPlaying = false;
let isRainPlaying = false;
let rainNode = null;
let musicInterval = null;
let playTimeSeconds = 72; // starts at 01:12

function getOrCreateAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate relaxing pink noise / rain sound with Web Audio
function createRainAmbience() {
  const ctx = getOrCreateAudioContext();
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    output[i] *= 0.04; // subtle soft volume
    b6 = white * 0.115926;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  // Gentle low-pass filter to sound like soft indoor rain
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);

  whiteNoise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  whiteNoise.start(0);
  return { source: whiteNoise, gain: gainNode };
}

function initAudioPlayer() {
  const playBtn = document.getElementById('btn-play-pause');
  const playIcon = document.getElementById('play-icon');
  const vinyl = document.getElementById('vinyl-disc');
  const waveform = document.querySelector('.waveform-container');
  const rainBtn = document.getElementById('audio-ambient-rain');
  const rainStatus = document.getElementById('rain-status');
  const headerAmbientBtn = document.getElementById('toggle-ambient');

  if (!playBtn) return;

  function togglePlayState() {
    isAudioPlaying = !isAudioPlaying;
    const ctx = getOrCreateAudioContext();

    if (isAudioPlaying) {
      vinyl.classList.add('spinning-disc');
      waveform.classList.add('waveform-active');
      playIcon.setAttribute('data-lucide', 'pause');
      lucide.createIcons();

      // Start timer simulation
      musicInterval = setInterval(() => {
        playTimeSeconds++;
        if (playTimeSeconds > 288) playTimeSeconds = 0;
        updateTimeDisplay();
      }, 1000);

      // Also trigger rain if not active
      if (!isRainPlaying) {
        toggleRain();
      }
    } else {
      vinyl.classList.remove('spinning-disc');
      waveform.classList.remove('waveform-active');
      playIcon.setAttribute('data-lucide', 'play');
      lucide.createIcons();
      clearInterval(musicInterval);
    }
  }

  function toggleRain() {
    isRainPlaying = !isRainPlaying;
    if (isRainPlaying) {
      rainNode = createRainAmbience();
      rainStatus.textContent = 'Bật';
      rainStatus.className = 'text-terracotta';
      if (headerAmbientBtn) {
        headerAmbientBtn.classList.add('bg-sage/10', 'text-sage', 'border-sage');
      }
    } else {
      if (rainNode) {
        try { rainNode.source.stop(); } catch(e){}
        rainNode = null;
      }
      rainStatus.textContent = 'Tắt';
      rainStatus.className = 'text-white/60';
      if (headerAmbientBtn) {
        headerAmbientBtn.classList.remove('bg-sage/10', 'text-sage', 'border-sage');
      }
    }
  }

  playBtn.addEventListener('click', togglePlayState);
  if (rainBtn) rainBtn.addEventListener('click', toggleRain);
  if (headerAmbientBtn) {
    headerAmbientBtn.addEventListener('click', () => {
      toggleRain();
    });
  }

  // Audio progress bar click seek
  const progressBar = document.getElementById('audio-progress-bar');
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      playTimeSeconds = Math.floor(percentage * 288);
      updateTimeDisplay();
    });
  }
}

function updateTimeDisplay() {
  const currentElem = document.getElementById('audio-current-time');
  const progressFill = document.getElementById('audio-progress-fill');
  if (!currentElem || !progressFill) return;

  const mins = Math.floor(playTimeSeconds / 60);
  const secs = playTimeSeconds % 60;
  currentElem.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  
  const percentage = (playTimeSeconds / 288) * 100;
  progressFill.style.width = `${percentage}%`;
}

function seekAudio(seconds) {
  playTimeSeconds += seconds;
  if (playTimeSeconds < 0) playTimeSeconds = 0;
  if (playTimeSeconds > 288) playTimeSeconds = 288;
  updateTimeDisplay();
}

/* ----------------------------------------------------
   5. Reading Modal
---------------------------------------------------- */
function previewExcerpt(category) {
  openReadingModal();
}

function openReadingModal() {
  const modal = document.getElementById('reading-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeReadingModal() {
  const modal = document.getElementById('reading-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeReadingModal();
});

/* ----------------------------------------------------
   6. Preorder Order Handler & Toast Feedback
---------------------------------------------------- */
function handlePreorder(e) {
  e.preventDefault();

  // Guard check: Must be logged in to order
  if (!isLoggedIn()) {
    const warningToast = document.getElementById('auth-warning-toast');
    if (warningToast) {
      warningToast.classList.remove('translate-y-32', 'opacity-0');
      warningToast.classList.add('translate-y-0', 'opacity-100');
    }
    setTimeout(() => {
      window.location.href = 'auth.html?redirect=preorder&action=buy';
    }, 700);
    return false;
  }

  const name = document.getElementById('order-name').value;
  const phone = document.getElementById('order-phone').value;
  const address = document.getElementById('order-address').value;
  const isGift = document.getElementById('order-gift')?.checked || false;
  const currentUser = getCurrentUser();

  // Save order to history
  const orderData = {
    id: 'ECH-' + Date.now().toString().slice(-6),
    customerName: name,
    customerPhone: phone,
    address: address,
    isGift: isGift,
    userEmail: currentUser ? currentUser.email : 'guest@atelier.vn',
    item: "Hộp Sưu Tầm Nghệ Nhân — Khi Những Khoảng Lặng Biết Lên Tiếng (Bản giới hạn)",
    price: "480.000₫",
    orderedAt: new Date().toLocaleString('vi-VN')
  };

  try {
    const existingOrders = JSON.parse(localStorage.getItem('lechelle_orders') || '[]');
    existingOrders.unshift(orderData);
    localStorage.setItem('lechelle_orders', JSON.stringify(existingOrders));
  } catch (err) {
    console.error('Failed to store order', err);
  }

  const toast = document.getElementById('order-toast');
  if (toast) {
    toast.classList.remove('translate-y-32', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-32', 'opacity-0');
    }, 4500);
  }

  // Clear address but keep customer profile info
  document.getElementById('order-address').value = '';
}

/* ----------------------------------------------------
   7. Mobile Navigation Drawer
---------------------------------------------------- */
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const links = document.querySelectorAll('.mobile-link');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}
