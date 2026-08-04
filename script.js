(() => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  const flowToggle = document.querySelector('[data-flow-toggle]');
  const introLoader = document.querySelector('[data-intro-loader]');

  if (introLoader) {
    window.setTimeout(() => introLoader.classList.add('is-finished'), 2550);
  }

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    mobileMenu?.classList.toggle('is-open', !open);
    body.classList.toggle('menu-open', !open);
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle?.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      body.classList.remove('menu-open');
    });
  });

  flowToggle?.addEventListener('click', () => {
    const isPressed = flowToggle.getAttribute('aria-pressed') === 'true';
    flowToggle.setAttribute('aria-pressed', String(!isPressed));
    body.classList.toggle('flow-paused', isPressed);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));

  const slider = document.querySelector('[data-project-slider]');
  if (slider) {
    const track = slider.querySelector('[data-project-track]');
    const slides = [...slider.querySelectorAll('[data-project-slide]')];
    const prev = slider.querySelector('[data-project-prev]');
    const next = slider.querySelector('[data-project-next]');
    const current = slider.querySelector('[data-project-current]');
    const dotsWrap = slider.querySelector('[data-project-dots]');
    let index = 0;
    let autoplay;
    let startX = 0;

    const dots = slides.map((_, dotIndex) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show project ${dotIndex + 1}`);
      dot.addEventListener('click', () => goTo(dotIndex, true));
      dotsWrap?.appendChild(dot);
      return dot;
    });

    const update = () => {
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      if (current) current.textContent = String(index + 1).padStart(2, '0');
    };

    const goTo = (nextIndex, restart = false) => {
      index = (nextIndex + slides.length) % slides.length;
      update();
      if (restart) startAutoplay();
    };

    const startAutoplay = () => {
      window.clearInterval(autoplay);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      autoplay = window.setInterval(() => goTo(index + 1), 6500);
    };

    prev?.addEventListener('click', () => goTo(index - 1, true));
    next?.addEventListener('click', () => goTo(index + 1, true));
    slider.addEventListener('mouseenter', () => window.clearInterval(autoplay));
    slider.addEventListener('mouseleave', startAutoplay);
    slider.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (event) => {
      const delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 55) goTo(index + (delta < 0 ? 1 : -1), true);
    }, { passive: true });

    update();
    startAutoplay();

    const lightbox = document.querySelector('[data-lightbox]');
    const lightboxImage = lightbox?.querySelector('[data-lightbox-image]');
    const lightboxCaption = lightbox?.querySelector('[data-lightbox-caption]');
    const close = lightbox?.querySelector('[data-lightbox-close]');
    const lightboxPrev = lightbox?.querySelector('[data-lightbox-prev]');
    const lightboxNext = lightbox?.querySelector('[data-lightbox-next]');
    let lightboxIndex = 0;

    const openLightbox = (slideIndex) => {
      lightboxIndex = slideIndex;
      const slide = slides[lightboxIndex];
      const image = slide.dataset.image;
      const title = slide.querySelector('h3')?.textContent || 'Project screenshot';
      if (lightboxImage) {
        lightboxImage.src = image;
        lightboxImage.alt = `${title} full screenshot`;
      }
      if (lightboxCaption) lightboxCaption.textContent = title;
      lightbox?.showModal();
    };

    slides.forEach((slide, slideIndex) => {
      slide.querySelector('.image-open')?.addEventListener('click', () => openLightbox(slideIndex));
      slide.querySelector('.image-open-secondary')?.addEventListener('click', () => openLightbox(slideIndex));
    });

    const changeLightbox = (direction) => {
      lightboxIndex = (lightboxIndex + direction + slides.length) % slides.length;
      const slide = slides[lightboxIndex];
      const title = slide.querySelector('h3')?.textContent || 'Project screenshot';
      if (lightboxImage) {
        lightboxImage.src = slide.dataset.image;
        lightboxImage.alt = `${title} full screenshot`;
      }
      if (lightboxCaption) lightboxCaption.textContent = title;
    };

    close?.addEventListener('click', () => lightbox.close());
    lightboxPrev?.addEventListener('click', () => changeLightbox(-1));
    lightboxNext?.addEventListener('click', () => changeLightbox(1));
    lightbox?.addEventListener('click', (event) => {
      if (event.target === lightbox) lightbox.close();
    });
  }

  const rail = document.querySelector('[data-video-rail]');
  const videoPrev = document.querySelector('[data-video-prev]');
  const videoNext = document.querySelector('[data-video-next]');
  const videoModal = document.querySelector('[data-video-modal]');
  const videoFrame = videoModal?.querySelector('[data-video-frame]');
  const videoTitle = videoModal?.querySelector('[data-video-title]');
  const videoClose = videoModal?.querySelector('[data-video-close]');
  const modalVideoPrev = videoModal?.querySelector('[data-video-modal-prev]');
  const modalVideoNext = videoModal?.querySelector('[data-video-modal-next]');
  const videoCards = [...document.querySelectorAll('[data-video-card]')];
  let activeVideoIndex = 0;

  const scrollRail = (direction) => {
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.min(470, rail.clientWidth * 0.82), behavior: 'smooth' });
  };
  videoPrev?.addEventListener('click', () => scrollRail(-1));
  videoNext?.addEventListener('click', () => scrollRail(1));

  const loadVideo = (index) => {
    if (!videoModal || !videoFrame || !videoCards.length) return;
    activeVideoIndex = (index + videoCards.length) % videoCards.length;
    const card = videoCards[activeVideoIndex];
    videoFrame.src = card.dataset.video || '';
    videoFrame.title = `${card.dataset.title || 'AJAY NXT film'} video player`;
    if (videoTitle) videoTitle.textContent = `${String(activeVideoIndex + 1).padStart(2, '0')} / ${String(videoCards.length).padStart(2, '0')} · ${card.dataset.title || 'Video preview'}`;
  };

  videoCards.forEach((card, cardIndex) => {
    card.addEventListener('click', () => {
      loadVideo(cardIndex);
      videoModal?.showModal();
    });
  });

  const closeVideo = () => {
    if (!videoModal) return;
    if (videoFrame) videoFrame.removeAttribute('src');
    videoModal.close();
  };
  videoClose?.addEventListener('click', closeVideo);
  modalVideoPrev?.addEventListener('click', () => loadVideo(activeVideoIndex - 1));
  modalVideoNext?.addEventListener('click', () => loadVideo(activeVideoIndex + 1));
  videoModal?.addEventListener('click', (event) => {
    if (event.target === videoModal) closeVideo();
  });
  videoModal?.addEventListener('close', () => videoFrame?.removeAttribute('src'));

  const form = document.querySelector('[data-project-form]');
  const fileInput = form?.querySelector('input[type="file"]');
  const fileDisplay = form?.querySelector('[data-file-display]');
  const currencyInput = form?.querySelector('[name="currency"]');
  const budgetInput = form?.querySelector('[name="budget"]');
  const budgetConversion = form?.querySelector('[data-budget-conversion]');

  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
  let inrPerUnit = { INR: 1, USD: 87, EUR: 101, GBP: 116, AED: 23.7 };

  const formatNumber = (value, maximumFractionDigits = 0) => new Intl.NumberFormat('en-IN', {
    maximumFractionDigits
  }).format(value);

  const updateBudgetConversion = () => {
    if (!currencyInput || !budgetInput || !budgetConversion) return;
    const currency = currencyInput.value;
    const amount = Number(budgetInput.value);
    if (!Number.isFinite(amount) || amount <= 0) {
      budgetConversion.textContent = currency === 'INR'
        ? 'Enter your estimated budget.'
        : 'The approximate Indian Rupee value will appear here.';
      return;
    }
    const inrAmount = amount * (inrPerUnit[currency] || 1);
    budgetConversion.textContent = currency === 'INR'
      ? `Budget: ₹${formatNumber(amount, 2)}`
      : `Approx. Indian value: ₹${formatNumber(inrAmount)} INR`;
  };

  fetch('https://open.er-api.com/v6/latest/INR')
    .then((response) => response.ok ? response.json() : Promise.reject(new Error('Rate unavailable')))
    .then((data) => {
      ['USD', 'EUR', 'GBP', 'AED'].forEach((currency) => {
        const rate = Number(data?.rates?.[currency]);
        if (rate > 0) inrPerUnit[currency] = 1 / rate;
      });
      updateBudgetConversion();
    })
    .catch(() => updateBudgetConversion());

  currencyInput?.addEventListener('change', updateBudgetConversion);
  budgetInput?.addEventListener('input', updateBudgetConversion);

  fileDisplay?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    if (fileDisplay) fileDisplay.textContent = fileInput.files?.[0]?.name || 'Choose an image, PDF or document';
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const reference = fileInput?.files?.[0]?.name || 'No file selected';
    const currency = String(data.get('currency') || 'INR');
    const amount = Number(data.get('budget'));
    const symbol = currencySymbols[currency] || '';
    const originalBudget = `${symbol}${formatNumber(amount, 2)} ${currency}`;
    const approximateInr = amount * (inrPerUnit[currency] || 1);
    const budgetLines = currency === 'INR'
      ? [`Budget: ${originalBudget}`]
      : [`Budget: ${originalBudget}`, `Approx. budget in INR: ₹${formatNumber(approximateInr)} INR`];

    const message = [
      'Hi Ajay, I visited your portfolio and would like to discuss a project.',
      '',
      `Name: ${data.get('name')}`,
      `WhatsApp: ${data.get('phone')}`,
      `Email: ${data.get('email')}`,
      `Business / Brand: ${data.get('brand') || 'Not provided'}`,
      `Service: ${data.get('service')}`,
      ...budgetLines,
      `Reference file: ${reference}`,
      '',
      'Project details:',
      String(data.get('details') || '')
    ].join('\n');
    const whatsappUrl = `https://wa.me/919929562585?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const archiveCards = [...document.querySelectorAll('[data-category]')];
  const archiveCount = document.querySelector('[data-archive-count]');
  if (filterButtons.length && archiveCards.length) {
    const updateArchive = (filter) => {
      let visible = 0;
      archiveCards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category.split(' ').includes(filter);
        card.hidden = !show;
        if (show) visible += 1;
      });
      filterButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.filter === filter));
      if (archiveCount) archiveCount.textContent = `${visible} projects shown`;
    };
    filterButtons.forEach((button) => button.addEventListener('click', () => updateArchive(button.dataset.filter)));
    updateArchive('all');
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
    }
  });
})();
