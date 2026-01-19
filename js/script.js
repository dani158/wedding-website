const weddingDate = new Date("August 22, 2026 16:00:00").getTime();

const elements = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds"),
};

const animateChange = (el, value) => {
  if (el.textContent !== value.toString()) {
    el.style.transform = "translateY(-6px)";
    el.style.opacity = "0";
    setTimeout(() => {
      el.textContent = value;
      el.style.transform = "translateY(0)";
      el.style.opacity = "1";
    }, 150);
  }
};

const updateCountdown = () => {
  const now = new Date().getTime();
  const diff = weddingDate - now;

  if (diff <= 0) {
    document.getElementById("countdown-wrapper").innerHTML = `
      <p style="font-size:1.4rem; margin-top:2rem;">
        Today is the day! 💍<br>
        <small>We can’t wait to celebrate with you.</small>
      </p>
    `;
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  animateChange(elements.days, days);
  animateChange(elements.hours, hours);
  animateChange(elements.minutes, minutes);
  animateChange(elements.seconds, seconds);
};

updateCountdown();
setInterval(updateCountdown, 1000); // update every second

// Gallery carousel controls (prev/next) and visibility
document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.gallery-carousel');
  const slides = carousel ? Array.from(carousel.querySelectorAll('img')) : [];
  const dotsContainer = document.querySelector('.gallery-dots');
  const btnPrev = document.querySelector('.carousel-btn.prev');
  const btnNext = document.querySelector('.carousel-btn.next');

  if (!carousel || slides.length === 0) return;

  let current = 0;
  const intervalMs = 4000;
  let timer = null;

  const showSlide = (idx) => {
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    current = idx;
    // update dots
    if (dotsContainer) {
      Array.from(dotsContainer.children).forEach((d, i) => d.classList.toggle('active', i === idx));
    }
  };

  const next = () => showSlide((current + 1) % slides.length);
  const prev = () => showSlide((current - 1 + slides.length) % slides.length);

  const startTimer = () => { timer = setInterval(next, intervalMs); };
  const resetTimer = () => { if (timer) clearInterval(timer); startTimer(); };

  if (btnPrev) btnPrev.addEventListener('click', () => { prev(); resetTimer(); });
  if (btnNext) btnNext.addEventListener('click', () => { next(); resetTimer(); });

  // Touch swipe handling (basic)
  let startX = 0;
  carousel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next(); else prev();
      resetTimer();
    }
  });

  // Pause on hover (desktop)
  carousel.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
  carousel.addEventListener('mouseleave', () => { resetTimer(); });

  // initialize
  showSlide(0);
  // create pagination dots
  if (dotsContainer) {
    slides.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.setAttribute('aria-label', `Slide ${i + 1}`);
      btn.addEventListener('click', () => { showSlide(i); resetTimer(); });
      dotsContainer.appendChild(btn);
    });
    // mark first active
    Array.from(dotsContainer.children)[0]?.classList.add('active');
  }
  startTimer();

  // hide arrows when only one slide
  const updateButtons = () => {
    const need = slides.length > 1;
    if (btnPrev) btnPrev.style.display = need ? 'block' : 'none';
    if (btnNext) btnNext.style.display = need ? 'block' : 'none';
  };
  updateButtons();
  window.addEventListener('resize', updateButtons);

  // --- Add to Calendar and Maps handlers ---
  const addToCalBtn = document.getElementById('add-to-calendar');
  const mapsLink = document.getElementById('open-maps');

  if (addToCalBtn) {
    addToCalBtn.addEventListener('click', (e) => {
      // Event details
      const title = 'Kincső & Dani Wedding';
      const location = 'Villa Something, Italy';
      const description = 'Ceremony at 16:00 (local time). We can\'t wait to celebrate with you!';

      // local date/time (assume local timezone)
      const startLocal = new Date(2026, 7, 22, 16, 0, 0); // Month is 0-indexed: 7 = August
      const endLocal = new Date(startLocal.getTime() + 3 * 60 * 60 * 1000); // 3 hour event

      // Helper: format to YYYYMMDDTHHMMSSZ for Google Calendar (UTC)
      const toUTCStringForCalendar = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return d.getUTCFullYear()
          + pad(d.getUTCMonth() + 1)
          + pad(d.getUTCDate()) + 'T'
          + pad(d.getUTCHours())
          + pad(d.getUTCMinutes())
          + pad(d.getUTCSeconds()) + 'Z';
      };

      const startUTC = toUTCStringForCalendar(startLocal);
      const endUTC = toUTCStringForCalendar(endLocal);

      // Google Calendar URL
      const gcUrl = new URL('https://www.google.com/calendar/render');
      gcUrl.searchParams.set('action', 'TEMPLATE');
      gcUrl.searchParams.set('text', title);
      gcUrl.searchParams.set('dates', `${startUTC}/${endUTC}`);
      gcUrl.searchParams.set('details', description);
      gcUrl.searchParams.set('location', location);

      // ICS content for download
      const dtstamp = toUTCStringForCalendar(new Date());
      const uid = `wedding-${Date.now()}@local`;
      const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//WeddingSite//EN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${startUTC}`,
        `DTEND:${endUTC}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ];

      const icsBlob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const icsUrl = URL.createObjectURL(icsBlob);

      // Open Google Calendar in new tab and trigger ICS download
      window.open(gcUrl.toString(), '_blank', 'noopener');
      const a = document.createElement('a');
      a.href = icsUrl;
      a.download = 'kincso-dani-wedding.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(icsUrl), 10000);
    });
  }

  if (mapsLink) {
    // nothing extra needed — link already opens Google Maps in new tab
    mapsLink.addEventListener('click', () => {});
  }

  // --- Fade-in on scroll (reveal) ---
  (function setupRevealOnScroll() {
    const selectors = [
      'section',
      '#countdown-wrapper',
      '.gallery-wrapper',
      '.time-box',
      '#rsvp',
      'footer'
    ];
    const els = Array.from(document.querySelectorAll(selectors.join(',')));
    if (els.length === 0) return;

    els.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      els.forEach(el => obs.observe(el));
    } else {
      // fallback: reveal all
      els.forEach(el => el.classList.add('active'));
    }
  })();

});

