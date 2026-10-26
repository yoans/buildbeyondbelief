// =====================================
// Build Beyond Belief. Landing Page Scripts
// =====================================

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initScrollAnimations();
  initBlueprintForm();
  initSmoothScroll();
  initMobileMenu();
});

// =====================================
// Floating Particles
// =====================================

function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random size
    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // Random animation delay
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
    
    container.appendChild(particle);
  }
}

// =====================================
// Scroll Animations with GSAP
// =====================================

function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Animate elements with data-animate attribute (skip hero, has its own timeline)
  const nonHeroElements = [...document.querySelectorAll('[data-animate]')].filter(
    el => !el.closest('.hero')
  );
  
  nonHeroElements.forEach((el) => {
    const delay = parseFloat(el.dataset.delay) || 0;
    
    gsap.fromTo(el, 
      {
        opacity: 0,
        y: 40
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      }
    );
  });

  // Parallax effect on hero logo
  const heroLogo = document.querySelector('.hero-logo');
  if (heroLogo) {
    gsap.to('.hero-visual', {
      y: 80,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Navigation background on scroll
  const nav = document.querySelector('.nav');
  if (!nav) return;
  ScrollTrigger.create({
    start: 100,
    onUpdate: (self) => {
      if (self.scroll() > 100) {
        nav.style.background = 'rgba(10, 10, 15, 0.95)';
      } else {
        nav.style.background = 'rgba(10, 10, 15, 0.8)';
      }
    }
  });

  // Stagger animation for coaching cards
  gsap.fromTo('.coaching-card',
    {
      opacity: 0,
      y: 50
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.coaching-grid',
        start: 'top 80%',
        once: true
      }
    }
  );

  // Stagger animation for offer cards
  gsap.fromTo('.offer-card',
    {
      opacity: 0,
      y: 50
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '.offers-grid',
        start: 'top 80%',
        once: true
      }
    }
  );

  // Pre-hide hero elements immediately (before any delay) to prevent flash
  gsap.set(['.hero-badge', '.hero-title', '.hero-subtitle', '.hero-ctas', '.hero-stats'], {
    opacity: 0,
    y: 30,
  });

  // Hero elements entrance
  gsap.timeline({ delay: 0.2 })
    .to('.hero-badge',    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
    .to('.hero-title',    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.3')
    .to('.hero-subtitle', { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5')
    .to('.hero-ctas',     { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to('.hero-stats',    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');

  // Hero logo draw-on + fan-out animation
  initHeroLogo();
}

// =====================================
// Blueprint Form Handler (Lead Magnet)
// =====================================

function initBlueprintForm() {
  // The engineer checklist is a static page. Nothing here posts to a server.
}

// =====================================
// Smooth Scroll for Anchor Links
// =====================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navHeight = document.querySelector('.nav').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// =====================================
// Hero Logo. Draw-On + Fan-Out Animation
// =====================================

function initHeroLogo() {
  const b1 = document.querySelector('.hero-b1');
  const b2 = document.querySelector('.hero-b2');
  const b3 = document.querySelector('.hero-b3');
  if (!b1) return;

  const bData = [
    { el: b1, rotation: -55, opacity: 0.6 },
    { el: b2, rotation: -27, opacity: 0.7 },
    { el: b3, rotation: 1,   opacity: 0.95 },
  ];

  // Measure actual path lengths and set initial collapsed state
  bData.forEach(({ el }) => {
    const path = el.querySelector('path');
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(el, {
      attr: { transform: 'translate(150,140) rotate(0,-10,0) scale(2)' },
      opacity: 0,
    });
  });

  // Timeline: draw → fan → hold → (yoyo: collapse → undraw → pause → repeat)
  const drawDuration  = 0.9;
  const drawStagger   = 0.4;
  const drawStart     = 0.2;   // brief invisible hold at start
  const fanDuration   = 1.2;
  const fanStagger    = 0.2;
  const lastDrawEnd   = drawStart + (bData.length - 1) * drawStagger + drawDuration;
  const fanStart      = lastDrawEnd + 0.3;

  const tl = gsap.timeline({
    delay: 1.2,
  });

  // Invisible hold (also the resting point at yoyo-reversed end)
  tl.to({}, { duration: drawStart });

  // Phase 1: Draw each stroke sequentially
  bData.forEach(({ el, opacity }, i) => {
    const t = drawStart + i * drawStagger;
    tl.to(el.querySelector('path'), { strokeDashoffset: 0, duration: drawDuration, ease: 'power2.inOut' }, t);
    tl.to(el, { opacity, duration: 0.6, ease: 'power1.out' }, t);
  });

  // Phase 2: Fan out to final rotation positions
  bData.forEach(({ el, rotation }, i) => {
    tl.to(el, {
      attr: { transform: `translate(150,140) rotate(${rotation},-10,0) scale(2)` },
      duration: fanDuration,
      ease: 'power3.out',
    }, fanStart + i * fanStagger);
  });
}

// =====================================
// CSS for spinning animation
// =====================================

const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);

// =====================================
// Mobile Menu Toggle
// =====================================

function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav-open');
    toggle.classList.toggle('active');
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-open');
      toggle.classList.remove('active');
    });
  });
}
