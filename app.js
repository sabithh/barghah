(function () {
  'use strict';

  const CHARS = 'BARGHAB@#$%&XYZ0123456789';
  const ease  = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // Detect touch — disable heavy effects on mobile
  const isTouch = window.matchMedia('(hover: none)').matches;

  // ── Hamburger menu ──────────────────────
  const burger  = document.getElementById('navBurger');
  const mobMenu = document.getElementById('mobMenu');
  let   menuOpen = false;

  function toggleMenu(force) {
    menuOpen = force !== undefined ? force : !menuOpen;
    burger.classList.toggle('open', menuOpen);
    mobMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }

  burger && burger.addEventListener('click', () => toggleMenu());

  // Close menu when any mobile link is tapped
  document.querySelectorAll('.mob-menu__a, .mob-menu__cta').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false));
  });


  // ══════════════════════════════════════════════════
  //  CANVAS BACKGROUND — dot grid that responds to mouse
  // ══════════════════════════════════════════════════
  const bgCanvas = document.getElementById('bgCanvas');
  const bgCtx    = bgCanvas.getContext('2d');
  let   BW, BH, mx = -999, my = -999;
  const GRID = 48, R = 1.5, PULL = 140;

  if (!isTouch) {
    function resizeBg() {
      BW = bgCanvas.width  = window.innerWidth;
      BH = bgCanvas.height = window.innerHeight;
    }
    resizeBg();
    window.addEventListener('resize', resizeBg);
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function drawBg() {
      bgCtx.clearRect(0, 0, BW, BH);
      for (let x = GRID / 2; x < BW; x += GRID) {
        for (let y = GRID / 2; y < BH; y += GRID) {
          const dx  = mx - x, dy = my - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.max(0, 1 - dist / PULL);
          const ox   = dx * pull * 0.3;
          const oy   = dy * pull * 0.3;
          const r    = R + pull * 3;
          const alpha = 0.12 + pull * 0.5;
          bgCtx.beginPath();
          bgCtx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
          bgCtx.fillStyle = `rgba(139,26,46,${alpha})`;
          bgCtx.fill();
        }
      }
      requestAnimationFrame(drawBg);
    }
    drawBg();
  }

  // ══════════════════════════════════════════════════
  //  PRELOADER
  // ══════════════════════════════════════════════════
  const preloader = document.getElementById('preloader');
  const preCount  = document.getElementById('preCount');
  const preFill   = document.getElementById('preFill');
  let   pct = 0;

  const pInt = setInterval(() => {
    pct += Math.random() * 9 + 3;
    if (pct >= 100) { pct = 100; clearInterval(pInt); finishPreloader(); }
    preCount.textContent = Math.floor(pct);
    preFill.style.width  = pct + '%';
  }, 45);

  function finishPreloader() {
    setTimeout(() => {
      gsap.to(preloader, {
        yPercent: -100, duration: 1.2, ease: 'power4.inOut',
        onComplete: () => {
          preloader.remove();
          document.body.classList.remove('loading');
          launchSite();
        }
      });
    }, 350);
  }

  // ══════════════════════════════════════════════════
  //  CURSOR + MAGNETIC (desktop only)
  // ══════════════════════════════════════════════════
  if (!isTouch) {
    const cur     = document.getElementById('cur');
    const curText = document.getElementById('curText');
    let   curX = 0, curY = 0, curTX = window.innerWidth / 2, curTY = window.innerHeight / 2;

    document.addEventListener('mousemove', e => { curTX = e.clientX; curTY = e.clientY; });

    (function curRaf() {
      curX += (curTX - curX) * 0.1;
      curY += (curTY - curY) * 0.1;
      cur.style.left     = curX + 'px';
      cur.style.top      = curY + 'px';
      curText.style.left = curTX + 'px';
      curText.style.top  = (curTY + 32) + 'px';
      requestAnimationFrame(curRaf);
    })();

    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('big'));
      el.addEventListener('mouseleave', () => { cur.classList.remove('big','view'); curText.classList.remove('show'); curText.textContent = ''; });
    });
    document.querySelectorAll('.work-item').forEach(el => {
      el.addEventListener('mouseenter', () => { cur.classList.remove('big'); cur.classList.add('view'); curText.textContent = 'VIEW →'; curText.classList.add('show'); });
      el.addEventListener('mouseleave', () => { cur.classList.remove('view'); curText.classList.remove('show'); curText.textContent = ''; });
    });
    document.querySelectorAll('.btn-fire,.link-arrow,.nav__cta').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        const xc = e.clientX - r.left - r.width  / 2;
        const yc = e.clientY - r.top  - r.height / 2;
        gsap.to(el, { x: xc * 0.35, y: yc * 0.4, duration: 0.4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' }));
    });
  }

  // ══════════════════════════════════════════════════
  //  LENIS SMOOTH SCROLL
  // ══════════════════════════════════════════════════
  const lenis = new Lenis({ duration: 1.35, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  (function lenisRaf(t) { lenis.raf(t); requestAnimationFrame(lenisRaf); })(0);

  // ══════════════════════════════════════════════════
  //  GSAP + SCROLLTRIGGER
  // ══════════════════════════════════════════════════
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Scroll progress bar + floating nav
  const scrollBar = document.getElementById('scrollBar');
  const navEl     = document.getElementById('nav');
  lenis.on('scroll', (e) => {
    scrollBar.style.width = (e.progress * 100) + '%';
    if (navEl) {
      if (e.scroll > 50) {
        navEl.classList.add('nav--scrolled');
      } else {
        navEl.classList.remove('nav--scrolled');
      }
    }
  });

  // ══════════════════════════════════════════════════
  //  MAIN SITE LAUNCH
  // ══════════════════════════════════════════════════
  function launchSite() {

    // Nav fly in
    gsap.to('#nav', { y: 0, duration: 1, ease: 'power4.out', delay: 0.1 });
    document.getElementById('nav').classList.add('visible');

    // ── Hero entrance ─────────────────────────────
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero__row span', { y: '0%', duration: 1.3, stagger: 0.1 }, 0)
      .from('.hero__kicker',    { opacity: 0, y: 15, duration: 0.8 }, 0.4)
      .from('.hero__desc',      { opacity: 0, y: 20, duration: 0.9 }, 0.6)
      .from('.hero__actions',   { opacity: 0, y: 20, duration: 0.9 }, 0.75)
      .from('.hero__ticker-wrap',{ opacity: 0, y: 10, duration: 0.8 }, 0.9)
      .to('#scrollCue',          { opacity: 1, duration: 1 }, 1.2);

    // ── Section heading char splits ───────────────
    document.querySelectorAll('[data-split]').forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      text.split('').forEach(ch => {
        const w = document.createElement('span'); w.className = 'char-wrap';
        const c = document.createElement('span'); c.className = 'char';
        c.textContent = ch === ' ' ? '\u00A0' : ch;
        w.appendChild(c); el.appendChild(w);
      });
      gsap.fromTo(el.querySelectorAll('.char'), { y: '110%' }, {
        y: '0%', duration: 0.8, stagger: 0.02, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true }
      });
    });

    // ── Tag labels slide in ───────────────────────
    gsap.utils.toArray('.tag').forEach(el => {
      gsap.from(el, {
        opacity: 0, x: -20, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // ── Paragraph reveals ─────────────────────────
    gsap.utils.toArray('[data-reveal]').forEach((el, i) => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // ── About section — clip-path wipe ───────────
    ScrollTrigger.create({
      trigger: '#about', start: 'top 75%', once: true,
      onEnter: () => {
        gsap.from('#about .about__cols p', {
          clipPath: 'inset(0 100% 0 0)', opacity: 0,
          duration: 1.1, stagger: 0.15, ease: 'power4.out',
          onStart: () => { document.querySelectorAll('#about .about__cols p').forEach(p => p.style.clipPath = ''); }
        });
      }
    });

    // ── Service items — stagger slide from left ───
    const srvItems = document.querySelectorAll('.srv-item');
    const srvObserver = new IntersectionObserver((entries) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            e.target.classList.add('in-view');
          }, idx * 80);
          srvObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    srvItems.forEach(el => srvObserver.observe(el));

    // ── Portfolio items — stagger slide up ────────
    const workObserver = new IntersectionObserver((entries) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in-view'), idx * 90);
          workObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.work-item').forEach(el => workObserver.observe(el));

    // ── Portfolio — floating preview on hover ─────
    const preview    = document.getElementById('workPreview');
    const previewImg = document.getElementById('workPreviewImg');
    const WDATA = {
      work1: { bg: 'linear-gradient(135deg,#001808,#003818)', label: 'SMART\nRESUME' },
      work2: { bg: 'linear-gradient(135deg,#001525,#002c4f)', label: 'BAKERY\nMANAGER' },
      work3: { bg: 'linear-gradient(135deg,#250a00,#481500)', label: 'RESQ\nMINI' },
      work4: { bg: 'linear-gradient(135deg,#0d0025,#1b004a)', label: 'TOOLSY\nCLI' },
      work5: { bg: 'linear-gradient(135deg,#200028,#3f004f)', label: 'HELLO\nPEOPLE' },
    };
    document.querySelectorAll('.work-item[data-work]').forEach(item => {
      const key = item.getAttribute('data-preview');
      const d   = WDATA[key] || { bg: '#111', label: '' };
      item.addEventListener('mouseenter', () => {
        previewImg.style.background = d.bg;
        previewImg.innerHTML = `<div style="font-family:var(--ff);font-size:1.6rem;font-weight:800;color:rgba(255,255,255,0.15);text-align:center;white-space:pre-line;letter-spacing:-0.02em;line-height:1.2">${d.label}</div>`;
        preview.classList.add('active');
      });
      item.addEventListener('mousemove', e => {
        gsap.to(preview, { left: e.clientX + 32, top: e.clientY - 90, duration: 0.5, ease: 'power2.out' });
      });
      item.addEventListener('mouseleave', () => preview.classList.remove('active'));
    });



    // ── Section line dividers animate in ─────────
    gsap.utils.toArray('.divline').forEach(el => {
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: () => el.classList.add('revealed')
      });
    });

    // ── Parallax on hero titles (scroll scrub) ────
    gsap.to('.hero__titles', {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
    });
    gsap.to('.hero__kicker', {
      yPercent: -35, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '50% top', scrub: 1 }
    });
    gsap.to('.hero__bottom', {
      yPercent: -12, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '20% top', end: 'bottom top', scrub: 1 }
    });
    gsap.to('#scrollCue', {
      opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '10% top', end: '25% top', scrub: 1 }
    });

    // ── Horizontal ticker speed on scroll ────────
    let tickerSpeed = 1;
    lenis.on('scroll', ({ velocity }) => {
      tickerSpeed = 1 + Math.abs(velocity) * 0.03;
      document.querySelector('.hero__ticker').style.animationDuration = (28 / tickerSpeed) + 's';
    });

    // ── Testimonials ──────────────────────────────
    const testiSlides = document.querySelectorAll('.testi');
    const progFill    = document.getElementById('testiProgFill');
    const testiIdx    = document.getElementById('testiIdx');
    let   tIdx = 0, autoTimer;

    function goTesti(n) {
      gsap.to(testiSlides[tIdx], { opacity: 0, y: -15, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          testiSlides[tIdx].classList.remove('active');
          tIdx = (n + testiSlides.length) % testiSlides.length;
          testiSlides[tIdx].classList.add('active');
          gsap.fromTo(testiSlides[tIdx], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
          progFill.style.transition = 'none'; progFill.style.width = '0%';
          requestAnimationFrame(() => {
            progFill.style.transition = 'width 5.5s linear'; progFill.style.width = '100%';
          });
          testiIdx.textContent = `${String(tIdx + 1).padStart(2,'0')} / ${String(testiSlides.length).padStart(2,'0')}`;
        }
      });
    }

    document.getElementById('tNext').addEventListener('click', () => { clearTimeout(autoTimer); goTesti(tIdx + 1); resetAuto(); });
    document.getElementById('tPrev').addEventListener('click', () => { clearTimeout(autoTimer); goTesti(tIdx - 1); resetAuto(); });
    function resetAuto() { autoTimer = setTimeout(() => { goTesti(tIdx + 1); resetAuto(); }, 5500); }
    // Init
    progFill.style.transition = 'none'; progFill.style.width = '0%';
    requestAnimationFrame(() => { progFill.style.transition = 'width 5.5s linear'; progFill.style.width = '100%'; });
    testiIdx.textContent = `01 / 0${testiSlides.length}`;
    resetAuto();

    // ── Text scramble ─────────────────────────────
    function scramble(el) {
      const orig = el.getAttribute('data-text') || el.textContent;
      let f = 0;
      const iv = setInterval(() => {
        el.textContent = orig.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (f / 22 > i / orig.length) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        if (++f > 22) { clearInterval(iv); el.textContent = orig; }
      }, 28);
    }
    document.querySelectorAll('.scramble,.footer__big').forEach(el => {
      el.addEventListener('mouseenter', () => scramble(el));
    });

    // ── Nav active section highlight ──────────────
    document.querySelectorAll('.section, .hero').forEach(sec => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 50%', end: 'bottom 50%',
        onEnter: () => highlightNav(sec.id),
        onEnterBack: () => highlightNav(sec.id)
      });
    });
    function highlightNav(id) {
      document.querySelectorAll('.nav__a').forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--fire)' : '';
      });
    }

    // ── Contact form ──────────────────────────────
    const cForm = document.getElementById('cForm');
    const fBtn  = document.getElementById('fBtn');
    cForm && cForm.addEventListener('submit', e => {
      e.preventDefault();
      gsap.to(fBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
      const orig = fBtn.textContent;
      setTimeout(() => {
        fBtn.textContent = 'Message Sent ✓';
        fBtn.style.background = '#16a34a';
        gsap.from(fBtn, { scale: 0.9, duration: 0.5, ease: 'back.out(2)' });
        setTimeout(() => { fBtn.textContent = orig; fBtn.style.background = ''; cForm.reset(); }, 3500);
      }, 300);
    });

    // ── Input focus glow ──────────────────────────
    document.querySelectorAll('input,textarea,select').forEach(inp => {
      inp.addEventListener('focus', () => gsap.to(inp, { borderBottomColor: 'var(--fire)', duration: 0.3 }));
      inp.addEventListener('blur',  () => gsap.to(inp, { borderBottomColor: 'rgba(255,255,255,0.12)', duration: 0.3 }));
    });
  }

})();
