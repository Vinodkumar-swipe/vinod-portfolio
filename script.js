/* =========================================================
   Vinod Kumar Portfolio — Vanilla JS Enhancements
   Features:
   - Mobile navigation toggle + close on link click
   - Sticky navbar "scrolled" state
   - Scroll reveal animations via IntersectionObserver
   - Skill progress bar animation on reveal
   - Typing animation (phrases cycling)
   - Animated counters on reveal
   - Canvas particles (subtle, lightweight)
   - Contact form UX (client-side only)
   ========================================================= */

(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // ---------- Mobile nav ----------
  const navToggle = document.getElementById("navToggle");
  const navMobile = document.getElementById("navMobile");

  function setNavOpen(open) {
    if (!navToggle || !navMobile) return;
    navMobile.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  navToggle?.addEventListener("click", () => {
    const isOpen = navMobile?.classList.contains("is-open");
    setNavOpen(!isOpen);
  });

  navMobile?.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) setNavOpen(false);
  });

  // ---------- Sticky nav state ----------
  const nav = document.querySelector(".nav");
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("nav--scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Reveal animations ----------
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const bars = Array.from(document.querySelectorAll(".bar"));
  const counters = Array.from(document.querySelectorAll(".counter"));

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target;
        el.classList.add("is-visible");

        // Animate skill bars if present inside this revealed block
        const localBars = el.querySelectorAll?.(".bar");
        localBars?.forEach((bar) => animateBar(bar));

        // Animate counters if present inside this revealed block
        const localCounters = el.querySelectorAll?.(".counter");
        localCounters?.forEach((c) => animateCounter(c));

        io.unobserve(el);
      }
    },
    { threshold: 0.18 }
  );

  revealEls.forEach((el) => {
    if (prefersReducedMotion) el.classList.add("is-visible");
    else io.observe(el);
  });

  // If reduced motion, still set bars/counters to final state
  if (prefersReducedMotion) {
    bars.forEach((b) => animateBar(b, true));
    counters.forEach((c) => animateCounter(c, true));
  }

  // ---------- Skill bars ----------
  function animateBar(barEl, immediate = false) {
    if (!barEl || barEl.dataset.animated === "true") return;
    const level = Number(barEl.getAttribute("data-level") || "0");
    const fill = barEl.querySelector(".bar__fill");
    if (!fill) return;

    barEl.dataset.animated = "true";

    const finalWidth = `${Math.max(0, Math.min(100, level))}%`;
    if (immediate) {
      fill.style.transition = "none";
      fill.style.width = finalWidth;
      return;
    }

    requestAnimationFrame(() => {
      fill.style.width = finalWidth;
    });
  }

  // ---------- Counters ----------
  function animateCounter(counterEl, immediate = false) {
    if (!counterEl || counterEl.dataset.animated === "true") return;
    const target = Number(counterEl.getAttribute("data-target") || "0");
    if (!Number.isFinite(target)) return;

    counterEl.dataset.animated = "true";

    if (immediate) {
      counterEl.textContent = String(target);
      return;
    }

    const duration = 900;
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (target - from) * eased);
      counterEl.textContent = String(value);
      if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ---------- Typing animation ----------
  const typedEl = document.getElementById("typed");

  function splitPhrases(node) {
    const raw = node?.getAttribute("data-phrases") || "";
    return raw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function typeLoop(node, phrases) {
    if (!node || !phrases.length) return;

    const typingSpeed = 26;
    const deletingSpeed = 16;
    const pauseAfterType = 900;
    const pauseAfterDelete = 250;

    let p = 0;
    let i = 0;
    let deleting = false;
    let paused = false;

    function step() {
      if (prefersReducedMotion) {
        node.textContent = phrases[0];
        return;
      }

      if (paused) return;

      const phrase = phrases[p];
      if (!deleting) {
        i++;
        node.textContent = phrase.slice(0, i);
        if (i >= phrase.length) {
          paused = true;
          setTimeout(() => {
            paused = false;
            deleting = true;
            requestAnimationFrame(step);
          }, pauseAfterType);
          return;
        }
        setTimeout(step, typingSpeed);
      } else {
        i--;
        node.textContent = phrase.slice(0, Math.max(0, i));
        if (i <= 0) {
          deleting = false;
          p = (p + 1) % phrases.length;
          paused = true;
          setTimeout(() => {
            paused = false;
            requestAnimationFrame(step);
          }, pauseAfterDelete);
          return;
        }
        setTimeout(step, deletingSpeed);
      }
    }

    step();
  }

  if (typedEl) {
    const phrases = splitPhrases(typedEl);
    typeLoop(typedEl, phrases);
  }

  // ---------- Contact form UX (client-side only) ----------
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = contactForm.querySelector("#name")?.value?.trim();
    const email = contactForm.querySelector("#email")?.value?.trim();
    const message = contactForm.querySelector("#message")?.value?.trim();

    if (!name || !email || !message) {
      if (formNote) formNote.textContent = "Please complete all fields.";
      return;
    }

    // No backend requested. Provide a professional UX message + mailto fallback.
    if (formNote) {
      formNote.textContent = "Thanks! This demo form doesn’t send yet. Opening your email client…";
    }

    const subject = encodeURIComponent(`Portfolio Contact — ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`);
    window.location.href = `mailto:vinodkumar17258@gmail.com?subject=${subject}&body=${body}`;
  });

  // ---------- Particles (subtle grid/particles effect) ----------
  const canvas = document.getElementById("particles");
  const ctx = canvas?.getContext?.("2d");

  if (canvas && ctx && !prefersReducedMotion) {
    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let w = 0;
    let h = 0;

    const particles = [];
    const maxParticles = 72;

    function resize() {
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;

      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function rand(min, max) {
      return Math.random() * (max - min) + min;
    }

    function init() {
      particles.length = 0;
      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: rand(0, w),
          y: rand(0, h),
          r: rand(0.8, 2.2),
          vx: rand(-0.22, 0.22),
          vy: rand(-0.18, 0.18),
          a: rand(0.25, 0.65),
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Very subtle connecting lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(53,212,255,${p.a})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.18;
            ctx.strokeStyle = `rgba(176,75,255,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    init();
    draw();

    window.addEventListener("resize", () => {
      resize();
      init();
    });
  }

  // ---------- Simple inline SVG masks for icons ----------
  // Uses CSS mask with inline SVG data URIs (no external libs).
  const iconSvgs = {
    linkedin:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0.5 23.5h4V7.98h-4V23.5zM8 7.98h3.83v2.12h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1v9.36h-4v-8.3c0-1.98-.04-4.53-2.76-4.53-2.76 0-3.18 2.16-3.18 4.39v8.44H8V7.98z"/>
      </svg>`,
    github:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
        <path d="M12 0.5C5.37 0.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.76.08-.74.08-.74 1.21.09 1.85 1.25 1.85 1.25 1.08 1.85 2.84 1.32 3.53 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.16 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.41 1.02.01 2.04.14 3 .41 2.29-1.55 3.3-1.23 3.3-1.23.66 1.64.24 2.86.12 3.16.77.84 1.24 1.91 1.24 3.22 0 4.62-2.8 5.64-5.48 5.94.43.38.82 1.12.82 2.26v3.35c0 .32.22.69.82.58C20.56 22.3 24 17.8 24 12.5 24 5.87 18.63 0.5 12 0.5z"/>
      </svg>`,
    email:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>`,
  };

  function svgToMask(svg) {
    const encoded = encodeURIComponent(svg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    return `url("data:image/svg+xml,${encoded}")`;
  }

  document.querySelectorAll("[data-icon]").forEach((el) => {
    const key = el.getAttribute("data-icon");
    const svg = iconSvgs[key];
    if (!svg) return;
    el.style.webkitMaskImage = svgToMask(svg);
    el.style.maskImage = svgToMask(svg);
  });
})();