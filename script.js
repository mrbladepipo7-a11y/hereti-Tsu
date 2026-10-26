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


  // Interactive Earth globe: use Three.js + public Earth texture when available;
  // keep a self-contained canvas fallback for blocked CDNs or texture failures.
  const globeCanvas = $('#heretiGlobe');
  if (globeCanvas) {
    const globeButtons = $$('.globe-controls [data-globe-stage]');
    const globeFocus = $('#globeFocus');
    const stageNames = [
      { label: 'EARTH / დედამიწა', lon: 12, lat: 22, distance: 4.35, zoom: 1 },
      { label: 'EUROPE / ევროპა', lon: 18, lat: 48, distance: 3.65, zoom: 1.25 },
      { label: 'GEORGIA / საქართველო', lon: 44.5, lat: 41.8, distance: 2.85, zoom: 1.75 },
      { label: 'HERETI / ჰერეთი', lon: 46, lat: 41.5, distance: 2.12, zoom: 2.35 }
    ];
    let selectedStage = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function setStage(next) {
      selectedStage = Math.max(0, Math.min(3, Number(next) || 0));
      globeButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.globeStage) === selectedStage)));
      if (globeFocus) globeFocus.textContent = stageNames[selectedStage].label;
    }
    globeButtons.forEach(button => button.addEventListener('click', () => setStage(button.dataset.globeStage)));

    // The fallback draws a shaded globe immediately so the area never appears empty.
    function drawFallback() {
      const ctx = globeCanvas.getContext('2d');
      if (!ctx) return;
      let w = 0, h = 0, dpr = 1, rotation = 0, frame = 0, last = 0;
      let currentZoom = 1, targetZoom = 1;
      const shapes = [
        [[-168,72],[-140,70],[-125,55],[-110,48],[-95,20],[-80,8],[-62,12],[-52,48],[-80,70],[-115,78]],
        [[-82,12],[-70,-5],[-78,-25],[-68,-55],[-45,-50],[-35,-5],[-52,8],[-62,12]],
        [[-10,72],[28,70],[55,55],[42,35],[32,10],[10,-5],[-15,10],[-18,38],[-5,55]],
        [[35,72],[80,75],[120,65],[160,55],[175,40],[145,20],[120,5],[105,-10],[80,5],[65,25],[45,35],[30,55]],
        [[112,-12],[150,-10],[154,-35],[130,-45],[115,-30]]
      ];
      function resize() {
        const rect=globeCanvas.getBoundingClientRect(); if(!rect.width||!rect.height)return;
        w=rect.width;h=rect.height;dpr=Math.min(devicePixelRatio||1,2);
        globeCanvas.width=Math.round(w*dpr);globeCanvas.height=Math.round(h*dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);draw();
      }
      function draw() {
        if(!w||!h)return;
        const stage=stageNames[selectedStage]; targetZoom=stage.zoom;
        currentZoom += (targetZoom-currentZoom)*.08;
        ctx.clearRect(0,0,w,h);
        const cx=w/2,cy=h*.47,R=Math.min(w*.33,h*.34,136);
        const halo=ctx.createRadialGradient(cx-R*.2,cy-R*.3,R*.1,cx,cy,R*1.55);
        halo.addColorStop(0,'rgba(87,177,174,.32)');halo.addColorStop(1,'rgba(4,16,22,0)');
        ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,R*1.5,0,Math.PI*2);ctx.fill();
        ctx.save();ctx.translate(cx,cy);ctx.scale(currentZoom,currentZoom);
        const sphere=ctx.createRadialGradient(-R*.38,-R*.42,R*.03,0,0,R*1.2);
        sphere.addColorStop(0,'#5b9e9c');sphere.addColorStop(.5,'#246a7a');sphere.addColorStop(1,'#071b2a');
        ctx.fillStyle=sphere;ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.clip();
        function project(lon,lat){const p=(lon-stage.lon+rotation*.08)*Math.PI/180, t=lat*Math.PI/180, cent=stage.lat*Math.PI/180;return{x:R*Math.cos(t)*Math.sin(p),y:R*(Math.sin(cent)*Math.cos(t)*Math.cos(p)-Math.cos(cent)*Math.sin(t)),z:Math.sin(cent)*Math.sin(t)+Math.cos(cent)*Math.cos(t)*Math.cos(p)}}
        ctx.strokeStyle='rgba(202,235,227,.14)';ctx.lineWidth=.6;
        for(let lat=-60;lat<=60;lat+=30){ctx.beginPath();for(let lon=-180;lon<=180;lon+=3){const p=project(lon,lat);if(lon===-180)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}ctx.stroke()}
        for(let lon=-150;lon<=180;lon+=30){ctx.beginPath();for(let lat=-85;lat<=85;lat+=3){const p=project(lon,lat);if(lat===-85)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}ctx.stroke()}
        shapes.forEach(poly=>{ctx.beginPath();let open=false;poly.forEach(([lon,lat])=>{const p=project(lon,lat);if(p.z<0){open=false;return}if(!open){ctx.moveTo(p.x,p.y);open=true}else ctx.lineTo(p.x,p.y)});ctx.closePath();ctx.fillStyle='#719a77';ctx.fill();ctx.strokeStyle='rgba(226,221,170,.55)';ctx.stroke()});
        const mark=project(46,41.5);if(mark.z>0){ctx.fillStyle='#f2d98c';ctx.beginPath();ctx.arc(mark.x,mark.y,3.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f2d98c88';ctx.beginPath();ctx.arc(mark.x,mark.y,8,0,Math.PI*2);ctx.stroke()}
        ctx.restore();ctx.strokeStyle='rgba(215,240,229,.7)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,R,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
      function animate(now){if(!last)last=now;const dt=Math.min(32,now-last);last=now;if(!reducedMotion&&document.visibilityState==='visible')rotation=(rotation+dt*.5)%360;draw();frame=requestAnimationFrame(animate)}
      if('ResizeObserver'in window)new ResizeObserver(resize).observe(globeCanvas);else window.addEventListener('resize',resize);
      resize();if(!reducedMotion)frame=requestAnimationFrame(animate);
      return {stop(){cancelAnimationFrame(frame)}};
    }
    const fallback = drawFallback();
    function loadThree() {
      if (window.THREE) { initThree(window.THREE); return; }
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
      script.async=true;
      script.onload=()=>{if(window.THREE)initThree(window.THREE)};
      script.onerror=()=>{};
      document.head.appendChild(script);
    }
    function initThree(THREE) {
      try {
        const rect=globeCanvas.getBoundingClientRect();
        if(!rect.width||!rect.height)return;
        const renderCanvas=document.createElement('canvas');
        renderCanvas.className='hereti-globe hereti-globe-webgl';
        renderCanvas.setAttribute('aria-label','რეალისტური სამგანზომილებიანი დედამიწა, ევროპის, საქართველოსა და ჰერეთის ხედებით');
        renderCanvas.setAttribute('role','img');
        globeCanvas.parentNode.insertBefore(renderCanvas,globeCanvas);
        const renderer=new THREE.WebGLRenderer({canvas:renderCanvas,alpha:true,antialias:true,powerPreference:'high-performance'});
        renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
        renderer.setSize(rect.width,rect.height,false);
        renderer.outputColorSpace=THREE.SRGBColorSpace;
        const scene=new THREE.Scene();
        const camera=new THREE.PerspectiveCamera(35,rect.width/rect.height,.1,100);
        camera.position.z=stageNames[0].distance;
        scene.add(new THREE.AmbientLight(0x9dbacb,1.65));
        const keyLight=new THREE.DirectionalLight(0xffffff,2.4);keyLight.position.set(-3,2,5);scene.add(keyLight);
        const fillLight=new THREE.DirectionalLight(0x5a9cba,.9);fillLight.position.set(4,-1,-3);scene.add(fillLight);
        const earthPivot=new THREE.Group();scene.add(earthPivot);
        const geometry=new THREE.SphereGeometry(1.12,96,72);
        const loader=new THREE.TextureLoader();loader.crossOrigin='anonymous';
        const earthMaterial=new THREE.MeshPhongMaterial({color:0xffffff,specular:new THREE.Color(0x263d4a),shininess:12});
        const earth=new THREE.Mesh(geometry,earthMaterial);earthPivot.add(earth);
        const cloudsMaterial=new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:.15,depthWrite:false});
        const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.128,64,48),cloudsMaterial);earthPivot.add(clouds);
        loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',texture=>{texture.colorSpace=THREE.SRGBColorSpace;earthMaterial.map=texture;earthMaterial.needsUpdate=true;},undefined,()=>{earthMaterial.color.set(0x2e7180)});
        loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png',texture=>{texture.colorSpace=THREE.SRGBColorSpace;cloudsMaterial.map=texture;cloudsMaterial.needsUpdate=true;},undefined,()=>{clouds.visible=false});
        const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.17,64,48),new THREE.MeshBasicMaterial({color:0x5ebad0,transparent:true,opacity:.13,side:THREE.BackSide}));earthPivot.add(atmosphere);
        const starPositions=[];for(let i=0;i<900;i++){const theta=Math.random()*Math.PI*2,phi=Math.acos(2*Math.random()-1),r=8+Math.random()*10;starPositions.push(r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta))}
        const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
        scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xd8e8ee,size:.025,transparent:true,opacity:.75})));
        const markerGroup=new THREE.Group();earthPivot.add(markerGroup);
        function latLonVector(lon,lat,radius=1.145){const phi=(90-lat)*Math.PI/180,theta=(lon+180)*Math.PI/180;return new THREE.Vector3(-radius*Math.sin(phi)*Math.cos(theta),radius*Math.cos(phi),radius*Math.sin(phi)*Math.sin(theta))}
        const markerPos=latLonVector(46,41.5,1.145);
        const pin=new THREE.Mesh(new THREE.SphereGeometry(.025,16,12),new THREE.MeshBasicMaterial({color:0xffdf8e}));pin.position.copy(markerPos);markerGroup.add(pin);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(.055,.004,8,48),new THREE.MeshBasicMaterial({color:0xffdf8e,transparent:true,opacity:.9}));ring.position.copy(markerPos.clone().multiplyScalar(1.02));ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),markerPos.clone().normalize());markerGroup.add(ring);
        // A longitude/latitude target rotation is eased every frame, never snapped.
        let targetY=0,targetX=0,targetDistance=stageNames[0].distance;
        function setTarget(){const s=stageNames[selectedStage];targetY=-s.lon*Math.PI/180-Math.PI/2;targetX=s.lat*Math.PI/180;targetDistance=s.distance}
        setTarget();
        let frame=0,last=0,alive=true;
        function resize(){const box=globeCanvas.getBoundingClientRect();if(!box.width||!box.height)return;renderer.setSize(box.width,box.height,false);camera.aspect=box.width/box.height;camera.updateProjectionMatrix()}
        function animate(now){if(!alive)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;
          if(!reducedMotion){earth.rotation.y+=dt*.045;clouds.rotation.y+=dt*.055}
          const s=stageNames[selectedStage];targetY=-s.lon*Math.PI/180-Math.PI/2;targetX=s.lat*Math.PI/180;targetDistance=s.distance;
          earthPivot.rotation.y+=(targetY-earthPivot.rotation.y)*.045;earthPivot.rotation.x+=(targetX-earthPivot.rotation.x)*.045;
          camera.position.z+=(targetDistance-camera.position.z)*.055;
          renderer.render(scene,camera);frame=requestAnimationFrame(animate)}
        globeButtons.forEach(button=>button.addEventListener('click',()=>{selectedStage=Math.max(0,Math.min(3,Number(button.dataset.globeStage)||0))}));
        if('ResizeObserver'in window)new ResizeObserver(resize).observe(globeCanvas);else window.addEventListener('resize',resize);
        globeCanvas.style.display='none';renderCanvas.style.display='block';
        if(fallback)fallback.stop();
        animate(0);
      } catch(error) {
        // The 2D fallback stays visible if WebGL cannot initialize.
      }
    }
    loadThree();
  }

  const atlasButtons = $$('.atlas-era');
  const atlasTitle = $('#atlasEraTitle');
  const atlasNote = $('#atlasEraNote');
  const atlasTerritory = $('#atlasMap .atlas-territory');
  const atlasNeighbours = $$('#atlasMap .atlas-neighbour');
  const atlasData = [
    {title:'VIII–IX საუკუნეები',note:'VIII–IX საუკუნეებში ჰერეთი ცალკე პოლიტიკურ ერთეულად ყალიბდებოდა. რუკა ისტორიული არეალის ზოგად წარმოდგენას იძლევა და არა ზუსტ საზღვარს.',fill:'#b69b61',opacity:.62,transform:'translate(0 0)'},
    {title:'X საუკუნე',note:'X საუკუნეში ჰერეთის პოლიტიკური გავლენა ძლიერდებოდა. წყაროებში საზღვრები ერთნაირად არ არის განსაზღვრული, ამიტომ ნაჩვენებია პირობითი არეალი.',fill:'#a9894f',opacity:.72,transform:'translate(8px,-4px)'},
    {title:'XI საუკუნე',note:'XI საუკუნეში ჰერეთისა და კახეთის პოლიტიკური ურთიერთობა და გაერთიანების პროცესი რეგიონს ახალ კონტექსტში აქცევს.',fill:'#9b9f71',opacity:.58,transform:'translate(14px,2px)'},
    {title:'შემდგომი ეპოქები',note:'მომდევნო საუკუნეებში ადმინისტრაციული სახელები და პოლიტიკური საზღვრები იცვლებოდა. ეს რუკა თანამედროვე საზღვრების ზუსტ ასახვას არ წარმოადგენს.',fill:'#a7b69a',opacity:.48,transform:'translate(3px,7px)'}
  ];
  atlasButtons.forEach(button=>button.addEventListener('click',()=>{
    const item=atlasData[Number(button.dataset.atlasEra)||0];
    atlasButtons.forEach(b=>b.classList.toggle('is-active',b===button));
    if(atlasTitle)atlasTitle.textContent=item.title;
    if(atlasNote)atlasNote.textContent=item.note;
    if(atlasTerritory){atlasTerritory.style.fill=item.fill;atlasTerritory.style.fillOpacity=String(item.opacity);atlasTerritory.style.transform=item.transform;}
    atlasNeighbours.forEach((shape,i)=>{shape.style.fill=i===0?'#9baf92':'#b5c2b0';shape.style.fillOpacity=String(.45+Number(button.dataset.atlasEra)*.04)});
  }));

})();
