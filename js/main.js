/* ============================================================
   I18N — Texts in both languages
============================================================ */
const LANG = {
  es: {
    nav_portfolio:     'Portafolio',
    nav_about:         'Sobre mí',
    nav_contact:       'Contacto',
    hero_available:    'Disponible para proyectos',
    hero_tagline:      'Vibecoder y algo más…',
    hero_cta:          'Ver mi trabajo',
    about_quote:       '”No hablo de lo que puedo hacer.<br>Lo muestro.”',
    about_cta:         'Saber más',
    contact_heading:   'Hablemos',
    contact_sub:       '¿Tenés un proyecto? Escribime.',
    // Project sections
    dp_p1_desc:      'Agencia de viajes personalizada',
    dp_soon:         'Próximamente',
    proj_cta:        'Ver proyecto',
    proj_soon_desc:  'Este proyecto llega pronto.',
    // Drawer — about
    da_label:   'Sobre mí',
    da_heading: 'Joel Pacheco',
    da_bio:     'Soy Joel, un vibecoder. Traduzco ideas en webs que funcionan y que se ven bien. No necesito que me expliquen todo—entiendo rápido, ejecuto rápido y si veo algo que se puede mejorar, lo digo.',
    da_t1_h:    'Vibecoder',
    da_t1_p:    'Construyo webs funcionales y bien diseñadas partiendo de una idea. Sin vueltas.',
    da_t2_h:    'Proactivo',
    da_t2_p:    'No espero que me digan qué hacer. Identifico el problema, propongo la solución y ejecuto.',
    da_t3_h:    'Orientado a resultados',
    da_t3_p:    'El objetivo no es el código. El objetivo es que el proyecto funcione y genere valor real.',
  },
  en: {
    nav_portfolio:     'Portfolio',
    nav_about:         'About',
    nav_contact:       'Contact',
    hero_available:    'Available for projects',
    hero_tagline:      'Vibecoder and something more…',
    hero_cta:          ‘See my work’,
    about_quote:       ‘”I don\’t talk about what I can do.<br>I show it.”’,
    about_cta:         'Learn more',
    contact_heading:   "Let's talk",
    contact_sub:       'Got a project in mind? Write me.',
    // Project sections
    dp_p1_desc:      'Personalized travel agency',
    dp_soon:         'Coming soon',
    proj_cta:        'View project',
    proj_soon_desc:  'This project is coming soon.',
    // Drawer — about
    da_label:   'About',
    da_heading: 'Joel Pacheco',
    da_bio:     "I'm Joel, a vibecoder. I turn ideas into websites that work and look good. I don’t need everything explained—I catch on fast, execute fast, and if I spot something that could be better, I say so.",
    da_t1_h:    'Vibecoder',
    da_t1_p:    'I build functional, well-designed websites starting from an idea. No fluff.',
    da_t2_h:    'Proactive',
    da_t2_p:    "I don’t wait to be told what to do. I spot the problem, propose the solution, and execute.",
    da_t3_h:    'Results-driven',
    da_t3_p:    "The goal isn’t the code. The goal is a project that works and creates real value.",
  },
};

/* ============================================================
   GREETINGS — carousel slide right → left
   Each word slides in from the right, holds, exits to the left.
   Pure CSS transitions + setTimeout (no rAF throttle issues).
============================================================ */
const GREETINGS = [
  { text: 'Hola'     },
  { text: 'Hello'    },
  { text: 'Ciao'     },
  { text: 'Bonjour'  },
  { text: 'こんにちは' },
  { text: 'مرحبا',   rtl: true },
  { text: 'Olá' },
  { text: '你好' },
];

const ENTER_MS = 130; // slide in from right
const HOLD_MS  = 145; // stay visible
const EXIT_MS  = 100; // slide out to left
// Total per greeting: 130 + 145 + 100 = 375ms × 8 = 3000ms

/* ============================================================
   STATE
============================================================ */
let currentLang   = 'es';
let currentDrawer = null;

/* ============================================================
   LANGUAGE
============================================================ */
function detectLang() {
  const l = (navigator.language || 'es').toLowerCase();
  return l.startsWith('en') ? 'en' : 'es';
}

function applyLang(lang, animated) {
  currentLang = lang;
  const t = LANG[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] === undefined) return;
    el.innerHTML = t[key];
  });

  document.getElementById('lang-toggle').textContent = lang === 'es' ? 'EN' : 'ES';
  document.documentElement.lang = lang;

  // Re-render open drawer in new language
  if (currentDrawer) renderDrawerBody(currentDrawer);
}

