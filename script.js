/* ============================================================
   OM DENTAL CLINIC — script.js
   Vanilla JS. No frameworks, no backend.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page loader ---------- */
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => loader && loader.classList.add('is-hidden'), 300);
  });
  // Fallback in case 'load' already fired
  setTimeout(() => loader && loader.classList.add('is-hidden'), 2000);

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('is-visible', y > 600);
    updateActiveNav();
  };


  scrollTopBtn && scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  const navScrim = document.getElementById('navScrim');

  function closeMobileNav() {
    navToggle && navToggle.classList.remove('is-open');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
    mobileNav && mobileNav.classList.remove('is-open');
    navScrim && navScrim.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function openMobileNav() {
    navToggle && navToggle.classList.add('is-open');
    navToggle && navToggle.setAttribute('aria-expanded', 'true');
    mobileNav && mobileNav.classList.add('is-open');
    navScrim && navScrim.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  navToggle && navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.contains('is-open');
    isOpen ? closeMobileNav() : openMobileNav();
  });
  navScrim && navScrim.addEventListener('click', closeMobileNav);
  document.querySelectorAll('#mobileNav a').forEach(a => a.addEventListener('click', closeMobileNav));

  /* ---------- Active menu highlight ---------- */
  const navAnchors = document.querySelectorAll('a[data-nav]');
  const sections = Array.from(navAnchors)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function updateActiveNav() {
    let currentId = null;
    const scrollPos = window.scrollY + 140;
    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
    });
  }
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(open => {
        if (open !== item) {
          open.classList.remove('is-open');
          open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          open.querySelector('.faq-answer').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('is-open');
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById('reviewsTrack');
  const dotsWrap = document.getElementById('reviewDots');
  const prevBtn = document.getElementById('prevReview');
  const nextBtn = document.getElementById('nextReview');

  if (track) {
    const cards = Array.from(track.children);
    let perView = window.innerWidth >= 820 ? 3 : 1;
    let index = 0;

    function maxIndex() {
      return Math.max(0, cards.length - perView);
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      const total = maxIndex() + 1;
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === index ? ' is-active' : '');
        dot.setAttribute('aria-label', `Go to review slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function update() {
      const cardWidth = cards[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${index * cardWidth}px)`;
      Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle('is-active', i === index));
    }

    function goTo(i) {
      index = Math.min(Math.max(i, 0), maxIndex());
      update();
    }

    prevBtn && prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn && nextBtn.addEventListener('click', () => goTo(index + 1));

    let autoplay = setInterval(() => {
      goTo(index + 1 > maxIndex() ? 0 : index + 1);
    }, 5000);
    [prevBtn, nextBtn].forEach(btn => btn && btn.addEventListener('click', () => {
      clearInterval(autoplay);
      autoplay = setInterval(() => goTo(index + 1 > maxIndex() ? 0 : index + 1), 5000);
    }));

    window.addEventListener('resize', () => {
      perView = window.innerWidth >= 820 ? 3 : 1;
      index = Math.min(index, maxIndex());
      buildDots();
      update();
    });

    buildDots();
    update();
  }

  /* ---------- Appointment form validation + EmailJS ---------- */
  const form = document.getElementById('appointmentForm');
  const apptCard = document.getElementById('apptCard');
  const successPanel = document.getElementById('successPanel');
  const submitBtn = document.getElementById('submitBtn');
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwLdWgLBS6Dllo1X5KNgGdEvoN9yhduAa0GPJh45OVjaWY_Z1VEpL-LxZ8Z2svMnLSPNA/exec";

  // EmailJS placeholders — replace with your real EmailJS account values.
  // 1. Sign up at https://www.emailjs.com
  // 2. Create an email service + template, then paste the IDs below.
  // 3. Include the EmailJS SDK script tag in index.html <head>:
  //    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';
  const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';

  function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`err-${fieldId}`);
    if (field) field.closest('.field').classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  }
  function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorEl = document.getElementById(`err-${fieldId}`);
    if (field) field.closest('.field').classList.remove('has-error');
    if (errorEl) errorEl.textContent = '';
  }
  function clearAllErrors() {
    ['fullName', 'phone', 'email', 'treatment', 'prefDate', 'prefTime'].forEach(clearError);
  }

  function validateForm(data) {
    let valid = true;
    clearAllErrors();

    if (!data.fullName || data.fullName.trim().length < 2) {
      showError('fullName', 'Please enter your full name.');
      valid = false;
    }
    const phoneDigits = (data.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      showError('phone', 'Enter a valid 10-digit mobile number.');
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) {
      showError('email', 'Enter a valid email address.');
      valid = false;
    }
    if (!data.treatment) {
      showError('treatment', 'Please select a treatment.');
      valid = false;
    }
    if (!data.prefDate) {
      showError('prefDate', 'Please choose a preferred date.');
      valid = false;
    }
    if (!data.prefTime) {
      showError('prefTime', 'Please choose a preferred time.');
      valid = false;
    }
    return valid;
  }

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      fullName: form.fullName.value,
      phone: form.phone.value,
      email: form.email.value,
      treatment: form.treatment.value,
      prefDate: form.prefDate.value,
      prefTime: form.prefTime.value,
      message: form.message.value,
    };

    if (!validateForm(data)) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';

    function onSuccess() {
      apptCard.classList.add('is-success');
      successPanel.classList.add('is-visible');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-regular fa-calendar-check"></i> Book Appointment';
    }

    function onError(err) {
      console.error('EmailJS send failed:', err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-regular fa-calendar-check"></i> Book Appointment';
      alert('Something went wrong sending your request. Please call us directly at +91 76781 04886.');
    }

    const formData = new FormData();

formData.append("fullName", data.fullName);
formData.append("phone", data.phone);
formData.append("email", data.email);
formData.append("treatment", data.treatment);
formData.append("prefDate", data.prefDate);
formData.append("prefTime", data.prefTime);
formData.append("message", data.message);

fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    body: formData
})
.then(res => res.text())
.then(() => {
    onSuccess();
})
.catch(onError);
  });

  ['fullName','phone','email','treatment','prefDate','prefTime'].forEach(id => {
    const field = document.getElementById(id);
    field && field.addEventListener('input', () => clearError(id));
  });

  /* ---------- Exit intent popup ---------- */
  const exitPopup = document.getElementById('exitPopup');
  const exitPopupClose = document.getElementById('exitPopupClose');
  let exitShown = sessionStorage.getItem('omDentalExitShown') === 'true';

  function openExitPopup() {
    if (exitShown) return;
    exitPopup.classList.add('is-open');
    exitShown = true;
    sessionStorage.setItem('omDentalExitShown', 'true');
  }
  function closeExitPopup() {
    exitPopup.classList.remove('is-open');
  }

  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget && e.clientY < 10) openExitPopup();
  });
  exitPopupClose && exitPopupClose.addEventListener('click', closeExitPopup);
  exitPopup && exitPopup.addEventListener('click', (e) => {
    if (e.target === exitPopup) closeExitPopup();
  });
  document.getElementById('exitPopupCta') && document.getElementById('exitPopupCta').addEventListener('click', closeExitPopup);

  // Mobile fallback: show once after a delay of inactivity/scroll depth
  if ('ontouchstart' in window) {
    setTimeout(() => {
      if (window.scrollY > document.body.scrollHeight * 0.5) openExitPopup();
    }, 30000);
  }

  /* ---------- Smooth scroll offset correction for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = 84;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

});
