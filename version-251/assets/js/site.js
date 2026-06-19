import { H as Hls } from "./hls-vendor.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupNavigation() {
  const toggle = $("[data-menu-toggle]");
  const nav = $("[data-mobile-nav]");
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    document.body.classList.toggle("nav-open", nav.classList.contains("open"));
  });
}

function setupHero() {
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dot");
  if (!slides.length) {
    return;
  }
  let index = slides.findIndex((slide) => slide.classList.contains("active"));
  if (index < 0) {
    index = 0;
    slides[0].classList.add("active");
  }
  const show = (next) => {
    slides[index].classList.remove("active");
    if (dots[index]) {
      dots[index].classList.remove("active");
    }
    index = (next + slides.length) % slides.length;
    slides[index].classList.add("active");
    if (dots[index]) {
      dots[index].classList.add("active");
    }
  };
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => show(dotIndex));
  });
  window.setInterval(() => show(index + 1), 5600);
}

function setupFilters() {
  const grid = $("[data-filter-grid]");
  if (!grid) {
    return;
  }
  const cards = $$(".movie-card", grid);
  const input = $("[data-filter-input]");
  const buttons = $$("[data-filter-button]");
  const empty = $("[data-no-results]");
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q") || "";
  const active = new Map();

  if (input && initial) {
    input.value = initial;
  }

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const matchesCard = (card) => {
    const query = normalize(input ? input.value : "");
    if (query) {
      const text = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags
      ].join(" "));
      if (!text.includes(query)) {
        return false;
      }
    }
    for (const [key, value] of active.entries()) {
      if (normalize(card.dataset[key]) !== normalize(value)) {
        return false;
      }
    }
    return true;
  };

  const apply = () => {
    let visible = 0;
    cards.forEach((card) => {
      const ok = matchesCard(card);
      card.style.display = ok ? "" : "none";
      if (ok) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  };

  if (input) {
    input.addEventListener("input", apply);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.filterKey;
      const value = button.dataset.filterValue;
      if (!key || !value) {
        active.clear();
        buttons.forEach((item) => item.classList.remove("active"));
        apply();
        return;
      }
      const isActive = button.classList.contains("active");
      buttons.filter((item) => item.dataset.filterKey === key).forEach((item) => item.classList.remove("active"));
      if (isActive) {
        active.delete(key);
      } else {
        active.set(key, value);
        button.classList.add("active");
      }
      apply();
    });
  });

  apply();
}

function setupPlayers() {
  const players = $$("video[data-stream]");
  players.forEach((video) => {
    const shell = video.closest("[data-player-shell]");
    const button = shell ? $("[data-play-button]", shell) : null;
    const url = video.dataset.stream;
    let ready = false;

    const attach = () => {
      if (ready || !url) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = url;
      }
    };

    const play = () => {
      attach();
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {});
      }
    };

    video.addEventListener("play", () => {
      if (shell) {
        shell.classList.add("is-playing");
      }
    });
    video.addEventListener("pause", () => {
      if (shell) {
        shell.classList.remove("is-playing");
      }
    });
    video.addEventListener("ended", () => {
      if (shell) {
        shell.classList.remove("is-playing");
      }
    });
    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });
    if (button) {
      button.addEventListener("click", play);
    }
    attach();
  });
}

function setupForms() {
  $$("form[action='./search.html']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = "./search.html";
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupHero();
  setupFilters();
  setupPlayers();
  setupForms();
});
