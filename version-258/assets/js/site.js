(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function yearMatches(value, year) {
    if (!value || value === "全部年份") {
      return true;
    }
    var number = parseInt(year, 10);
    if (value === "2010-2019") {
      return number >= 2010 && number <= 2019;
    }
    if (value === "2000-2009") {
      return number >= 2000 && number <= 2009;
    }
    if (value === "更早") {
      return number > 0 && number < 2000;
    }
    return String(year).indexOf(value) !== -1;
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var category = panel.querySelector("[data-filter-category]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && input) {
        input.value = query;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedCategory = category ? category.value : "all";
        var selectedType = type ? type.value : "全部类型";
        var selectedYear = year ? year.value : "全部年份";
        cards.forEach(function (card) {
          var searchText = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" ").toLowerCase();
          var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
          var matchCategory = selectedCategory === "all" || card.dataset.category === selectedCategory;
          var matchType = selectedType === "全部类型" || (card.dataset.type || "").indexOf(selectedType) !== -1;
          var matchYear = yearMatches(selectedYear, card.dataset.year || "");
          card.classList.toggle("is-hidden", !(matchKeyword && matchCategory && matchType && matchYear));
        });
      }

      [input, category, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var source = shell.getAttribute("data-src");
      if (!video || !source) {
        return;
      }

      function startPlayback() {
        shell.classList.add("is-playing");
        if (video.dataset.loaded === "true") {
          video.play().catch(function () {});
          return;
        }
        video.dataset.loaded = "true";
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          if (window.Hls.Events && window.Hls.Events.MANIFEST_PARSED) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.addEventListener("loadedmetadata", function () {
              video.play().catch(function () {});
            }, { once: true });
          }
          video.hlsInstance = hls;
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", function () {
            video.play().catch(function () {});
          }, { once: true });
        } else {
          video.src = source;
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
