
"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const progressBar = $("#readingProgress");
const menuToggle = $("#menuToggle");
const topNav = $("#topNav");
const miniMapButton = $("#miniMapButton");
const mapModal = $("#mapModal");
const modalClose = $("#modalClose");
const modalGo = $("#modalGo");

function updateReadingProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
}

window.addEventListener("scroll", updateReadingProgress, { passive: true });
window.addEventListener("resize", updateReadingProgress);
updateReadingProgress();

/* Scroll reveal animations */
const revealItems = $$(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -35px 0px"
  });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* Mobile navigation */
if (menuToggle && topNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = topNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$("#topNav a").forEach((link) => {
    link.addEventListener("click", () => {
      topNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* Active section in the side rail */
const sections = $$("main section[id]");
const railLinks = $$(".rail-link");

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      railLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", active);
      });
    });
  }, {
    rootMargin: "-35% 0px -50% 0px",
    threshold: 0
  });

  sections.forEach((section) => sectionObserver.observe(section));
}

/* Animated map modal */
function openMapModal() {
  if (!mapModal) return;
  mapModal.classList.add("open");
  mapModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modalClose?.focus();
}

function closeMapModal() {
  if (!mapModal) return;
  mapModal.classList.remove("open");
  mapModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  miniMapButton?.focus();
}

miniMapButton?.addEventListener("click", openMapModal);
modalClose?.addEventListener("click", closeMapModal);
modalGo?.addEventListener("click", closeMapModal);

mapModal?.addEventListener("click", (event) => {
  if (event.target === mapModal) closeMapModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMapModal();
});

/* Subtle hero parallax — disabled for reduced-motion preferences */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const heroImage = $(".hero-image");

if (heroImage && !reduceMotion.matches) {
  let ticking = false;

  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, window.innerHeight);
      heroImage.style.backgroundPosition = `center ${45 + y * 0.018}%`;
      ticking = false;
    });
  }, { passive: true });
}

/* Keyboard focus helper for modal */
document.addEventListener("keydown", (event) => {
  if (event.key !== "Tab" || !mapModal?.classList.contains("open")) return;

  const focusable = $$("button, a[href]", mapModal)
    .filter((element) => !element.hasAttribute("disabled"));

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
