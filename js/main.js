// Укажите два номера с кодом страны, только цифры.
const contacts = [
  { number: '77075167783', display: '+7 707 516 77 83', whatsapp: true },
  { number: '77765800112', display: '+7 776 580 01 12', whatsapp: true },
];
const note = document.querySelector('#contact-note');

// Reveal content once as it enters the viewport; leave it visible without JS.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.hero-copy, .hero-art, .principles > div, .section-heading, .service-grid article, .steps article, .faq > div, .contact, footer');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.04, rootMargin: '0px 0px 40px 0px' });
  targets.forEach((target) => {
    if (target.parentElement.matches('.service-grid, .steps, .principles')) {
      target.style.setProperty('--reveal-delay', `${[...target.parentElement.children].indexOf(target) * 140}ms`);
    }
    target.classList.add('scroll-reveal');
    observer.observe(target);
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      targets.forEach((target) => target.classList.add('is-revealed'));
      observer.disconnect();
    }
  });
}

const carousel = document.querySelector('.hero-carousel');
if (carousel) {
  const slides = [...carousel.querySelectorAll('.carousel-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const pause = carousel.querySelector('.carousel-pause');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let timer;
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && !hovered && !document.hidden && !carousel.contains(document.activeElement)) {
      timer = setTimeout(() => show(current + 1), 5000);
    }
  };
  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].classList.toggle('is-active', i === current);
      dots[i].setAttribute('aria-current', String(i === current));
    });
    schedule();
  };
  const updatePause = () => {
    const icon = pause.querySelector('.ui-icon');
    icon.setAttribute('fill', paused ? 'currentColor' : 'none');
    icon.querySelector('path').setAttribute('d', paused ? 'M8 5v14l11-7Z' : 'M9 5v14M15 5v14');
    pause.setAttribute('aria-pressed', String(paused));
    pause.setAttribute('aria-label', paused ? 'Включить автопрокрутку' : 'Остановить автопрокрутку');
    schedule();
  };
  carousel.querySelector('.carousel-prev').addEventListener('click', () => show(current - 1));
  carousel.querySelector('.carousel-next').addEventListener('click', () => show(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  pause.addEventListener('click', () => { paused = !paused; updatePause(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updatePause(); });
  updatePause();
}
document.querySelectorAll('[data-contact]').forEach((card, index) => {
  const contact = contacts[index];
  const label = card.querySelector('.phone-number');
  if (contact.number) {
    const link = document.createElement('a');
    link.className = label.className;
    link.href = `tel:+${contact.number}`;
    link.textContent = contact.display || `+${contact.number}`;
    label.replaceWith(link);
  }
  const chat = card.querySelector('.chat-number');
  chat.hidden = !contact.whatsapp;
  card.querySelector('.copy-number').addEventListener('click', async () => {
    if (!contact.number) {
      note.textContent = 'Этот номер пока не указан. Добавим его перед публикацией сайта.';
      return;
    }
    try {
      await navigator.clipboard.writeText(`+${contact.number}`);
      note.textContent = 'Номер скопирован. Можно вставить его в телефон или сообщение.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(card.querySelector('.phone-number'));
      selection.removeAllRanges();
      selection.addRange(range);
      note.textContent = 'Номер выделен. Нажмите «Копировать» или Ctrl+C.';
    }
  });
  chat.addEventListener('click', () => {
    if (!contact.number) {
      note.textContent = 'WhatsApp пока не подключён: нужен настоящий номер телефона.';
      return;
    }
    const message = 'Здравствуйте! Нужен эвакуатор. Автомобиль: … Откуда: … Куда: …';
    window.open(`https://wa.me/${contact.number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
});
if (contacts.some(contact => contact.number)) note.textContent = 'Звоните круглосуточно или отправьте сообщение в WhatsApp.';
