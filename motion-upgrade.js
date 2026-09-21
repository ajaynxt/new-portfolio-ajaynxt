(() => {
  const root = document.documentElement;
  const body = document.body;
  if (!body || body.dataset.rbUpgrade === '1') return;
  body.dataset.rbUpgrade = '1';
  body.classList.add('rb-upgrade');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.createElement('div');
  progress.className = 'rb-scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  body.appendChild(progress);

  const updateProgress = () => {
    const max = root.scrollHeight - root.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, root.scrollY / max)) : 0})`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  const split = (el) => {
    if (!el || el.dataset.rbSplit === '1') return;
    el.dataset.rbSplit = '1';
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      node.nodeValue.trim().split(/(\s+)/).forEach((part) => {
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.className = 'rb-word';
          span.textContent = part;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
    requestAnimationFrame(() => el.classList.add('rb-split-ready'));
  };

  document.querySelectorAll('.hero h1, .section-head h2').forEach(split);

  const revealTargets = [
    ...document.querySelectorAll('.section-head'),
    ...document.querySelectorAll('.project-shell, .archive-cta, .film-wrap, .service-grid, .about-layout, .global-grid, .contact-grid, .whatsapp-cta, .site-footer'),
    ...document.querySelectorAll('.service-grid article, .social-grid a, .global-points > div, .footer-grid > div')
  ];
  revealTargets.forEach((el, i) => {
    if (!el.classList.contains('rb-reveal')) el.classList.add('rb-reveal');
    const delay = i % 4;
    if (delay) el.dataset.rbDelay = String(delay);
  });

  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('rb-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rb-reveal').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.rb-reveal').forEach(el => el.classList.add('rb-visible'));
  }

  const tiltSelector = '.browser-card, .film-card, .service-grid article';
  if (!reduce && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll(tiltSelector).forEach(card => {
      card.classList.add('rb-tilt', 'rb-spotlight');
      const move = (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--rb-rx', `${(0.5 - y) * 3}deg`);
        card.style.setProperty('--rb-ry', `${(x - 0.5) * 3}deg`);
        card.style.setProperty('--rb-x', `${x * 100}%`);
        card.style.setProperty('--rb-y', `${y * 100}%`);
      };
      const leave = () => {
        card.style.setProperty('--rb-rx', '0deg');
        card.style.setProperty('--rb-ry', '0deg');
      };
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
    });

    document.querySelectorAll('.button, .text-link').forEach(btn => {
      btn.classList.add('rb-magnetic');
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = `translate3d(${dx * 7}px,${dy * 5}px,0)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  const stats = [...document.querySelectorAll('.hero-stats b')];
  const countUp = (el) => {
    if (el.dataset.rbCounted === '1') return;
    const text = el.textContent.trim();
    const m = text.match(/([0-9]+)(.*)/);
    if (!m) return;
    el.dataset.rbCounted = '1';
    const target = Number(m[1]);
    const suffix = m[2] || '';
    if (reduce) { el.textContent = text; return; }
    const start = performance.now();
    const duration = 900;
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = `${Math.round(target * eased)}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stats.forEach(countUp);
          statObserver.disconnect();
        }
      });
    }, { threshold: .4 });
    const firstStat = document.querySelector('.hero-stats');
    if (firstStat) statObserver.observe(firstStat);
  } else {
    stats.forEach(countUp);
  }

  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && navLinks.length) {
    const navMap = new Map(sections.map(section => [section.id, navLinks.find(a => a.getAttribute('href') === '#' + section.id)]));
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.remove('rb-active-nav'));
        navMap.get(entry.target.id)?.classList.add('rb-active-nav');
      });
    }, { threshold: 0, rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  const firstScreen = document.querySelector('.hero');
  if (firstScreen && !reduce && window.matchMedia('(pointer:fine)').matches) {
    firstScreen.addEventListener('pointermove', e => {
      const r = firstScreen.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - .5) * 2;
      const y = ((e.clientY - r.top) / r.height - .5) * 2;
      firstScreen.style.setProperty('--hero-rx', `${y * -1.2}deg`);
      firstScreen.style.setProperty('--hero-ry', `${x * 1.2}deg`);
    });
    firstScreen.addEventListener('pointerleave', () => {
      firstScreen.style.setProperty('--hero-rx', '0deg');
      firstScreen.style.setProperty('--hero-ry', '0deg');
    });
  }
})();