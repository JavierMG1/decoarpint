/**
 * DECOARPINT — Interacciones
 * Barra de progreso, header, menú móvil, carrusel, scroll reveal,
 * contadores, desplegable de teléfonos, botones magnéticos
 */

document.addEventListener('DOMContentLoaded', () => {

  const isFinePointer  = window.matchMedia('(pointer: fine)').matches;
  const reducedMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ════════════════════════════════════════════
  // 1. SCROLL PROGRESS BAR
  // ════════════════════════════════════════════
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress  = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  // ════════════════════════════════════════════
  // 2. STICKY HEADER — transparent → dark
  // ════════════════════════════════════════════
  const header      = document.querySelector('header');
  const heroSection = document.querySelector('.hero-section');

  function updateHeader() {
    if (!header) return;
    const solid = !heroSection || window.scrollY > 40;
    header.classList.toggle('scrolled', solid);
    header.classList.toggle('transparent', !solid);
  }

  // ════════════════════════════════════════════
  // 3. SCROLL LISTENER (throttled with RAF)
  // ════════════════════════════════════════════
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateHeader();
  updateProgress();

  // ════════════════════════════════════════════
  // 4. MOBILE NAV
  // ════════════════════════════════════════════
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav  = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    function setMenu(open, { restoreFocus = false } = {}) {
      menuToggle.classList.toggle('open', open);
      mobileNav.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        mobileNav.querySelector('a')?.focus({ preventScroll: true });
      } else if (restoreFocus) {
        menuToggle.focus();
      }
    }

    menuToggle.addEventListener('click', () => {
      setMenu(!mobileNav.classList.contains('open'));
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    // Close on backdrop click
    mobileNav.addEventListener('click', e => {
      if (e.target === mobileNav) setMenu(false);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        setMenu(false, { restoreFocus: true });
      }
    });

    // Leaving the mobile breakpoint closes the menu
    window.matchMedia('(min-width: 1121px)').addEventListener('change', e => {
      if (e.matches) setMenu(false);
    });
  }

  // ════════════════════════════════════════════
  // 5. CAROUSEL — Hero
  // ════════════════════════════════════════════
  const slides   = document.querySelectorAll('.carousel-slide');
  const dots     = document.querySelectorAll('.dot');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const AUTOPLAY_MS = 6000;
  let current = 0;
  let autoplayTimer = null;
  let userPaused = reducedMotion;   // no autoplay with reduced motion
  let hoverPaused = false;

  function goTo(index) {
    if (!slides.length) return;
    current = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === current;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.inert = !active;
    });
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function syncAutoplay() {
    stopAutoplay();
    if (!userPaused && !hoverPaused && !document.hidden && slides.length > 1) {
      autoplayTimer = setInterval(() => goTo(current + 1), AUTOPLAY_MS);
    }
  }

  function updatePauseBtn() {
    if (!pauseBtn) return;
    pauseBtn.classList.toggle('paused', userPaused);
    pauseBtn.setAttribute('aria-label', userPaused ? 'Reanudar carrusel' : 'Pausar carrusel');
  }

  if (slides.length > 0) {
    goTo(0);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); syncAutoplay(); });
    });
    prevBtn?.addEventListener('click', () => { goTo(current - 1); syncAutoplay(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); syncAutoplay(); });

    pauseBtn?.addEventListener('click', () => {
      userPaused = !userPaused;
      updatePauseBtn();
      syncAutoplay();
    });

    // Pause while the pointer or keyboard focus is inside the hero
    if (heroSection) {
      heroSection.addEventListener('mouseenter', () => { hoverPaused = true;  syncAutoplay(); });
      heroSection.addEventListener('mouseleave', () => { hoverPaused = false; syncAutoplay(); });
      heroSection.addEventListener('focusin',    () => { hoverPaused = true;  syncAutoplay(); });
      heroSection.addEventListener('focusout', e => {
        if (!heroSection.contains(e.relatedTarget)) { hoverPaused = false; syncAutoplay(); }
      });

      // Touch swipe
      let touchStartX = 0;
      heroSection.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      heroSection.addEventListener('touchend', e => {
        const delta = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(delta) > 50) {
          goTo(current + (delta > 0 ? 1 : -1));
          syncAutoplay();
        }
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', syncAutoplay);

    updatePauseBtn();
    syncAutoplay();
  }

  // ════════════════════════════════════════════
  // 6. SCROLL REVEAL — IntersectionObserver
  // ════════════════════════════════════════════
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('revealed'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // ════════════════════════════════════════════
  // 7. ANIMATED COUNTERS
  //    El HTML ya contiene el valor final; solo se anima si procede.
  // ════════════════════════════════════════════
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();
    const isFloat  = target % 1 !== 0;

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease out cubic
      const value    = target * eased;
      el.textContent = (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }

    requestAnimationFrame(step);
  }

  const counters = document.querySelectorAll('[data-counter]');

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(el => {
      el.textContent = '0' + (el.dataset.suffix || '');
      counterObserver.observe(el);
    });
  }

  // ════════════════════════════════════════════
  // 8. PHONE DROPDOWN (footer)
  // ════════════════════════════════════════════
  document.querySelectorAll('.phone-container').forEach(container => {
    const toggle   = container.querySelector('#phoneToggle');
    const dropdown = container.querySelector('.phone-dropdown');
    if (!toggle || !dropdown) return;

    function setDropdown(open) {
      dropdown.classList.toggle('show', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      setDropdown(!dropdown.classList.contains('show'));
    });

    document.addEventListener('click', e => {
      if (!container.contains(e.target)) setDropdown(false);
    });

    container.addEventListener('keydown', e => {
      if (e.key === 'Escape' && dropdown.classList.contains('show')) {
        setDropdown(false);
        toggle.focus();
      }
    });

    container.addEventListener('focusout', e => {
      if (!container.contains(e.relatedTarget)) setDropdown(false);
    });
  });

  // ════════════════════════════════════════════
  // 9. FOOTER YEAR
  // ════════════════════════════════════════════
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ════════════════════════════════════════════
  // 10. MAGNETIC BUTTONS — subtle effect
  // ════════════════════════════════════════════
  if (isFinePointer && !reducedMotion) {
    document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.18;
        const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.18;
        btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

});
