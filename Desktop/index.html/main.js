const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
menuToggle?.addEventListener('click', () => { const isOpen = mobileMenu.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(isOpen)); mobileMenu.setAttribute('aria-hidden', String(!isOpen)); });
document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', () => { mobileMenu.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false'); mobileMenu.setAttribute('aria-hidden', 'true'); }));
const signupDialog = document.querySelector('.signup-dialog');
document.querySelectorAll('.js-open-dialog, .header-button, .hero .button-dark').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); signupDialog.showModal(); document.querySelector('#signup-name').focus(); }));
document.querySelector('.dialog-close')?.addEventListener('click', () => signupDialog.close());
signupDialog?.addEventListener('click', (event) => { if (event.target === signupDialog) signupDialog.close(); });
const testimonials = [
  ['Appli presents your services with flexible, convenient and composed layouts. You can select your favorite layouts with unlimited customization possibilities. Pixel-perfect details make it feel like it was made just for us.', 'Robert Brown', 'Creative director at Northstar'],
  ['Our team finally has a place where good ideas become clear, beautiful work. Appli gives us the room to move quickly without losing the details.', 'Maya Lewis', 'Founder at Civic Studio'],
  ['The thoughtful tools and calm interface changed the way we work together. We launched a better experience in half the time.', 'Alex Kim', 'Product lead at Vertex']
];
let testimonialIndex = 0;
const quote = document.querySelector('#quote');
const personName = document.querySelector('#person-name');
const personRole = document.querySelector('#person-role');
function changeTestimonial(direction) { testimonialIndex = (testimonialIndex + direction + testimonials.length) % testimonials.length; const current = testimonials[testimonialIndex]; quote.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280 }); quote.textContent = current[0]; personName.textContent = current[1]; personRole.textContent = current[2]; }
document.querySelector('.next')?.addEventListener('click', () => changeTestimonial(1));
document.querySelector('.prev')?.addEventListener('click', () => changeTestimonial(-1));
document.querySelector('.newsletter form')?.addEventListener('submit', (event) => { event.preventDefault(); const button = event.currentTarget.querySelector('button'); button.textContent = '✓'; button.setAttribute('aria-label', 'Subscribed'); });
document.querySelector('.signup-form')?.addEventListener('submit', (event) => { event.preventDefault(); const form = event.currentTarget; form.querySelector('.form-status').textContent = 'Thanks. We will be in touch shortly.'; form.reset(); });
const sectionLinks = [...document.querySelectorAll('.desktop-nav a')];
const sectionObserver = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (!visible) return; sectionLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`)); }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, .25, .6] });
document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
