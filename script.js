(() => {
  const body = document.body;
  const intro = document.querySelector('[data-intro]');
  if (intro) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      intro.classList.add('done');
      body.classList.remove('intro-active');
      window.setTimeout(() => intro.remove(), reduced ? 10 : 700);
    }, reduced ? 100 : 1550);
  }

  const header = document.querySelector('[data-header]');
  const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 18);
  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu?.classList.toggle('open', !open);
    body.classList.toggle('menu-open', !open);
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    body.classList.remove('menu-open');
  }));

  const flowToggle = document.querySelector('[data-flow-toggle]');
  flowToggle?.addEventListener('click', () => {
    const active = flowToggle.getAttribute('aria-pressed') === 'true';
    flowToggle.setAttribute('aria-pressed', String(!active));
    body.classList.toggle('flow-off', active);
  });

  const imageModal = document.querySelector('[data-image-modal]');
  const imageModalImg = imageModal?.querySelector('[data-image-modal-img]');
  const imageCaption = imageModal?.querySelector('[data-image-caption]');
  const imageClose = imageModal?.querySelector('[data-image-close]');
  const openImage = (src, title) => {
    if (!imageModal || !imageModalImg) return;
    imageModalImg.src = src;
    imageModalImg.alt = `${title} full website screenshot`;
    if (imageCaption) imageCaption.textContent = title;
    imageModal.showModal();
  };
  imageClose?.addEventListener('click', () => imageModal.close());
  imageModal?.addEventListener('click', (event) => {
    if (event.target === imageModal) imageModal.close();
  });

  const slider = document.querySelector('[data-project-slider]');
  if (slider) {
    const track = slider.querySelector('[data-project-track]');
    const slides = [...slider.querySelectorAll('[data-project-slide]')];
    const prev = slider.querySelector('[data-project-prev]');
    const next = slider.querySelector('[data-project-next]');
    const count = slider.querySelector('[data-project-count]');
    const dotsWrap = slider.querySelector('[data-project-dots]');
    let index = 0;
    let timer;
    let touchX = 0;

    const dots = slides.map((_, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Show project ${i + 1}`);
      button.addEventListener('click', () => go(i, true));
      dotsWrap?.appendChild(button);
      return button;
    });

    const update = () => {
      if (track) track.style.transform = `translate3d(${-index * 100}%,0,0)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    };
    const start = () => {
      window.clearInterval(timer);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = window.setInterval(() => go(index + 1), 7000);
      }
    };
    const go = (to, restart = false) => {
      index = (to + slides.length) % slides.length;
      update();
      if (restart) start();
    };
    prev?.addEventListener('click', () => go(index - 1, true));
    next?.addEventListener('click', () => go(index + 1, true));
    slider.addEventListener('mouseenter', () => window.clearInterval(timer));
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('touchstart', (event) => { touchX = event.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (event) => {
      const delta = event.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1), true);
    }, { passive: true });
    slides.forEach((slide) => {
      const title = slide.querySelector('h3')?.textContent?.trim() || 'Project';
      const src = slide.dataset.image || '';
      slide.querySelectorAll('[data-image-open]').forEach((button) => button.addEventListener('click', () => openImage(src, title)));
    });
    update();
    start();
  }

  const rail = document.querySelector('[data-film-rail]');
  document.querySelector('[data-film-prev]')?.addEventListener('click', () => rail?.scrollBy({ left: -Math.min(720, rail.clientWidth * .85), behavior: 'smooth' }));
  document.querySelector('[data-film-next]')?.addEventListener('click', () => rail?.scrollBy({ left: Math.min(720, rail.clientWidth * .85), behavior: 'smooth' }));

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
    if (videoTitle) videoTitle.textContent = `${String(filmIndex + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')} · ${card.dataset.title || 'Film'}`;
  };
  films.forEach((card, i) => card.addEventListener('click', () => {
    loadFilm(i);
    videoModal?.showModal();
  }));
  const closeVideo = () => {
    if (videoFrame) videoFrame.removeAttribute('src');
    videoModal?.close();
  };
  videoModal?.querySelector('[data-video-close]')?.addEventListener('click', closeVideo);
  videoModal?.querySelector('[data-video-prev]')?.addEventListener('click', () => loadFilm(filmIndex - 1));
  videoModal?.querySelector('[data-video-next]')?.addEventListener('click', () => loadFilm(filmIndex + 1));
  videoModal?.addEventListener('click', (event) => {
    if (event.target === videoModal) closeVideo();
  });
  videoModal?.addEventListener('close', () => videoFrame?.removeAttribute('src'));

  const form = document.querySelector('[data-project-form]');
  if (form) {
    const currency = form.querySelector('[name="currency"]');
    const budget = form.querySelector('[name="budget"]');
    const output = form.querySelector('[data-budget-output]');
    const file = form.querySelector('input[type="file"]');
    const fileName = form.querySelector('[data-file-name]');
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
    const inrRates = { INR: 1, USD: 87, EUR: 101, GBP: 116, AED: 23.7 };
    const number = (value, decimals = 0) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals }).format(value);

    fetch('https://open.er-api.com/v6/latest/INR')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('rate unavailable')))
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
        output.textContent = code === 'INR' ? 'Enter your estimated budget.' : 'Approximate Indian Rupee value will appear here.';
        return;
      }
      output.textContent = code === 'INR'
        ? `Budget: ₹${number(amount, 2)}`
        : `Approx. Indian value: ₹${number(amount * (inrRates[code] || 1))} INR`;
    }
    currency?.addEventListener('change', updateBudget);
    budget?.addEventListener('input', updateBudget);
    fileName?.addEventListener('click', () => file?.click());
    file?.addEventListener('change', () => {
      if (fileName) fileName.textContent = file.files?.[0]?.name || 'Choose an image, PDF or document';
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const code = String(data.get('currency') || 'INR');
      const amount = Number(data.get('budget'));
      const original = `${symbols[code] || ''}${number(amount, 2)} ${code}`;
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
      if (code !== 'INR') lines.push(`Approx. budget in INR: ₹${number(amount * (inrRates[code] || 1))} INR`);
      lines.push(`Reference file: ${file?.files?.[0]?.name || 'No file selected'}`, '', 'Project details:', String(data.get('details') || ''));
      window.open(`https://wa.me/919929562585?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
    });
  }

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const archiveCards = [...document.querySelectorAll('[data-category]')];
  const archiveCount = document.querySelector('[data-archive-count]');
  if (filterButtons.length && archiveCards.length) {
    const filter = (value) => {
      let visible = 0;
      archiveCards.forEach((card) => {
        const show = value === 'all' || card.dataset.category.split(' ').includes(value);
        card.hidden = !show;
        if (show) visible += 1;
      });
      filterButtons.forEach((button) => button.classList.toggle('active', button.dataset.filter === value));
      if (archiveCount) archiveCount.textContent = `${visible} projects shown`;
    };
    filterButtons.forEach((button) => button.addEventListener('click', () => filter(button.dataset.filter)));
    filter('all');
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
  });
})();
