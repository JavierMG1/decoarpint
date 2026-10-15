/**
 * DECOARPINT — Premium Interactions 2026
 * Animations: Custom cursor, scroll reveal, counter, carousel,
 *             parallax, mobile nav, scroll progress, smooth hover
 */

document.addEventListener('DOMContentLoaded', () => {

  // Custom cursor removed — using default browser cursor
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // ════════════════════════════════════════════
  // 2. SCROLL PROGRESS BAR
  // ════════════════════════════════════════════
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  // ════════════════════════════════════════════
  // 3. STICKY HEADER — transparent → dark
  // ════════════════════════════════════════════
  const header = document.querySelector('header');

  function updateHeader() {
    if (!header) return;
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      if (window.scrollY > 40) {
        header.classList.remove('transparent');
        header.classList.add('scrolled');
      } else {
        header.classList.add('transparent');
        header.classList.remove('scrolled');
      }
    } else {
      header.classList.add('scrolled');
    }
  }

  // Hero pages start transparent
  if (document.querySelector('.hero-section')) {
    header?.classList.add('transparent');
  } else {
    header?.classList.add('scrolled');
  }

  // ════════════════════════════════════════════
  // 4. SCROLL LISTENER (throttled with RAF)
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
  // 5. MOBILE NAV
  // ════════════════════════════════════════════
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav  = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on backdrop click
    mobileNav.addEventListener('click', e => {
      if (e.target === mobileNav) {
        menuToggle.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ════════════════════════════════════════════
  // 6. CAROUSEL — Hero
  // ════════════════════════════════════════════
  const slides  = document.querySelectorAll('.carousel-slide');
  const dots    = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  let current = 0;
  let autoplayTimer;

  function goTo(index) {
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    current = ((index % slides.length) + slides.length) % slides.length;
    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  if (slides.length > 0) {
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); resetAutoplay(); });
    });
    prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

    // Touch swipe
    let touchStartX = 0;
    const heroSection = document.querySelector('.hero-section');
    heroSection?.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    heroSection?.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(delta) > 50) {
        goTo(current + (delta > 0 ? 1 : -1));
        resetAutoplay();
      }
    }, { passive: true });

    startAutoplay();
  }

  // ════════════════════════════════════════════
  // 7. SCROLL REVEAL — IntersectionObserver
  // ════════════════════════════════════════════
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

  document.querySelectorAll('[data-reveal]').forEach(el => {
    revealObserver.observe(el);
  });

  // ════════════════════════════════════════════
  // 8. ANIMATED COUNTERS
  // ════════════════════════════════════════════
  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();
    const isFloat  = target % 1 !== 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = target * eased;
      el.textContent = (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-counter]').forEach(el => {
    counterObserver.observe(el);
  });

  // ════════════════════════════════════════════
  // 9. PHONE DROPDOWN (footer)
  // ════════════════════════════════════════════
  document.querySelectorAll('#phoneToggle').forEach(toggle => {
    const container = toggle.closest('.phone-container');
    const dropdown  = container?.querySelector('.phone-dropdown');

    if (!dropdown) return;

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
    });

    document.addEventListener('click', e => {
      if (!container.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  });

  // ════════════════════════════════════════════
  // 10. PARALLAX — subtle on hero text
  // ════════════════════════════════════════════
  const parallaxEls = document.querySelectorAll('[data-parallax]');

  if (parallaxEls.length > 0) {
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translateY(${sy * speed}px)`;
      });
    }, { passive: true });
  }

  // ════════════════════════════════════════════
  // 11. MAGNETIC BUTTONS — subtle effect
  // ════════════════════════════════════════════
  if (isFinePointer) {
    document.querySelectorAll('.btn-primary, .btn-outline, .carousel-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) * 0.18;
        const dy = (e.clientY - cy) * 0.18;
        btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

});