/* ============================================================
   INTRO ANIMATION
   Uses CSS transitions + setTimeout — NOT requestAnimationFrame.
   rAF is throttled by Chrome in inactive/background tabs, but
   setTimeout (while also throttled) still fires and CSS
   transitions complete as soon as the tab becomes active.
   A 5 s safety net force-completes the intro in any edge case.
============================================================ */
function finishIntro() {
  const box = document.getElementById('intro');
  if (box.dataset.done) return; // already done
  box.dataset.done = '1';
  box.style.transition = 'opacity 400ms ease';
  box.style.opacity    = '0';
  box.style.pointerEvents = 'none';
  setTimeout(() => {
    box.style.display = 'none';
    document.body.classList.add('intro-done'); // triggers hero CSS animations
    animateHero();
  }, 420);
}

async function runIntro() {
  const el  = document.getElementById('greeting');
  const box = document.getElementById('intro');

  // Safety net: force-finish after 5 s no matter what
  const safetyTimer = setTimeout(finishIntro, 5000);

  for (let i = 0; i < GREETINGS.length; i++) {
    const g = GREETINGS[i];

    // — RESET: place word off-screen to the right, instantly —
    el.style.transition = 'none';
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(60px)';
    el.style.direction  = g.rtl ? 'rtl' : 'ltr';
    el.textContent      = g.text;

    // One paint tick so the browser registers the reset position
    await wait(20);

    // — ENTER: slide in from right —
    el.style.transition = `opacity ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1), transform ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1)`;
    el.style.opacity    = '1';
    el.style.transform  = 'translateX(0)';
    await wait(ENTER_MS + HOLD_MS);

    // — EXIT: slide out to the left (skip on last — overlay takes over) —
    if (i < GREETINGS.length - 1) {
      el.style.transition = `opacity ${EXIT_MS}ms cubic-bezier(0.55,0,1,0.45), transform ${EXIT_MS}ms cubic-bezier(0.55,0,1,0.45)`;
      el.style.opacity    = '0';
      el.style.transform  = 'translateX(-60px)';
      await wait(EXIT_MS);
    }
  }

  clearTimeout(safetyTimer);
  finishIntro();
}

/* ============================================================
   HERO ENTRANCE — handled by CSS animations triggered when
   finishIntro() sets #app style="opacity: 1"
   animateHero() kept as a no-op for compatibility.
============================================================ */
function animateHero() {
  // CSS @keyframes take over once #app has inline opacity:1
}

/* ============================================================
   SCROLL-TRIGGERED SECTION ANIMATIONS + IFRAME LAZY LOAD
============================================================ */
function scaleProjectIframe(section) {
  const iframe = section.querySelector('iframe');
  if (!iframe) return;
  const w           = section.clientWidth  || window.innerWidth;
  const h           = section.clientHeight || (window.innerHeight - 64);
  const designWidth = 1440;
  const scale       = w / designWidth;
  const iframeH     = Math.ceil(h / scale);
  iframe.style.width           = designWidth + 'px';
  iframe.style.height          = iframeH + 'px';
  iframe.style.transform       = `scale(${scale})`;
  iframe.style.transformOrigin = 'top left';
}

function initScrollObserver() {
  const sections = document.querySelectorAll('.snap-sec:not(#sec-hero)');
  const root     = document.getElementById('scroll-wrap');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const sec = e.target;
      sec.classList.add('in-view');

      // Lazy-load project iframes when section first enters view
      const iframe = sec.querySelector('iframe[data-src]');
      if (iframe) {
        iframe.src = iframe.dataset.src;
        delete iframe.dataset.src;
        scaleProjectIframe(sec);
      }
    });
  }, { root, threshold: 0.25 });

  sections.forEach(s => obs.observe(s));

  // Initial scale for all project iframes already in view
  document.querySelectorAll('.proj-sec').forEach(scaleProjectIframe);
}

