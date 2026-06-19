(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var form = document.querySelector("[data-search-form]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var count = document.querySelector("[data-search-count]");
    if (!form || !cards.length) {
      return;
    }

    function getValue(name) {
      var input = form.querySelector("[name='" + name + "']");
      return input ? input.value.trim().toLowerCase() : "";
    }

    function match(card, keyword, region, type, year) {
      var haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.year
      ].join(" ").toLowerCase();
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okRegion = !region || (card.dataset.region || "").toLowerCase().indexOf(region) !== -1;
      var okType = !type || (card.dataset.type || "").toLowerCase().indexOf(type) !== -1 || (card.dataset.genre || "").toLowerCase().indexOf(type) !== -1;
      var okYear = !year || (card.dataset.year || "").toLowerCase() === year;
      return okKeyword && okRegion && okType && okYear;
    }

    function update() {
      var keyword = getValue("keyword");
      var region = getValue("region");
      var type = getValue("type");
      var year = getValue("year");
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card, keyword, region, type, year);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = "当前匹配 " + visible + " 部影片";
      }
    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();
  });
})();
