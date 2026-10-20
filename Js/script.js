/**
 * DECOARPINT — Interacciones del diseño «Carta de color»
 * Menú móvil, prueba de color de la portada, apariciones al hacer scroll,
 * foto que sigue al cursor en la lista de hospitales, pincelada del método,
 * contadores y año del pie.
 */

document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer   = window.matchMedia('(pointer: fine)').matches;

  // Interface texts set from JS (the page language comes from <html lang>)
  const T = document.documentElement.lang === 'en'
    ? { openMenu: 'Open menu', closeMenu: 'Close menu' }
    : { openMenu: 'Abrir menú', closeMenu: 'Cerrar menú' };

  // ════════════════════════════════════════════
  // 1. MENÚ MÓVIL
  // ════════════════════════════════════════════
  const burger = document.querySelector('.pp-burger');
  const menu   = document.getElementById('ppMenu');

  if (burger && menu) {
    const setMenu = (open, restoreFocus) => {
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? T.closeMenu : T.openMenu);
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) menu.querySelector('a')?.focus({ preventScroll: true });
      else if (restoreFocus) burger.focus();
    };

    burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
    // Leaving the mobile breakpoint closes the menu
    window.matchMedia('(min-width: 1181px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  }

  // ════════════════════════════════════════════
  // 2. PRUEBA DE COLOR (hero de la portada)
  // ════════════════════════════════════════════
  const hero = document.querySelector('.pp-hero');
  const swatches = document.querySelectorAll('.pp-swatch');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const themeHex = { marfil: '#f7f4ef', carbon: '#111111', teja: '#c8390f', dorado: '#c4a265' };

  swatches.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      if (theme === 'marfil') hero.removeAttribute('data-theme');
      else hero.dataset.theme = theme;
      swatches.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      themeColor?.setAttribute('content', themeHex[theme]);
    });
  });

  // ════════════════════════════════════════════
  // 3. APARICIONES AL HACER SCROLL
  // ════════════════════════════════════════════
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('revealed'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // Stagger siblings that appear together, unless a delay is set in the HTML
        if (!entry.target.hasAttribute('data-delay')) {
          const siblings = [...entry.target.parentElement.children].filter(c => c.hasAttribute('data-reveal'));
          entry.target.style.transitionDelay = (Math.max(0, siblings.indexOf(entry.target)) * 0.08) + 's';
        }
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  // ════════════════════════════════════════════
  // 4. FOTO QUE SIGUE AL CURSOR (lista de hospitales)
  // ════════════════════════════════════════════
  const preview = document.querySelector('.pp-preview');
  const previewImg = preview?.querySelector('img');
  const cases = document.querySelectorAll('.pp-case[data-img]');

  if (preview && finePointer && !reducedMotion) {
    let x = 0, y = 0, px = 0, py = 0, raf = null;

    const loop = () => {
      px += (x - px) * 0.18;
      py += (y - py) * 0.18;
      preview.style.left = px + 'px';
      preview.style.top  = py + 'px';
      raf = Math.abs(x - px) + Math.abs(y - py) > 0.5 ? requestAnimationFrame(loop) : null;
    };

    cases.forEach(item => {
      item.addEventListener('mouseenter', e => {
        previewImg.src = item.dataset.img;
        if (!preview.classList.contains('is-visible')) { px = x = e.clientX + 140; py = y = e.clientY; }
        preview.classList.add('is-visible');
      });
      item.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
      item.addEventListener('mousemove', e => {
        x = e.clientX + 140; y = e.clientY;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
    window.addEventListener('scroll', () => preview.classList.remove('is-visible'), { passive: true });
  }

  // ════════════════════════════════════════════
  // 5. PINCELADA DEL MÉTODO (se dibuja con el scroll)
  // ════════════════════════════════════════════
  const strokePath = document.querySelector('.pp-stroke path');
  const processWrap = document.querySelector('.pp-process-wrap');

  if (strokePath && processWrap) {
    const len = strokePath.getTotalLength();
    strokePath.style.setProperty('--len', len);
    strokePath.style.setProperty('--off', reducedMotion ? 0 : len);

    if (!reducedMotion) {
      let ticking = false;
      const update = () => {
        const r = processWrap.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height * 0.9)));
        strokePath.style.setProperty('--off', len * (1 - progress));
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      update();
    }
  }

  // ════════════════════════════════════════════
  // 6. CONTADORES (el HTML ya trae el valor final)
  // ════════════════════════════════════════════
  const counters = document.querySelectorAll('[data-count]');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.count;
        const start = performance.now();
        const step = now => {
          const p = Math.min((now - start) / 1600, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => co.observe(el));
  }

  // ════════════════════════════════════════════
  // 7. AÑO DEL PIE
  // ════════════════════════════════════════════
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
});
