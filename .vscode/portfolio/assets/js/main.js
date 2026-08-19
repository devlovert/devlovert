function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

const THEME_KEY = "portfolio_theme";

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  setTheme(current === "light" ? "dark" : "light");
}

function initTheme() {
  applyTheme(getPreferredTheme());

  const toggle = qs("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", () => toggleTheme());
  }
}

function setYear() {
  const el = qs("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

function initHeaderElevation() {
  const header = qs(".site-header");
  if (!header) return;

  const update = () => {
    header.setAttribute("data-elevate", window.scrollY > 8 ? "true" : "false");
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initMobileNav() {
  const btn = qs(".nav-toggle");
  const menu = qs(".nav-menu");
  if (!btn || !menu) return;

  const setOpen = (open) => {
    menu.setAttribute("data-open", open ? "true" : "false");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  setOpen(false);

  btn.addEventListener("click", () => {
    const isOpen = menu.getAttribute("data-open") === "true";
    setOpen(!isOpen);
  });

  qsa("a.nav-link", menu).forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (menu.contains(target) || btn.contains(target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function initContactForm() {
  const form = qs("[data-contact-form]");
  const status = qs("[data-form-status]");
  if (!form || !(form instanceof HTMLFormElement) || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (name.length < 2) {
      status.textContent = "Please enter your name (at least 2 characters).";
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "Please enter a valid email address.";
      return;
    }

    if (message.length < 10) {
      status.textContent = "Please enter a message (at least 10 characters).";
      return;
    }

    status.textContent = "Opening your email app…";

    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailto = `mailto:you@example.com?subject=${subject}&body=${body}`;

    window.location.href = mailto;

    setTimeout(() => {
      status.textContent = "If it didn’t open, copy your message and email me at you@example.com.";
    }, 1200);
  });
}

initTheme();
setYear();
initHeaderElevation();
initMobileNav();
initContactForm();

