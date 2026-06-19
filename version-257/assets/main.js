const MovieSite = (() => {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    let active = 0;
    let timer = null;
    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("is-active", i === active));
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
    };
    const start = () => {
      timer = window.setInterval(() => show(active + 1), 5000);
    };
    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        show(index);
        restart();
      });
    });
    start();
  }

  function initFilters() {
    const input = document.querySelector("[data-search-input]");
    const year = document.querySelector("[data-year-filter]");
    const scope = document.querySelector("[data-filter-scope]");
    if (!scope || (!input && !year)) {
      return;
    }
    const items = Array.from(scope.querySelectorAll(".movie-card, .rank-item"));
    const apply = () => {
      const keyword = input ? input.value.trim().toLowerCase() : "";
      const selectedYear = year ? year.value : "";
      items.forEach((item) => {
        const haystack = `${item.dataset.title || ""} ${item.dataset.text || ""}`.toLowerCase();
        const passKeyword = !keyword || haystack.includes(keyword);
        const passYear = !selectedYear || item.dataset.year === selectedYear;
        item.classList.toggle("is-hidden", !(passKeyword && passYear));
      });
    };
    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
  }

  function initImages() {
    document.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        img.classList.add("image-off");
      }, { once: true });
    });
  }

  function initPlayer(source) {
    const video = document.getElementById("moviePlayer");
    const button = document.querySelector("[data-play-button]");
    const shell = document.querySelector("[data-player-shell]");
    if (!video || !source) {
      return;
    }
    let prepared = false;
    const prepare = () => {
      if (prepared) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      prepared = true;
    };
    const start = (event) => {
      if (event) {
        event.preventDefault();
      }
      prepare();
      if (button) {
        button.classList.add("is-hidden");
      }
      video.controls = true;
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    };
    if (button) {
      button.addEventListener("click", start);
    }
    if (shell) {
      shell.addEventListener("click", (event) => {
        if (event.target === video || event.target.closest("button")) {
          return;
        }
        start(event);
      });
    }
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });
  }

  ready(() => {
    initNav();
    initHero();
    initFilters();
    initImages();
  });

  return {
    initPlayer
  };
})();

window.MovieSite = MovieSite;
