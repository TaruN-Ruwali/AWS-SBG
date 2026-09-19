document.addEventListener('DOMContentLoaded', () => {

  // ---- Theme toggle (light/dark) ----
  const themeToggle = document.querySelector('.theme-toggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('sbg-theme');

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else {
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('sbg-theme', 'light');
  }

  // ---- Mouse Move Gradient Tracking ----
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    root.style.setProperty('--mouse-x', `${x}%`);
    root.style.setProperty('--mouse-y', `${y}%`);
  });

  // ---- Team Flip Cards ----
  const teamHighlights = {
    "Vipul Joshi": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>AWS Student Builder Group Leader & Campus Leader</li><li>Building Scalable Solutions to Real World Problems</li><li>Former Google Student Ambassador</li><li>National-Level Hackathon Finalist</li><li>DSA - 200+ Solved</li></ul>",
    "Tarun Ruwali": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>SDE Intern</li><li>Google Cloud Arcade Winner & Mentor</li><li>AWS & GCP (100+ courses completed)</li><li>LeetCode: 250+ Solved (1442+ Rating)</li><li>Secured Rank: 20/590 in AWS JAM</li><li>Hackathon Winner & Full Stack Web Developer</li></ul>",
    "Tapas Mishra": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>LeetCode: 350+ Solved (1710+ Rating)</li><li>Hackathon Winner</li><li>50+ AWS Courses Completed</li><li>MERN Stack Developer</li></ul>",
    "Harshita Padaliya": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>AWS Cloud & DevOps (20+ courses)</li><li>LeetCode: 300+ Solved & DSA</li><li>NASA Space Apps Mentor</li><li>National Hackathon Participant</li><li>Frontend Developer</li></ul>",
    "Sumit Singh Bagdwal": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>Application Developer</li><li>Cloud Data Engineering & Analytics</li><li>Programming: C++, Java, JS</li><li>DSA Proficiency</li><li>Google Cloud Arcade Legend Tier</li></ul>",
    "Harshit Pargain": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>Google Student Ambassador</li><li>Technical Event Coordinator</li><li>Workshop Facilitator</li><li>Campus Leadership & Public Speaking</li></ul>",
    "Karan Bisht": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>AWS AI Practitioner Certified</li><li>Community Growth Strategist</li><li>Campus Branding & Tech Events</li><li>Digital Content Creator (10K+ Reach)</li></ul>",
    "Shubham Singh": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>National Hackathon Finalist 2026</li><li>LeetCode: 200+ Solved</li><li>Secured Rank: 58/590 in AWS JAM</li></ul>",
    "Tanya Chugh": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>Hackathon Participant</li><li>SQL, AI & ChatGPT Certified</li><li>Selected for ARIES Industrial Visit</li><li>Intl. Dance Performer</li></ul>",
    "Rashmi Bora": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>Cloud AI/ML & Generative AI Domain</li><li>Interests: AI/ML, Cloud Computing, Python, DSA</li><li>Projects: Disease Detection System, House Price Prediction, Jarvis AI Assistant</li></ul>",
    "Ronak Mehta": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><li>NASA Space Apps Challenge — Participant</li><li>Interests: AI/ML & Cloud Computing Enthusiast, C++ DSA & Problem Solving</li><li>Projects: AI/ML Project — Exoplanet Detection</li></ul>",
    "Jasmin Kaur": "<ul style='margin:0; padding-left:16px; display:flex; flex-direction:column; gap:4px;'><liAWS Cloud & Technology Enthusiast</li><li>IEEE Summer of Code 2026 — Rank 79</li><li>Adobe University Hackathon — Round 1 Cleared</li><li>Programming: C++, C, Python,DSA & Problem Solving</li><li>⁠Git & GitHub — Udemy Certified</li><li>Projects: DS Explorer Simulator, SOS Connect, Bus Management System</li></ul>"
  };

  document.querySelectorAll('.team-card').forEach(card => {
    const tnameEl = card.querySelector('.tname');
    if (!tnameEl) return;
    const name = tnameEl.textContent.trim();
    const highlight = teamHighlights[name];
    if (highlight) {
      card.classList.add('flip-card');
      const inner = document.createElement('div');
      inner.className = 'flip-card-inner';
      const front = document.createElement('div');
      front.className = 'flip-card-front';
      const back = document.createElement('div');
      back.className = 'flip-card-back';

      while (card.firstChild) {
        front.appendChild(card.firstChild);
      }

      back.innerHTML = `<div class="highlights">${highlight}</div>`;

      const socials = front.querySelector('.socials');
      if (socials) {
        const socialsClone = socials.cloneNode(true);
        socialsClone.style.marginTop = '16px';
        socialsClone.style.justifyContent = 'center';
        back.appendChild(socialsClone);
      }

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      card.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          // Close any other flipped cards
          document.querySelectorAll('.team-card.flip-card.is-flipped').forEach(otherCard => {
            if (otherCard !== card) {
              otherCard.classList.remove('is-flipped');
            }
          });
          // Toggle this card
          card.classList.toggle('is-flipped');
        }
      });
    }
  });

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

  // ---- Event Poster Modal Logic ----
  const eventModal = document.getElementById('event-modal');
  const eventModalClose = document.querySelector('.event-modal-close');

  if (eventModal && eventModalClose) {
    // Check if user has already closed it in this session
    if (!sessionStorage.getItem('sbg-event-modal-closed')) {
      // Show modal after a short delay
      setTimeout(() => {
        eventModal.classList.add('active');
      }, 800);
    }

    const closeEventModal = () => {
      eventModal.classList.remove('active');
      sessionStorage.setItem('sbg-event-modal-closed', 'true');
    };

    eventModalClose.addEventListener('click', closeEventModal);

    // Close on outside click
    eventModal.addEventListener('click', (e) => {
      if (e.target === eventModal) {
        closeEventModal();
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && eventModal.classList.contains('active')) {
        closeEventModal();
      }
    });
  }

});