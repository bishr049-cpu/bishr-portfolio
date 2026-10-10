/* ============================================================
   Muhammed Bishr — Interactive 3D Portfolio Logic (script.js)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Year update
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 3. Theme switch
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');
  const storedTheme = localStorage.getItem('mb-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', storedTheme || (prefersDark ? 'dark' : 'light'));

  if (themeBtn) themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('mb-theme', next);
  });

  // 4. Custom Cursor Physics & Modes
  const trailing = document.getElementById('cursorTrailing');
  const dot = document.getElementById('cursorDot');
  const label = document.getElementById('cursorLabel');
  let cursorX = -100, cursorY = -100;
  let trailX = -100, trailY = -100;
  let currentStyle = localStorage.getItem('mb-cursor-style') || 'orb';

  function applyCursorStyle(st) {
    currentStyle = st;
    localStorage.setItem('mb-cursor-style', st);
    document.body.className = `has-custom-cursor cursor-style-${st}`;
    document.querySelectorAll('.dock-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-style') === st);
    });
  }
  window.setCursorStyle = (st) => {
    applyCursorStyle(st);
  };
  applyCursorStyle(currentStyle);

  if (!window.matchMedia('(pointer: coarse)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      dot.style.left = `${cursorX}px`;
      dot.style.top = `${cursorY}px`;

      const interactive = e.target.closest('a, button, [data-cursor], .card-tilt');
      if (interactive) {
        trailing.classList.add('active');
        const customText = interactive.getAttribute('data-cursor');
        label.textContent = customText || '';
      } else {
        trailing.classList.remove('active');
        label.textContent = '';
      }
    });

    function loopTrail() {
      trailX += (cursorX - trailX) * 0.2;
      trailY += (cursorY - trailY) * 0.2;
      trailing.style.left = `${trailX}px`;
      trailing.style.top = `${trailY}px`;
      requestAnimationFrame(loopTrail);
    }
    requestAnimationFrame(loopTrail);
  }

  // 5. 3D Tilt Cards Effect
  document.querySelectorAll('.card-tilt').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotX = (y / (rect.height / 2)) * -10;
      const rotY = (x / (rect.width / 2)) * 10;
      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // 6. Interactive 3D Canvas (Orbital Nodes)
  const canvas = document.getElementById('threeCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 800,
      });
    }

    let angle = 0;
    function renderCanvas() {
      angle += 0.002;
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height * 0.45;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      particles.forEach((p) => {
        const rotX = p.x * cosA - p.z * sinA;
        const rotZ = p.z * cosA + p.x * sinA + 600;
        if (rotZ > 20) {
          const scale = 400 / rotZ;
          const px = cx + rotX * scale;
          const py = cy + p.y * scale;
          ctx.fillStyle = 'rgba(96, 165, 250, 0.45)';
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1, 2 * scale), 0, Math.PI * 2);
          ctx.fill();
        }
      });
      requestAnimationFrame(renderCanvas);
    }
    requestAnimationFrame(renderCanvas);
  }

  // 7. Sticky Nav and Mobile Menu
  const nav = document.getElementById('mainNav');
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  if (nav) window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  if (menuBtn) menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // 8. Gallery Carousel Buttons
  const slider = document.getElementById('galleryViewport');
  document.getElementById('galPrev').addEventListener('click', () => {
    slider.scrollBy({ left: -320, behavior: 'smooth' });
  });
  document.getElementById('galNext').addEventListener('click', () => {
    slider.scrollBy({ left: 320, behavior: 'smooth' });
  });

  // 9. Certificate Inspection Modal (shows the certificate image; Esc closes it)
  const certModal = document.getElementById('certModal');
  const certImg = document.getElementById('certModalImg');
  let certOpener = null;

  window.openCert = (title, field, issuer, imgSrc) => {
    if (!certModal) return true;   // popup missing: let the link open the image normally
    document.getElementById('certModalTitle').textContent = title;
    document.getElementById('certModalField').textContent = field;
    document.getElementById('certModalIssuer').textContent = `Accredited by: ${issuer}`;
    if (certImg) {
      if (imgSrc) {
        certImg.src = imgSrc;
        certImg.alt = title;
        certImg.hidden = false;
      } else {
        certImg.hidden = true;
      }
    }
    const certLink = document.getElementById('certModalLink');
    if (certLink) certLink.href = imgSrc || '#';
    certOpener = document.activeElement;
    certModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const closeBtn = certModal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
    return false;                  // stops the link from navigating to the raw image
  };

  window.closeCert = () => {
    if (!certModal) return;
    certModal.classList.remove('open');
    document.body.style.overflow = '';
    if (certOpener && certOpener.focus) certOpener.focus();
    certOpener = null;
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal && certModal.classList.contains('open')) {
      window.closeCert();
    }
  });

  // 10. Web Speech Audio Pronunciation
  window.speakText = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      window.speechSynthesis.speak(utt);
    }
  };

  // 11. Formspree Contact Handling
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      formNote.textContent = 'Transmitting message...';
      try {
        const res = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          formNote.textContent = 'Thank you! Your message was transmitted successfully.';
          contactForm.reset();
        } else {
          formNote.textContent = 'Error sending message. Please email bishrpottikkallu@gmail.com directly.';
        }
      } catch (err) {
        formNote.textContent = 'Error sending message. Please email bishrpottikkallu@gmail.com directly.';
      }
    });
  }

  // 12. Typed.js intro animation (kept last, and wrapped so it can never break the rest)
  try {
    const typeIt = (selector, text, next) => {
      new Typed(selector, {
        strings: [text],
        typeSpeed: 80,
        showCursor: false,
        onComplete: next
      });
    };

    const startRoles = () => {
      if (!document.querySelector('.text')) return;
      new Typed('.text', {
        strings: ['Vibe Coder', 'Web Developer'],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true
      });
    };

    typeIt('.hero-hi', "Hi, It's Me", () => {
      typeIt('.hero-im', "I'm&nbsp;", () => {
        typeIt('.hero-name', 'Bishr', startRoles);
      });
    });
  } catch (err) {
    console.error('Typed animation failed:', err);
  }
});