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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      if (reduced || !inView || slides.length < 2) return;
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
