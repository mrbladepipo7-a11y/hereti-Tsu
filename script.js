(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Footer year
  $('#year').textContent = new Date().getFullYear();

  // Mobile menu
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'მენიუს გახსნა');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }
  menuToggle.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'მენიუს დახურვა' : 'მენიუს გახსნა');
    mobileMenu.classList.toggle('open', opening);
    mobileMenu.setAttribute('aria-hidden', String(!opening));
    document.body.classList.toggle('menu-open', opening);
  });
  $$('.mobile-menu a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeMenu(); closeModal(); } });

  // Scroll progress
  const progress = $('#readingProgress');
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Reveal animations: stagger sibling items lightly and respect reduced motion
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    $$('.reveal').forEach((el, index) => {
      el.style.transitionDelay = `${Math.min((index % 4) * 55, 165)}ms`;
      observer.observe(el);
    });
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  // Subtle parallax on the hero art, disabled for touch/reduced-motion
  const heroArt = $('.hero-art');
  if (heroArt && !reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', event => {
      const x = (event.clientX / window.innerWidth - .5) * 9;
      const y = (event.clientY / window.innerHeight - .5) * 7;
      heroArt.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }, { passive: true });
  }

  // Modal details for heritage cards
  const modal = $('#detailModal');
  const modalTitle = $('#modalTitle');
  const modalText = $('#modalText');
  let previousFocus = null;
  function openModal(title, detail, trigger) {
    previousFocus = trigger || document.activeElement;
    modalTitle.textContent = title;
    modalText.textContent = detail;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('[data-close-modal]', modal).focus?.();
  }
  function closeModal() {
    if (!modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.focus) previousFocus.focus();
  }
  $$('.details-button').forEach(button => button.addEventListener('click', () => {
    openModal(button.dataset.title, button.dataset.detail, button);
  }));
  $$('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));

  // Schematic map points respond to click and keyboard focus
  $$$('.map-point').forEach(point => {
    point.addEventListener('click', () => {
      $$$('.map-point').forEach(other => other.classList.remove('active'));
      point.classList.add('active');
    });
    point.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        point.click();
      }
    });
  });

  // Cinematic motion system (GSAP is progressive enhancement; native CSS remains the fallback).
  const topbar = $('.topbar');
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  cursorGlow.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursorGlow);

  if (!reducedMotion && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', event => {
      cursorGlow.style.opacity = '1';
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { cursorGlow.style.opacity = '0'; });
  }

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      topbar?.classList.toggle('scrolled', window.scrollY > 24);
      scrollTicking = false;
    });
  }, { passive: true });

  if (window.gsap && !reducedMotion) {
    gsap.registerPlugin(window.ScrollTrigger);
    gsap.config({ nullTargetWarn: false });

    // Opening sequence: editorial title, then supporting copy, then the landscape.
    const heroTitle = $('.hero-title');
    if (heroTitle) {
      gsap.fromTo(heroTitle.querySelector('span'),
        { yPercent: 115, rotate: 2, scale: .94, transformOrigin: 'left bottom' },
        { yPercent: 0, rotate: 0, scale: 1, duration: 1.35, ease: 'power4.out', delay: .12 });
      gsap.fromTo(heroTitle.querySelector('em'),
        { y: 48, autoAlpha: 0, skewY: 3 },
        { y: 0, autoAlpha: 1, skewY: 0, duration: 1.1, ease: 'power3.out', delay: .38 });
      gsap.fromTo('.hero-art .sun-disc',
        { scale: .72, autoAlpha: 0, rotate: -12 },
        { scale: 1, autoAlpha: 1, rotate: 0, duration: 1.7, ease: 'power3.out', delay: .22 });
      gsap.fromTo('.hero-art .ridge',
        { y: 90, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.5, stagger: .13, ease: 'power4.out', delay: .35 });

    // Extra cinematic polish: soft floating of orbit rings
    gsap.to('.orbit-one', { rotation: 360, duration: 90, repeat: -1, ease: 'none' });
    gsap.to('.orbit-two', { rotation: -360, duration: 140, repeat: -1, ease: 'none' });
    gsap.to('.sun-disc', { scale: 1.04, duration: 3.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    }

    // Large landscape moves against the page scroll for a cinematic depth effect.
    if (window.ScrollTrigger && $('.hero-art')) {
      gsap.to('.hero-art', {
        yPercent: 16, scale: 1.06, rotate: -2,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 }
      });
      gsap.to('.hero-copy', {
        y: -70, autoAlpha: .2, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to('.hero-grid', {
        yPercent: 20, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.3 }
      });
    }

    // Editorial heading reveals and card entrances are staggered as each chapter enters.
    $$('.cinematic-section').forEach((section, sectionIndex) => {
      const heading = $('.heading-main h2', section);
      if (heading) {
        gsap.fromTo(heading,
          { y: 70, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' },
          { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.15, ease: 'power4.out',
            scrollTrigger: { trigger: heading, start: 'top 88%', once: true } });
      }
      const cards = $$('.term-card, .mini-card, .heritage-card, .source-row, .kingdom-step, .timeline-item', section);
      if (cards.length) {
        gsap.fromTo(cards,
          { y: 45, autoAlpha: 0, rotateX: 2 },
          { y: 0, autoAlpha: 1, rotateX: 0, duration: .9, stagger: .095, ease: 'power3.out',
            clearProps: 'transform', scrollTrigger: { trigger: cards[0], start: 'top 91%', once: true } });
      }
      const sectionArt = $$('.origin-image, .geo-map-card, .kingdom-banner, .faith-art', section);
      sectionArt.forEach(art => {
        gsap.fromTo(art,
          { y: 42, scale: .97, autoAlpha: .6 },
          { y: 0, scale: 1, autoAlpha: 1, duration: 1.15, ease: 'power3.out',
            scrollTrigger: { trigger: art, start: 'top 92%', once: true } });
      });
      section.style.setProperty('--chapter-index', sectionIndex + 1);
    });

    // Subtle scroll-linked image movement, not a distracting constant animation.
    if (window.ScrollTrigger) {
      $$('.heritage-photo, .origin-image').forEach(art => {
        gsap.fromTo(art, { backgroundPosition: '50% 58%' }, {
          backgroundPosition: '50% 42%', ease: 'none',
          scrollTrigger: { trigger: art, start: 'top bottom', end: 'bottom top', scrub: .8 }
        });
      });
    }

    // Magnetic micro-interaction on primary buttons for mouse users only.
    if (window.matchMedia('(pointer:fine)').matches) {
      $$('.button').forEach(button => {
        button.addEventListener('pointermove', event => {
          const rect = button.getBoundingClientRect();
          const dx = (event.clientX - rect.left - rect.width / 2) * .08;
          const dy = (event.clientY - rect.top - rect.height / 2) * .12;
          gsap.to(button, { x: dx, y: dy, duration: .35, ease: 'power3.out', overwrite: true });
        });
        button.addEventListener('pointerleave', () => gsap.to(button, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.45)', overwrite: true }));
      });
    }
  }

  // Navigation active section hint
  const navLinks = $$('.desktop-nav a');
  const sections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
        if (link && entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }
  // Floating animated Hereti mini-map: collapse/expand control.
  const floatingMap = $('#floatingMap');
  const mapToggle = $('#mapToggle');
  if (floatingMap && mapToggle) {
    mapToggle.addEventListener('click', () => {
      const collapsed = floatingMap.classList.toggle('is-collapsed');
      mapToggle.textContent = collapsed ? '+' : '−';
      mapToggle.setAttribute('aria-label', collapsed ? 'მინი რუკის გახსნა' : 'მინი რუკის დახურვა');
    });
  }

  // Fixed side index follows the section currently in view.
  const sideLinks = $$('.side-index a');
  if (sideLinks.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sideLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-38% 0px -48% 0px', threshold: 0 });
    sideLinks.forEach(link => {
      const target = $(link.getAttribute('href'));
      if (target) sectionObserver.observe(target);
    });
  }


  // Schematic map point descriptions: the map is an orientation graphic, not a georeferenced map.
  $$('.map-point').forEach(point => {
    const label = point.getAttribute('aria-label') || point.querySelector('text')?.textContent?.trim() || 'ისტორიული ადგილი';
    point.setAttribute('title', label + ' — საორიენტაციო მონიშვნა; არა ზუსტი კოორდინატი');
    point.setAttribute('aria-description', 'სქემატური რუკის საორიენტაციო წერტილი');
  });

  // Monument field-note panels: each site opens its own animated research note.
  $$('.monument-card').forEach((card, index) => {
    const title = $('h3', card);
    const description = $('p', card);
    if (!title || !description) return;
    const extra = document.createElement('div');
    extra.className = 'monument-extra';
    const note = document.createElement('p');
    note.textContent = 'საველე ჩანაწერი: ' + description.textContent.trim() + ' ძეგლის დათარიღება და ისტორიული გარემო სპეციალიზებულ კვლევებთან უნდა გადამოწმდეს.';
    extra.appendChild(note);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'monument-expand';
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span aria-hidden="true">+</span> საველე ჩანაწერი / ' + String(index + 1).padStart(2, '0');
    button.addEventListener('click', () => {
      const expanded = card.classList.toggle('is-expanded');
      button.setAttribute('aria-expanded', String(expanded));
      button.innerHTML = '<span aria-hidden="true">' + (expanded ? '−' : '+') + '</span> ' + (expanded ? 'ჩანაწერის დახურვა' : 'საველე ჩანაწერი / ' + String(index + 1).padStart(2, '0'));
      if (expanded) {
        card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
        extra.classList.add('field-note-open');
      } else extra.classList.remove('field-note-open');
    });
    card.appendChild(button);
    card.appendChild(extra);
  });

  // Make the map journey feel like a gradual zoom as each scale enters the viewport.
  if ('IntersectionObserver' in window && !reducedMotion) {
    const journeyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('journey-in-view');
          journeyObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .22 });
    $$('.journey-stop').forEach((stop, index) => {
      stop.style.transitionDelay = (index * 110) + 'ms';
      journeyObserver.observe(stop);
    });
  }


  // Interactive globe: a lightweight canvas sphere with rotating longitude/latitude,
  // stylized continental silhouettes, and progressive focus from Earth to Hereti.
  const globeCanvas = $('#heretiGlobe');
  if (globeCanvas) {
    const ctx = globeCanvas.getContext('2d');
    const globeFocus = $('#globeFocus');
    const globeButtons = $('.globe-controls [data-globe-stage]');
    const reducedGlobeMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let globeStage = 0, globeRotation = 0, globeFrame = 0, globeLast = 0;
    let globeWidth = 0, globeHeight = 0, globeDpr = 1;
    const stageNames = [
      { label: 'EARTH / დედამიწა', lon: 35, lat: 32, zoom: 1 },
      { label: 'EUROPE / ევროპა', lon: 25, lat: 48, zoom: 1.5 },
      { label: 'GEORGIA / საქართველო', lon: 44, lat: 42, zoom: 2.15 },
      { label: 'HERETI / ჰერეთი', lon: 46, lat: 41, zoom: 2.75 }
    ];
    const continents = [
      [[-168,72],[-140,70],[-125,55],[-110,48],[-95,20],[-80,8],[-62,12],[-52,48],[-80,70],[-115,78]],
      [[-82,12],[-70,-5],[-78,-25],[-68,-55],[-45,-50],[-35,-5],[-52,8],[-62,12]],
      [[-10,72],[28,70],[55,55],[42,35],[32,10],[10,-5],[-15,10],[-18,38],[-5,55]],
      [[35,72],[80,75],[120,65],[160,55],[175,40],[145,20],[120,5],[105,-10],[80,5],[65,25],[45,35],[30,55]],
      [[112,-12],[150,-10],[154,-35],[130,-45],[115,-30]],
      [[-50,80],[-20,78],[-28,60],[-45,58],[-55,70]]
    ];
    function resizeGlobe() {
      const rect = globeCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      globeWidth = rect.width; globeHeight = rect.height;
      globeDpr = Math.min(window.devicePixelRatio || 1, 2);
      globeCanvas.width = Math.round(globeWidth * globeDpr);
      globeCanvas.height = Math.round(globeHeight * globeDpr);
      ctx.setTransform(globeDpr,0,0,globeDpr,0,0);
      drawGlobe();
    }
    function drawGlobe() {
      if (!ctx || !globeWidth || !globeHeight) return;
      const stage = stageNames[globeStage];
      ctx.clearRect(0,0,globeWidth,globeHeight);
      const cx=globeWidth*.5, cy=globeHeight*.48;
      const baseRadius=Math.min(globeWidth*.34,globeHeight*.34,128);
      const radius=baseRadius*(globeStage===0?1:1.05);
      const glow=ctx.createRadialGradient(cx-radius*.25,cy-radius*.32,radius*.06,cx,cy,radius*1.5);
      glow.addColorStop(0,'rgba(103,178,165,.28)');glow.addColorStop(1,'rgba(7,20,23,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,radius*1.55,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.translate(cx,cy);ctx.scale(stage.zoom,stage.zoom);
      const R=radius;
      const sphere=ctx.createRadialGradient(-R*.34,-R*.38,R*.04,0,0,R*1.25);
      sphere.addColorStop(0,'#3e8987');sphere.addColorStop(.58,'#1f5b67');sphere.addColorStop(1,'#0b222e');
      ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.clip();
      const rot=globeRotation*Math.PI/180;
      const targetLat=stage.lat*Math.PI/180;
      function project(lon,lat){
        const phi=lat*Math.PI/180, lambda=(lon-stage.lon)*Math.PI/180+rot;
        const x=Math.cos(phi)*Math.sin(lambda);
        const y=Math.sin(targetLat)*Math.cos(phi)*Math.cos(lambda)-Math.cos(targetLat)*Math.sin(phi);
        const z=Math.sin(targetLat)*Math.sin(phi)+Math.cos(targetLat)*Math.cos(phi)*Math.cos(lambda);
        return {x:x*R,y:y*R,z};
      }
      ctx.strokeStyle='rgba(202,231,215,.19)';ctx.lineWidth=.6;
      for(let lat=-60;lat<=60;lat+=30){
        ctx.beginPath();
        for(let lon=-180;lon<=180;lon+=3){const p=project(lon,lat);if(lon===-180)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
        ctx.stroke();
      }
      for(let lon=-150;lon<=180;lon+=30){
        ctx.beginPath();
        for(let lat=-88;lat<=88;lat+=3){const p=project(lon,lat);if(lat===-88)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
        ctx.stroke();
      }
      continents.forEach(poly=>{
        ctx.beginPath();let started=false;
        for(let i=0;i<poly.length;i++){
          const p=project(poly[i][0],poly[i][1]);
          if(p.z<-.15){started=false;continue;}
          if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y);
        }
        ctx.closePath();ctx.fillStyle='rgba(157,185,125,.86)';ctx.fill();
        ctx.strokeStyle='rgba(219,221,166,.42)';ctx.lineWidth=.7;ctx.stroke();
      });
      // Highlight the Caucasus / Hereti locator on the globe when the selected view permits it.
      const caucasus=project(45.5,41.5);
      if(caucasus.z>-.1){
        ctx.beginPath();ctx.arc(caucasus.x,caucasus.y,Math.max(2.2,3.2/((globeStage+1)**.2)),0,Math.PI*2);
        ctx.fillStyle='#e9d48b';ctx.fill();
        ctx.beginPath();ctx.arc(caucasus.x,caucasus.y,7,0,Math.PI*2);ctx.strokeStyle='rgba(233,212,139,.62)';ctx.lineWidth=1;ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle='rgba(198,231,219,.68)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.stroke();
      ctx.restore();
      if(globeFocus)globeFocus.textContent=stage.label;
    }
    function animateGlobe(now){
      if(!globeLast)globeLast=now;
      const delta=Math.min(32,now-globeLast);globeLast=now;
      if(!reducedGlobeMotion && document.visibilityState==='visible'){
        globeRotation=(globeRotation+delta*.006)%360;
        drawGlobe();
        globeFrame=window.requestAnimationFrame(animateGlobe);
      }else globeFrame=0;
    }
    function setGlobeStage(next){
      globeStage=Math.max(0,Math.min(3,Number(next)||0));
      globeButtons.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.globeStage)===globeStage)));
      drawGlobe();
    }
    globeButtons.forEach(button=>button.addEventListener('click',()=>setGlobeStage(button.dataset.globeStage)));
    if('ResizeObserver' in window)new ResizeObserver(resizeGlobe).observe(globeCanvas);
    else window.addEventListener('resize',resizeGlobe,{passive:true});
    document.addEventListener('visibilitychange',()=>{
      if(document.visibilityState==='visible'&&!reducedGlobeMotion&&!globeFrame){globeLast=0;globeFrame=window.requestAnimationFrame(animateGlobe);}
      else if(document.visibilityState!=='visible'&&globeFrame){cancelAnimationFrame(globeFrame);globeFrame=0;}
    });
    resizeGlobe();
    if(!reducedGlobeMotion)globeFrame=window.requestAnimationFrame(animateGlobe);
  }

})();