/* ============================================================
   DRAWER
============================================================ */
function buildPortfolioHTML() {
  const t = LANG[currentLang];
  return `
    <div class="d-label">${t.dp_label}</div>
    <h2 class="d-heading">${t.dp_heading}</h2>
    <div class="p-grid">

      <!-- Project 1 -->
      <div class="p-card" role="link" tabindex="0"
           data-url="https://oltremondo.ar"
           onclick="window.open('https://oltremondo.ar','_blank')">
        <div class="p-iframe-wrap">
          <iframe src="https://oltremondo.ar"
                  scrolling="no"
                  loading="lazy"
                  tabindex="-1"
                  title="Oltremondo"></iframe>
        </div>
        <div class="p-overlay"></div>
        <div class="p-info">
          <div>
            <div class="p-name">${t.dp_p1_name}</div>
            <div class="p-desc">${t.dp_p1_desc}</div>
          </div>
          <div class="p-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Project 2 — coming soon -->
      <div class="p-card p-coming">
        <div class="p-placeholder">
          <span class="p-placeholder-text">${t.dp_soon}</span>
        </div>
        <div class="p-overlay"></div>
        <div class="p-info">
          <div>
            <div class="p-name" style="opacity:.35">${t.dp_soon}</div>
          </div>
        </div>
      </div>

      <!-- Project 3 — coming soon -->
      <div class="p-card p-coming">
        <div class="p-placeholder">
          <span class="p-placeholder-text">${t.dp_soon}</span>
        </div>
        <div class="p-overlay"></div>
        <div class="p-info">
          <div>
            <div class="p-name" style="opacity:.35">${t.dp_soon}</div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function buildAboutHTML() {
  const t = LANG[currentLang];
  return `
    <div class="d-label">${t.da_label}</div>
    <h2 class="d-heading">${t.da_heading}</h2>
    <p class="about-bio">${t.da_bio}</p>
    <div class="trait-list">
      <div class="trait">
        <span class="trait-num">01</span>
        <div class="trait-body">
          <h3>${t.da_t1_h}</h3>
          <p>${t.da_t1_p}</p>
        </div>
      </div>
      <div class="trait">
        <span class="trait-num">02</span>
        <div class="trait-body">
          <h3>${t.da_t2_h}</h3>
          <p>${t.da_t2_p}</p>
        </div>
      </div>
      <div class="trait">
        <span class="trait-num">03</span>
        <div class="trait-body">
          <h3>${t.da_t3_h}</h3>
          <p>${t.da_t3_p}</p>
        </div>
      </div>
    </div>
  `;
}

function renderDrawerBody(type) {
  const body = document.getElementById('drawer-body');
  body.innerHTML = type === 'portfolio' ? buildPortfolioHTML() : buildAboutHTML();

  if (type === 'portfolio') scaleIframes();
}

function openDrawer(type) {
  currentDrawer = type;

  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');

  renderDrawerBody(type);

  overlay.classList.add('active');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');

  // Lock main scroll
  document.getElementById('scroll-wrap').style.overflow = 'hidden';
}

function closeDrawer() {
  currentDrawer = null;

  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');

  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('active');

  document.getElementById('scroll-wrap').style.overflow = '';

  // Clear HTML after transition finishes
  setTimeout(() => {
    if (!drawer.classList.contains('open')) {
      document.getElementById('drawer-body').innerHTML = '';
    }
  }, 750);
}

/* ============================================================
   IFRAME SCALING
   Dynamically scales iframes to exactly fill their card
============================================================ */
function scaleIframes() {
  document.querySelectorAll('.p-iframe-wrap').forEach(wrap => {
    const card   = wrap.closest('.p-card');
    const cw     = card.clientWidth;
    const ch     = card.clientHeight;
    const iw     = 1280;
    const scale  = cw / iw;
    const ih     = Math.ceil(ch / scale);

    const iframe = wrap.querySelector('iframe');
    if (!iframe) return;

    iframe.style.width           = iw + 'px';
    iframe.style.height          = ih + 'px';
    iframe.style.transform       = `scale(${scale})`;
    iframe.style.transformOrigin = 'top left';
  });
}

/* ============================================================
   EVENT LISTENERS
============================================================ */
function initEvents() {
  // Open drawer buttons / links
  document.querySelectorAll('[data-drawer]').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      openDrawer(el.dataset.drawer);
    });
  });

  // Scroll nav (contact)
  document.querySelectorAll('[data-scroll]').forEach(el => {
    el.addEventListener('click', () => {
      const target = document.getElementById('sec-' + el.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Close drawer
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

  // Language toggle
  document.getElementById('lang-toggle').addEventListener('click', () => {
    applyLang(currentLang === 'es' ? 'en' : 'es', true);
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Recalc iframes on resize
  window.addEventListener('resize', () => {
    document.querySelectorAll('.proj-sec').forEach(scaleProjectIframe);
    if (currentDrawer === 'about') return; // drawer has no iframes
  });
}

/* ============================================================
   UTILS
============================================================ */
function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  currentLang = detectLang();
  applyLang(currentLang, false);
  initEvents();
  initScrollObserver();
  runIntro();
});
