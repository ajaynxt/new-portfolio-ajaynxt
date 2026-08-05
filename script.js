(() => {
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Intro */
  const intro = document.querySelector('[data-intro]');
  if (intro) {
    setTimeout(() => {
      intro.classList.add('done');
      body.classList.remove('intro-active');
      setTimeout(() => intro.remove(), reducedMotion ? 10 : 700);
    }, reducedMotion ? 100 : 1550);
  }

  /* Header scroll state */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const closeMenu = () => {
    menuBtn?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('open');
    body.classList.remove('menu-open');
  };
  menuBtn?.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    mobileMenu?.classList.toggle('open', !open);
    body.classList.toggle('menu-open', !open);
  });
  mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  /* Color flow */
  const flowToggle = document.querySelector('[data-flow-toggle]');
  const flowPalettes = [
    ['#f7c7d9', '#bcdcff', '#c8efd9', '#f7d89b'],
    ['#ffd0ae', '#d8c4ff', '#b7e8ef', '#f7efae'],
    ['#cce5ff', '#ffc8df', '#c9f2cf', '#ead0ff'],
    ['#f5df9f', '#bfe5ff', '#ffd0c0', '#c8ead9'],
    ['#d8c9ff', '#bdebdc', '#ffd9ac', '#c7ddff'],
    ['#ffc9d4', '#d4edb8', '#b9dcff', '#f1c6ff'],
    ['#ffe0aa', '#c4d5ff', '#c5f0e0', '#efc2dc'],
    ['#c8ecff', '#f7c7b7', '#d9c9ff', '#d5efbd']
  ];
  const flowBlobs = [...document.querySelectorAll('.aurora i, .hero-color-flow i')];
  let paletteIndex = 0;

  const paintFlow = () => {
    if (body.classList.contains('flow-off') || !flowBlobs.length) return;
    const palette = flowPalettes[paletteIndex % flowPalettes.length];
    flowBlobs.forEach((blob, i) => blob.style.setProperty('--blob-color', palette[i % palette.length]));
    paletteIndex += 1;
  };
  paintFlow();
  setInterval(paintFlow, 1000);
  flowToggle?.addEventListener('click', () => {
    const active = flowToggle.getAttribute('aria-pressed') === 'true';
    flowToggle.setAttribute('aria-pressed', String(!active));
    body.classList.toggle('flow-off', active);
  });

  /* Image modal */
  const imageModal = document.querySelector('[data-image-modal]');
  const imageModalImg = imageModal?.querySelector('[data-image-modal-img]');
  const imageCaption = imageModal?.querySelector('[data-image-caption]');
  const openImage = (src, title) => {
    if (!imageModal || !imageModalImg) return;
    imageModalImg.src = src;
    imageModalImg.alt = `${title} full website screenshot`;
    if (imageCaption) imageCaption.textContent = title;
    imageModal.showModal();
  };
  imageModal?.querySelector('[data-image-close]')?.addEventListener('click', () => imageModal.close());
  imageModal?.addEventListener('click', (e) => { if (e.target === imageModal) imageModal.close(); });

  /* Project slider */
  const slider = document.querySelector('[data-project-slider]');
  if (slider) {
    const track = slider.querySelector('[data-project-track]');
    const slides = [...slider.querySelectorAll('[data-project-slide]')];
    const prev = slider.querySelector('[data-project-prev]');
    const next = slider.querySelector('[data-project-next]');
    const count = slider.querySelector('[data-project-count]');
    const dotsWrap = slider.querySelector('[data-project-dots]');
    let index = 0;
    let timer = null;
    let touchX = 0;
    let inView = true;

    const dots = slides.map((_, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Show project ${i + 1}`);
      btn.addEventListener('click', () => go(i, true));
      dotsWrap?.appendChild(btn);
      return btn;
    });

    const update = () => {
      if (track) track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      if (count) {
        count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      }
    };

    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const start = () => {
      stop();
      if (reducedMotion || !inView || slides.length < 2) return;
      timer = setInterval(() => go(index + 1), 7000);
    };

    const go = (to, restart = false) => {
      index = (to + slides.length) % slides.length;
      update();
      if (restart) start();
    };

    prev?.addEventListener('click', () => go(index - 1, true));
    next?.addEventListener('click', () => go(index + 1, true));

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', (e) => {
      if (!slider.contains(e.relatedTarget)) start();
    });

    slider.addEventListener('touchstart', (e) => {
      touchX = e.touches[0].clientX;
      stop();
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1), true);
      else start();
    }, { passive: true });

    slides.forEach((slide) => {
      const title = slide.querySelector('h3')?.textContent?.trim() || 'Project';
      const src = slide.dataset.image || '';
      slide.querySelectorAll('[data-image-open]').forEach((btn) =>
        btn.addEventListener('click', () => openImage(src, title))
      );
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      }, { threshold: 0.2 }).observe(slider);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (inView) start();
    });

    update();
    start();
  }

  /* Film rail */
  const rail = document.querySelector('[data-film-rail]');
  document.querySelector('[data-film-prev]')?.addEventListener('click', () =>
    rail?.scrollBy({ left: -Math.min(720, rail.clientWidth * 0.85), behavior: 'smooth' })
  );
  document.querySelector('[data-film-next]')?.addEventListener('click', () =>
    rail?.scrollBy({ left: Math.min(720, rail.clientWidth * 0.85), behavior: 'smooth' })
  );

  /* Video modal */
  const films = [...document.querySelectorAll('[data-film]')];
  const videoModal = document.querySelector('[data-video-modal]');
  const videoFrame = videoModal?.querySelector('[data-video-frame]');
  const videoTitle = videoModal?.querySelector('[data-video-title]');
  let filmIndex = 0;

  const loadFilm = (to) => {
    if (!films.length || !videoFrame) return;
    filmIndex = (to + films.length) % films.length;
    const card = films[filmIndex];
    videoFrame.src = card.dataset.video || '';
    videoFrame.title = `${card.dataset.title || 'AJAY NXT film'} player`;
    if (videoTitle) {
      videoTitle.textContent = `${String(filmIndex + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')} · ${card.dataset.title || 'Film'}`;
    }
  };

  const closeVideo = () => {
    if (videoFrame) videoFrame.removeAttribute('src');
    videoModal?.close();
  };

  films.forEach((card, i) => card.addEventListener('click', () => {
    loadFilm(i);
    videoModal?.showModal();
  }));
  videoModal?.querySelector('[data-video-close]')?.addEventListener('click', closeVideo);
  videoModal?.querySelector('[data-video-prev]')?.addEventListener('click', () => loadFilm(filmIndex - 1));
  videoModal?.querySelector('[data-video-next]')?.addEventListener('click', () => loadFilm(filmIndex + 1));
  videoModal?.addEventListener('click', (e) => { if (e.target === videoModal) closeVideo(); });
  videoModal?.addEventListener('close', () => videoFrame?.removeAttribute('src'));

  /* Project form → WhatsApp */
  const form = document.querySelector('[data-project-form]');
  if (form) {
    const currency = form.querySelector('[name="currency"]');
    const budget = form.querySelector('[name="budget"]');
    const output = form.querySelector('[data-budget-output]');
    const file = form.querySelector('input[type="file"]');
    const fileName = form.querySelector('[data-file-name]');
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
    const inrRates = { INR: 1, USD: 87, EUR: 101, GBP: 116, AED: 23.7 };
    const fmt = (n, d = 0) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: d }).format(n);

    fetch('https://open.er-api.com/v6/latest/INR')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        ['USD', 'EUR', 'GBP', 'AED'].forEach((code) => {
          const rate = Number(data?.rates?.[code]);
          if (rate > 0) inrRates[code] = 1 / rate;
        });
        updateBudget();
      })
      .catch(() => updateBudget());

    function updateBudget() {
      if (!currency || !budget || !output) return;
      const code = currency.value;
      const amount = Number(budget.value);
      if (!Number.isFinite(amount) || amount <= 0) {
        output.textContent = code === 'INR'
          ? 'Enter your estimated budget.'
          : 'Approximate Indian Rupee value will appear here.';
        return;
      }
      output.textContent = code === 'INR'
        ? `Budget: ₹${fmt(amount, 2)}`
        : `Approx. Indian value: ₹${fmt(amount * (inrRates[code] || 1))} INR`;
    }

    currency?.addEventListener('change', updateBudget);
    budget?.addEventListener('input', updateBudget);
    fileName?.addEventListener('click', () => file?.click());
    file?.addEventListener('change', () => {
      if (fileName) fileName.textContent = file.files?.[0]?.name || 'Choose an image, PDF or document';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const code = String(data.get('currency') || 'INR');
      const amount = Number(data.get('budget'));
      const original = `${symbols[code] || ''}${fmt(amount, 2)} ${code}`;
      const lines = [
        'Hi Ajay, I visited your portfolio and would like to discuss a project.',
        '',
        `Name: ${data.get('name')}`,
        `WhatsApp: ${data.get('phone')}`,
        `Email: ${data.get('email')}`,
        `Business / Brand: ${data.get('brand') || 'Not provided'}`,
        `Service: ${data.get('service')}`,
        `Budget: ${original}`
      ];
      if (code !== 'INR') lines.push(`Approx. budget in INR: ₹${fmt(amount * (inrRates[code] || 1))} INR`);
      lines.push(
        `Reference file: ${file?.files?.[0]?.name || 'No file selected'}`,
        '',
        'Project details:',
        String(data.get('details') || '')
      );
      window.open(`https://wa.me/919929562585?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    });
  }

  /* Archive filters (projects.html) */
  const filterBtns = [...document.querySelectorAll('[data-filter]')];
  const archiveCards = [...document.querySelectorAll('[data-category]')];
  const archiveCount = document.querySelector('[data-archive-count]');
  if (filterBtns.length && archiveCards.length) {
    const filter = (value) => {
      let visible = 0;
      archiveCards.forEach((card) => {
        const show = value === 'all' || card.dataset.category.split(' ').includes(value);
        card.hidden = !show;
        if (show) visible += 1;
      });
      filterBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === value));
      if (archiveCount) archiveCount.textContent = `${visible} projects shown`;
    };
    filterBtns.forEach((btn) => btn.addEventListener('click', () => filter(btn.dataset.filter)));
    filter('all');
  }

  /* Escape closes dialogs */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('dialog[open]').forEach((d) => d.close());
  });
})();
