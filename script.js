(() => {
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  const desktopQuery = window.matchMedia('(min-width: 781px)');
  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const year = document.querySelector('#year');

  root.classList.add('js');

  const watchMedia = (query, listener) => {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', listener);
    } else if (typeof query.addListener === 'function') {
      query.addListener(listener);
    }
  };

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const setMenuState = (isOpen) => {
    if (!header || !menuToggle) return;

    header.classList.toggle('is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('nav-open', isOpen);
  };

  if (header && menuToggle && navigation) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
      setMenuState(isOpen);
    });

    navigation.querySelectorAll('a').forEach((link) => {
      if (!link.hasAttribute('data-dialog-open')) {
        link.addEventListener('click', () => setMenuState(false));
      }
    });

    document.addEventListener('click', (event) => {
      if (!document.body.classList.contains('modal-open') && !header.contains(event.target)) {
        setMenuState(false);
      }
    });

    document.addEventListener('focusin', (event) => {
      if (!document.body.classList.contains('modal-open') && !header.contains(event.target)) {
        setMenuState(false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (
        event.key === 'Escape' &&
        !document.body.classList.contains('modal-open') &&
        menuToggle.getAttribute('aria-expanded') === 'true'
      ) {
        setMenuState(false);
        menuToggle.focus();
      }
    });

    watchMedia(desktopQuery, (event) => {
      if (event.matches) setMenuState(false);
    });
  }

  const dialogs = Array.from(document.querySelectorAll('dialog'));
  const supportsDialog = dialogs.some((dialog) => typeof dialog.showModal === 'function');

  if (!supportsDialog) {
    root.classList.add('dialog-fallback');
  } else {
    document.querySelectorAll('[data-dialog-open]').forEach((opener) => {
      opener.setAttribute('aria-haspopup', 'dialog');
      opener.addEventListener('click', (event) => {
        const dialog = document.getElementById(opener.dataset.dialogOpen);
        if (!dialog || typeof dialog.showModal !== 'function') return;

        event.preventDefault();
        setMenuState(false);
        document.body.classList.add('modal-open');
        dialog.showModal();
      });
    });

    dialogs.forEach((dialog) => {
      dialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
      });

      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;

        const bounds = dialog.getBoundingClientRect();
        const clickedInside =
          event.clientX >= bounds.left &&
          event.clientX <= bounds.right &&
          event.clientY >= bounds.top &&
          event.clientY <= bounds.bottom;

        if (!clickedInside) dialog.close();
      });
    });
  }

  const navLinks = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const navSections = Array.from(document.querySelectorAll('[data-nav-section]'));

  const setActiveSection = (id) => {
    navLinks.forEach((link) => {
      if (link.hash === id) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const updateHeader = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  if (navSections.length) {
    let scrollUpdatePending = false;

    const updateActiveSection = () => {
      const marker = Math.min(window.innerHeight * 0.5, 200);
      let currentSection = navSections[0];

      navSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) currentSection = section;
      });

      setActiveSection(`#${currentSection.id}`);
      scrollUpdatePending = false;
    };

    const queueActiveSectionUpdate = () => {
      if (scrollUpdatePending) return;
      scrollUpdatePending = true;
      window.requestAnimationFrame(updateActiveSection);
    };

    navLinks.forEach((link) => {
      link.addEventListener('click', () => setActiveSection(link.hash));
    });
    window.addEventListener('scroll', queueActiveSectionUpdate, { passive: true });
    window.addEventListener('resize', queueActiveSectionUpdate);
    updateActiveSection();
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);
  updateHeader();

  if (window.location.hash) {
    setActiveSection(window.location.hash);
  }

  const revealElements = Array.from(document.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && !reducedMotionQuery.matches) {
    root.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const hero = document.querySelector('.hero');
  const pixelLayer = hero?.querySelector('[data-hero-pixels]');
  let pointerFrame = 0;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let lastPixelX = null;
  let lastPixelY = null;
  let pixelStep = 0;

  const resetPointerEffects = () => {
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;

    if (hero) {
      hero.classList.remove('has-pointer');
      ['--pointer-x', '--pointer-y', '--media-x', '--media-y'].forEach((property) => {
        hero.style.removeProperty(property);
      });
    }

    pixelLayer?.replaceChildren();
    lastPixelX = lastPixelY = null;

  };

  const leavePixelTrail = (x, y) => {
    if (!pixelLayer) return;
    if (lastPixelX !== null && Math.hypot(x - lastPixelX, y - lastPixelY) < 20) return;
    lastPixelX = x;
    lastPixelY = y;

    for (let i = 0; i < 2; i++) {
      const size = pixelStep % 3 === 0 ? 10 : 7;
      const offsetX = i === 0 ? -14 : 10;
      const offsetY = i === 0 ? 10 : -14;
      const pixel = document.createElement('span');
      pixel.className = 'hero-pixel';
      pixel.style.setProperty('--pixel-size', `${size}px`);
      pixel.style.setProperty('--pixel-x', `${Math.round((x + offsetX) / 12) * 12}px`);
      pixel.style.setProperty('--pixel-y', `${Math.round((y + offsetY) / 12) * 12}px`);
      pixel.style.setProperty('--pixel-color', pixelStep % 11 === 0
        ? 'rgba(34, 212, 217, 0.82)'
        : 'rgba(40, 125, 130, 0.7)');
      pixel.addEventListener('animationend', () => pixel.remove(), { once: true });
      pixelLayer.append(pixel);
      pixelStep++;
    }

    while (pixelLayer.childElementCount > 28) pixelLayer.firstElementChild.remove();
  };

  if (hero) {
    currentX = targetX = hero.offsetWidth * 0.5;
    currentY = targetY = hero.offsetHeight * 0.5;

    const renderPointerLight = () => {
      pointerFrame = 0;
      if (reducedMotionQuery.matches || !finePointerQuery.matches) {
        resetPointerEffects();
        return;
      }

      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      hero.style.setProperty('--pointer-x', `${currentX.toFixed(1)}px`);
      hero.style.setProperty('--pointer-y', `${currentY.toFixed(1)}px`);
      hero.style.setProperty('--media-x', `${((currentX / hero.offsetWidth - 0.5) * -12).toFixed(2)}px`);
      hero.style.setProperty('--media-y', `${((currentY / hero.offsetHeight - 0.5) * -8).toFixed(2)}px`);

      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        pointerFrame = window.requestAnimationFrame(renderPointerLight);
      }
    };

    const queuePointerLight = () => {
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(renderPointerLight);
    };

    hero.addEventListener('pointermove', (event) => {
      if (
        (event.target instanceof Element && event.target.closest('[data-hero-spin]')) ||
        event.pointerType === 'touch' ||
        reducedMotionQuery.matches ||
        !finePointerQuery.matches
      ) return;

      const bounds = hero.getBoundingClientRect();
      targetX = Math.max(0, Math.min(bounds.width, event.clientX - bounds.left));
      targetY = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top));
      hero.classList.add('has-pointer');
      leavePixelTrail(targetX, targetY);
      queuePointerLight();
    });

    hero.addEventListener('pointerleave', () => {
      if (reducedMotionQuery.matches || !finePointerQuery.matches) return;
      hero.classList.remove('has-pointer');
      lastPixelX = lastPixelY = null;
      targetX = hero.offsetWidth * 0.5;
      targetY = hero.offsetHeight * 0.5;
      queuePointerLight();
    });
  }

  watchMedia(reducedMotionQuery, (event) => {
    if (event.matches) resetPointerEffects();
  });
  watchMedia(finePointerQuery, (event) => {
    if (!event.matches) resetPointerEffects();
  });

  const heroCore = document.querySelector('[data-hero-core]');
  const heroSpin = heroCore?.querySelector('[data-hero-spin]');
  const heroFrames = heroCore?.querySelector('.hero-core-frames');
  if (heroCore && heroSpin && heroFrames) {
    const frameCount = 36;
    const columns = 6;
    const rows = 6;
    let position = 0;
    let targetPosition = 0;
    let velocity = 0;
    let currentFrame = -1;
    let motionFrame = 0;
    let lastTick = 0;
    let drag = null;
    let lastDragEnd = 0;

    const renderPosition = () => {
      const frame = ((Math.round(position) % frameCount) + frameCount) % frameCount;
      if (frame === currentFrame) return;
      currentFrame = frame;
      const column = frame % columns;
      const row = Math.floor(frame / columns);
      heroFrames.style.setProperty('--frame-x', `${(column / (columns - 1)) * 100}%`);
      heroFrames.style.setProperty('--frame-y', `${(row / (rows - 1)) * 100}%`);
    };

    const stopMotion = () => {
      if (motionFrame) window.cancelAnimationFrame(motionFrame);
      motionFrame = 0;
      lastTick = 0;
      velocity = 0;
    };

    const animateMotion = (now) => {
      motionFrame = 0;
      const elapsed = lastTick ? Math.min(48, now - lastTick) : 16;
      lastTick = now;

      if (!drag && Math.abs(velocity) > 0.0003) {
        targetPosition += velocity * elapsed;
        velocity *= Math.exp(-elapsed / 380);
      } else if (!drag) {
        velocity = 0;
      }

      position += (targetPosition - position) * (1 - Math.exp(-elapsed / 42));
      renderPosition();

      if (Math.abs(velocity) > 0.0003 || Math.abs(targetPosition - position) > 0.015) {
        motionFrame = window.requestAnimationFrame(animateMotion);
      } else {
        position = ((targetPosition % frameCount) + frameCount) % frameCount;
        targetPosition = position;
        renderPosition();
        lastTick = 0;
      }
    };

    const queueMotion = () => {
      if (reducedMotionQuery.matches) {
        position = targetPosition;
        renderPosition();
      } else if (!motionFrame) {
        motionFrame = window.requestAnimationFrame(animateMotion);
      }
    };

    const sprite = new Image();
    sprite.onload = () => {
      heroFrames.style.backgroundImage = `url("${heroSpin.dataset.sprite}")`;
      heroCore.classList.add('is-ready');
      renderPosition();
    };
    sprite.onerror = () => {
      heroCore.classList.add('is-static');
      heroSpin.disabled = true;
    };
    sprite.src = heroSpin.dataset.sprite;

    heroSpin.addEventListener('pointerdown', (event) => {
      if (heroSpin.disabled || (event.pointerType === 'mouse' && event.button !== 0)) return;
      stopMotion();
      targetPosition = position;
      drag = { id: event.pointerId, x: event.clientX, distance: 0, velocity: 0, lastMove: performance.now() };
      heroSpin.setPointerCapture(event.pointerId);
    });

    heroSpin.addEventListener('pointermove', (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      const delta = event.clientX - drag.x;
      if (!delta) return;
      const now = performance.now();
      const elapsed = Math.max(8, Math.min(64, now - drag.lastMove));
      const moved = -delta / 13;
      drag.x = event.clientX;
      drag.distance += Math.abs(delta);
      drag.velocity = drag.velocity * 0.55 + (moved / elapsed) * 0.45;
      drag.lastMove = now;
      targetPosition += moved;
      queueMotion();
    });

    const endDrag = (event) => {
      if (!drag || event.pointerId !== drag.id) return;
      if (drag.distance > 5) {
        lastDragEnd = Date.now();
        if (event.type === 'pointerup' && !reducedMotionQuery.matches && performance.now() - drag.lastMove < 100) {
          velocity = Math.max(-0.035, Math.min(0.035, drag.velocity));
        }
      }
      drag = null;
      queueMotion();
    };
    heroSpin.addEventListener('pointerup', endDrag);
    heroSpin.addEventListener('pointercancel', endDrag);
    heroSpin.addEventListener('click', (event) => {
      if (event.detail !== 0 && Date.now() - lastDragEnd < 300) return;
      velocity = 0;
      targetPosition += 2;
      queueMotion();
    });
    heroSpin.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        velocity = 0;
        targetPosition += event.key === 'ArrowRight' ? 1 : -1;
        queueMotion();
      } else if (event.key === 'Home') {
        event.preventDefault();
        velocity = 0;
        const frontOffset = ((targetPosition % frameCount) + frameCount) % frameCount;
        targetPosition += frontOffset > frameCount / 2 ? frameCount - frontOffset : -frontOffset;
        queueMotion();
      }
    });

    watchMedia(reducedMotionQuery, (event) => {
      if (!event.matches) return;
      stopMotion();
      position = targetPosition;
      renderPosition();
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) return;
      stopMotion();
      drag = null;
      position = targetPosition;
      renderPosition();
    });
  }

  const levelTrack = document.querySelector('[data-level-track]');
  const runner = levelTrack?.querySelector('[data-runner]');
  const trackFill = levelTrack?.querySelector('[data-track-fill]');

  if (levelTrack && runner && trackFill) {
    const trackInner = levelTrack.querySelector('.level-track-inner');
    let trackFrame = 0;
    let runTimer = 0;
    let hopTimer = 0;
    let previousProgress = 0;

    const updateTrack = () => {
      trackFrame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      const x = progress * trackInner.clientWidth;
      runner.style.left = `${x.toFixed(1)}px`;
      trackFill.style.width = `${(progress * 100).toFixed(2)}%`;

      if (!reducedMotionQuery.matches && !document.hidden && Math.abs(progress - previousProgress) > 0.001) {
        runner.classList.add('is-running');
        window.clearTimeout(runTimer);
        runTimer = window.setTimeout(() => runner.classList.remove('is-running'), 180);

        if ([1 / 3, 2 / 3].some((stop) => (previousProgress < stop && progress >= stop) || (previousProgress > stop && progress <= stop))) {
          runner.classList.remove('is-hopping');
          void runner.offsetWidth;
          runner.classList.add('is-hopping');
          window.clearTimeout(hopTimer);
          hopTimer = window.setTimeout(() => runner.classList.remove('is-hopping'), 460);
        }
      }
      previousProgress = progress;
    };

    const queueTrackUpdate = () => {
      if (!trackFrame) trackFrame = window.requestAnimationFrame(updateTrack);
    };

    window.addEventListener('scroll', queueTrackUpdate, { passive: true });
    window.addEventListener('resize', queueTrackUpdate);
    watchMedia(reducedMotionQuery, (event) => {
      if (event.matches) runner.classList.remove('is-running', 'is-hopping');
      queueTrackUpdate();
    });
    updateTrack();
  }

  const rabbitRewardCount = 3;
  let caught = 0;
  try { caught = Number(sessionStorage.getItem('aduneer-rabbits-caught')) || 0; } catch (_) { /* Storage is optional. */ }

  const siteScript = document.querySelector('script[src$="script.js"]');
  const rabbitHoleUrl = new URL('rabbit-hole.html', siteScript?.src || window.location.href);
  const footerMeta = document.querySelector('.footer-meta');
  let rabbitPortal = null;
  if (footerMeta && !document.body.classList.contains('rabbit-page')) {
    rabbitPortal = document.createElement('a');
    rabbitPortal.className = 'rabbit-portal';
    rabbitPortal.href = rabbitHoleUrl.href;
    rabbitPortal.innerHTML = '<span class="rabbit-portal-signal" aria-hidden="true">✦</span><span>Rabbit hole found <small>open the side path</small></span><span aria-hidden="true">↗</span>';
    rabbitPortal.hidden = caught < rabbitRewardCount;
    footerMeta.before(rabbitPortal);
  }

  const rabbits = Array.from(document.querySelectorAll('[data-rabbit]'));
  if (rabbits.length) {
    let rabbitTimer = 0;
    let hideTimer = 0;
    let toastTimer = 0;
    let pixelTimer = 0;
    let gateTimer = 0;
    let activeRabbit = null;
    let lastRabbit = null;
    let rewardGate = null;
    const rabbitHint = document.createElement('span');
    rabbitHint.className = 'rabbit-peek-hint';
    rabbitHint.textContent = finePointerQuery.matches ? 'Psst · click to catch' : 'Psst · tap to catch';
    rabbitHint.setAttribute('aria-hidden', 'true');
    rabbitHint.hidden = true;
    const pixelLayer = document.createElement('div');
    pixelLayer.className = 'rabbit-pixel-layer';
    pixelLayer.setAttribute('aria-hidden', 'true');
    const toast = document.createElement('div');
    toast.className = 'rabbit-catch-toast';
    const toastMessage = document.createElement('span');
    toastMessage.setAttribute('role', 'status');
    toastMessage.setAttribute('aria-live', 'polite');
    toastMessage.setAttribute('aria-atomic', 'true');
    const toastLink = document.createElement('a');
    toastLink.href = rabbitHoleUrl.href;
    toastLink.textContent = 'Enter ↗';
    toastLink.hidden = true;
    toastLink.tabIndex = -1;
    toast.append(toastMessage, toastLink);
    document.body.append(rabbitHint, pixelLayer, toast);

    const positionHint = () => {
      if (!activeRabbit || caught > 0) {
        rabbitHint.hidden = true;
        return;
      }
      const bounds = activeRabbit.getBoundingClientRect();
      if (!bounds.width || !bounds.height || bounds.bottom < 0 || bounds.top > window.innerHeight) {
        rabbitHint.hidden = true;
        return;
      }
      const x = Math.max(90, Math.min(window.innerWidth - 90, bounds.left + bounds.width / 2));
      const above = bounds.top > (header?.getBoundingClientRect().bottom ?? 0) + 48;
      rabbitHint.style.left = `${x}px`;
      rabbitHint.style.top = `${above ? bounds.top - 35 : bounds.bottom + 7}px`;
      rabbitHint.hidden = false;
    };

    const scatterPixels = (bounds, destination) => {
      if (reducedMotionQuery.matches) return;
      window.clearTimeout(pixelTimer);
      pixelLayer.replaceChildren();
      const originX = bounds.left + bounds.width / 2;
      const originY = bounds.top + bounds.height * .43;
      const colors = ['#e8ffef', '#9eede2', '#51c9c8', '#247f84'];
      for (let index = 0; index < 22; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 18 + Math.random() * 56;
        const x = originX + Math.cos(angle) * radius;
        const y = originY + Math.sin(angle) * radius * .7;
        const pixel = document.createElement('i');
        pixel.className = 'rabbit-pixel';
        pixel.style.left = `${x}px`;
        pixel.style.top = `${y}px`;
        pixel.style.setProperty('--dx', `${destination.x - x}px`);
        pixel.style.setProperty('--dy', `${destination.y - y}px`);
        pixel.style.setProperty('--delay', `${Math.round(Math.random() * 170)}ms`);
        pixel.style.setProperty('--size', `${index % 4 === 0 ? 6 : 4}px`);
        pixel.style.setProperty('--tone', colors[index % colors.length]);
        pixelLayer.append(pixel);
      }
      pixelTimer = window.setTimeout(() => pixelLayer.replaceChildren(), 1200);
    };

    const closeRewardGate = () => {
      if (!rewardGate) return;
      if (rewardGate.matches(':hover') || rewardGate === document.activeElement) {
        gateTimer = window.setTimeout(closeRewardGate, 1800);
        return;
      }
      const closingGate = rewardGate;
      rewardGate = null;
      closingGate.classList.remove('is-open');
      window.setTimeout(() => closingGate.remove(), reducedMotionQuery.matches ? 0 : 260);
    };

    const openRewardGate = (x, y) => {
      rewardGate?.remove();
      window.clearTimeout(gateTimer);
      rewardGate = document.createElement('a');
      rewardGate.className = 'rabbit-reward-gate';
      rewardGate.href = rabbitHoleUrl.href;
      rewardGate.style.left = `${x}px`;
      rewardGate.style.top = `${y}px`;
      rewardGate.innerHTML = '<span aria-hidden="true">✦</span><strong>Rabbit hole</strong><small>Enter ↗</small>';
      document.body.append(rewardGate);
      window.requestAnimationFrame(() => rewardGate?.classList.add('is-open'));
      gateTimer = window.setTimeout(closeRewardGate, 12000);
    };

    const hideToast = () => {
      if (toast.contains(document.activeElement)) {
        toastTimer = window.setTimeout(hideToast, 2000);
        return;
      }
      toast.classList.remove('is-visible');
      toastLink.tabIndex = -1;
    };

    const hideRabbit = () => {
      if (activeRabbit) {
        activeRabbit.classList.remove('is-peeking', 'is-caught');
        activeRabbit.setAttribute('aria-hidden', 'true');
        activeRabbit.tabIndex = -1;
        if (document.activeElement === activeRabbit) activeRabbit.blur();
      }
      activeRabbit = null;
      rabbitHint.hidden = true;
    };

    const placeRabbit = (rabbit) => {
      if (getComputedStyle(rabbit).display === 'none') return false;
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;

      if (rabbit.classList.contains('rabbit-inline')) {
        const bounds = rabbit.getBoundingClientRect();
        if (bounds.bottom <= headerBottom + 20 || bounds.top >= window.innerHeight - 20) return false;
        const travel = Math.max(0, rabbit.parentElement.clientWidth - rabbit.offsetWidth);
        rabbit.style.marginLeft = `${Math.round(Math.random() * travel)}px`;
        rabbit.style.marginRight = '0';
        return true;
      }

      const section = rabbit.closest('section');
      if (!section) return false;
      const bounds = section.getBoundingClientRect();
      const top = Math.max(headerBottom + 22, bounds.top + 100);
      const bottom = Math.min(window.innerHeight - rabbit.offsetHeight - 24, bounds.bottom - rabbit.offsetHeight - 55);
      if (bottom <= top) return false;

      rabbit.style.top = `${Math.round(top - bounds.top + Math.random() * (bottom - top))}px`;
      const gutter = Math.max(0, (window.innerWidth - Math.min(window.innerWidth, 1220)) / 2);
      const sideOffset = 12 + Math.random() * Math.max(0, gutter - rabbit.offsetWidth - 20);
      if (rabbit.classList.contains('rabbit-left')) rabbit.style.left = `${Math.round(sideOffset)}px`;
      if (rabbit.classList.contains('rabbit-right')) rabbit.style.right = `${Math.round(sideOffset)}px`;
      return true;
    };

    const scheduleRabbit = () => {
      window.clearTimeout(rabbitTimer);
      if (document.hidden) return;
      rabbitTimer = window.setTimeout(() => {
        const visibleSlots = rabbits.filter(placeRabbit);
        if (visibleSlots.length) {
          const choices = visibleSlots.length > 1 ? visibleSlots.filter((rabbit) => rabbit !== lastRabbit) : visibleSlots;
          activeRabbit = choices[Math.floor(Math.random() * choices.length)];
          lastRabbit = activeRabbit;
          activeRabbit.classList.add('is-peeking');
          activeRabbit.setAttribute('aria-hidden', 'false');
          activeRabbit.setAttribute('aria-keyshortcuts', 'R');
          activeRabbit.tabIndex = 0;
          positionHint();
          const expireRabbit = () => {
            if (document.activeElement === activeRabbit) {
              hideTimer = window.setTimeout(expireRabbit, 1000);
              return;
            }
            hideRabbit();
            scheduleRabbit();
          };
          hideTimer = window.setTimeout(expireRabbit, reducedMotionQuery.matches ? 10000 : caught === 0 ? 5200 : 3200);
        } else {
          scheduleRabbit();
        }
      }, 8000 + Math.random() * 6000);
    };

    const catchRabbit = (rabbit) => {
      if (rabbit !== activeRabbit || rabbit.classList.contains('is-caught')) return;
      window.clearTimeout(hideTimer);
      const bounds = rabbit.getBoundingClientRect();
      rabbit.classList.add('is-caught');
      caught += 1;
      rabbitHint.hidden = true;
      try { sessionStorage.setItem('aduneer-rabbits-caught', String(caught)); } catch (_) { /* Storage is optional. */ }
      const justUnlocked = caught === rabbitRewardCount;
      const originX = bounds.left + bounds.width / 2;
      const originY = bounds.top + bounds.height * .43;
      const gateOffset = window.innerWidth > 600 ? (originX < window.innerWidth / 2 ? 112 : -112) : 0;
      const gateX = Math.max(82, Math.min(window.innerWidth - 82, originX + gateOffset));
      const gateY = Math.max(115, Math.min(window.innerHeight - 110, originY - 8));
      scatterPixels(bounds, justUnlocked ? { x: gateX, y: gateY } : { x: originX, y: originY });
      if (justUnlocked) window.setTimeout(() => openRewardGate(gateX, gateY), reducedMotionQuery.matches ? 0 : 740);
      if (rabbitPortal && caught >= rabbitRewardCount) rabbitPortal.hidden = false;
      toastMessage.textContent = justUnlocked ? 'A rabbit hole opened · 3 caught' : caught < rabbitRewardCount ? `Rabbit caught · ${caught}/${rabbitRewardCount}` : `Rabbit caught · ${caught} total`;
      toastLink.hidden = caught < rabbitRewardCount;
      toastLink.tabIndex = caught >= rabbitRewardCount ? 0 : -1;
      toast.classList.toggle('has-reward', caught >= rabbitRewardCount);
      toast.classList.add('is-visible');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(hideToast, justUnlocked ? 10000 : caught >= rabbitRewardCount ? 5000 : 2700);
      activeRabbit = null;
      window.setTimeout(() => {
        rabbit.classList.remove('is-peeking', 'is-caught');
        rabbit.setAttribute('aria-hidden', 'true');
        rabbit.tabIndex = -1;
        if (document.activeElement === rabbit) rabbit.blur();
      }, reducedMotionQuery.matches ? 0 : 380);
      scheduleRabbit();
    };

    rabbits.forEach((rabbit) => rabbit.addEventListener('click', () => catchRabbit(rabbit)));
    window.addEventListener('scroll', positionHint, { passive: true });
    window.addEventListener('resize', positionHint);
    document.addEventListener('keydown', (event) => {
      if (!activeRabbit || event.key.toLowerCase() !== 'r' || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
      catchRabbit(activeRabbit);
    });

    document.addEventListener('visibilitychange', () => {
      window.clearTimeout(hideTimer);
      hideRabbit();
      scheduleRabbit();
    });
    watchMedia(reducedMotionQuery, () => {
      window.clearTimeout(hideTimer);
      hideRabbit();
      scheduleRabbit();
    });
    scheduleRabbit();
  }

  // Keep the enhanced interface hidden until setup completes. If script fails,
  // the no-js baseline remains available.
  root.classList.remove('no-js');
})();
