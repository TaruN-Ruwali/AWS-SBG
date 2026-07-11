document.addEventListener('DOMContentLoaded', () => {

  // ---- Theme toggle (light/dark) ----
  const themeToggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('sbg-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);

  themeToggle?.addEventListener('click', () => {
    const toggle = () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', current);
      localStorage.setItem('sbg-theme', current);
      // themeToggle.textContent = current === 'dark' ? '☀️' : '🌙';
    };

    if (!document.startViewTransition) {
      toggle();
      return;
    }

    const cloudPathD = 'M 0 -25 C -10 -25 -17 -18 -17 -10 C -28 -10 -35 -2 -35 8 C -35 18 -27 25 -17 25 L 17 25 C 27 25 35 18 35 8 C 35 -1 29 -8 20 -10 C 20 -18 12 -25 0 -25 Z';
    const maskSvgData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"><path fill="black" d="${cloudPathD}"/></svg>`;
    const borderSvgData = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 100 100"><style>.cloud-path{fill:none;stroke:%230062FD;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:60 140;animation:cloud-dash 1.5s linear infinite;}@keyframes cloud-dash{0%{stroke-dashoffset:200;}100%{stroke-dashoffset:0;}}</style><path class="cloud-path" d="${cloudPathD}"/></svg>`;
    document.documentElement.style.setProperty('--cloud-mask', `url('${maskSvgData}')`);
    document.documentElement.style.setProperty('--animated-cloud', `url('${borderSvgData}')`);

    let dummy = document.getElementById('vt-cloud-dummy');
    if (!dummy) {
      dummy = document.createElement('div');
      dummy.id = 'vt-cloud-dummy';
      dummy.style.cssText = 'view-transition-name: cloud-border; position: fixed; opacity: 0; pointer-events: none;';
      document.body.appendChild(dummy);
    }

    document.startViewTransition(() => {
      toggle();
    });
  });

  // ---- Mobile nav toggle ----
  const menuToggle = document.querySelector('.menu-toggle');
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelector('.nav-links');
  
  menuToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    navbar.classList.toggle('mobile-open');
    document.body.classList.toggle('mobile-menu-active');
  });

  // Close mobile nav when a link is clicked
  navLinks?.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navbar.classList.remove('mobile-open');
      document.body.classList.remove('mobile-menu-active');
    }
  });

  // Close mobile nav on outside click (fallback)
  document.addEventListener('click', (e) => {
    if (navbar?.classList.contains('mobile-open') && !navbar.contains(e.target) && e.target !== menuToggle) {
      navbar.classList.remove('mobile-open');
      document.body.classList.remove('mobile-menu-active');
    }
  });

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  revealEls.forEach(el => observer.observe(el));

  // ---- Animated Counters ----
  const statNums = document.querySelectorAll('.stat-box .num');
  const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target') || entry.target.innerText);
        let count = 0;
        const inc = Math.max(1, Math.ceil(target / 40)); // speed
        const updateCount = () => {
          count += inc;
          if (count < target) {
            entry.target.innerText = count + '+';
            requestAnimationFrame(updateCount);
          } else {
            entry.target.innerText = (entry.target.getAttribute('data-suffix') ? target + entry.target.getAttribute('data-suffix') : target + '+');
          }
        };
        updateCount();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(num => statObserver.observe(num));

  // ---- Team/Gallery image fallback placeholders ----
  document.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      img.classList.add('broken');
      const placeholder = document.createElement('div');
      placeholder.className = 'photo-placeholder';
      placeholder.innerHTML = `<span class="cam"></span><span>${img.dataset.fallback}</span>`;
      img.parentElement.appendChild(placeholder);
    });
  });

  // ---- Lightbox for gallery ----
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox?.querySelector('img');

  const openLightbox = (src) => {
    if (!lightbox) return;
    lightboxImg.src = src;
    lightbox.classList.add('active');
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('active');
  };

  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
      if (img.classList.contains('broken')) return;
      openLightbox(img.src);
    });
  });

  document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Escape key for lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox?.classList.contains('active')) {
      closeLightbox();
    }
  });

  // ---- Filter Logic (Events & Gallery) ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from siblings
      const container = btn.closest('.filter-tabs');
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');
      const itemsContainer = document.querySelector(btn.getAttribute('data-target-container'));
      if (!itemsContainer) return;

      const items = itemsContainer.querySelectorAll('.filter-item');
      items.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.classList.remove('filtered-out');
        } else {
          item.classList.add('filtered-out');
        }
      });
    });
  });

  // ---- Toast for Coming Soon links ----
  const createToast = () => {
    let toast = document.getElementById('sbg-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sbg-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    return toast;
  };

  document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const toast = createToast();
      toast.textContent = 'Coming Soon! Stay tuned.';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    });
  });

  // ---- Contact form ----
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const messageBox = document.getElementById('message');
  const charCount = document.getElementById('char-count');

  messageBox?.addEventListener('input', () => {
    charCount.textContent = `${messageBox.value.length}/5000`;
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    status.className = 'form-status';
    status.textContent = 'Sending...';
    status.style.display = 'block';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      status.className = 'form-status ' + (result.ok ? 'success' : 'error');
      status.textContent = result.ok ? '✔ ' + result.message : '✖ ' + result.error;
      if (result.ok) form.reset();
    } catch (err) {
      status.className = 'form-status error';
      status.textContent = '✖ Something went wrong. Please email us directly.';
    }
  });

});