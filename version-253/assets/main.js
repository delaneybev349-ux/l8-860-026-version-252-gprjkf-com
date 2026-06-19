(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scopeSelector = panel.getAttribute("data-filter-panel");
            var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
            if (!scope) {
                return;
            }
            var input = panel.querySelector("[data-filter-input]");
            var typeSelect = panel.querySelector("[data-filter-type]");
            var regionSelect = panel.querySelector("[data-filter-region]");
            var yearSelect = panel.querySelector("[data-filter-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            function apply() {
                var query = normalize(input ? input.value : "");
                var typeValue = normalize(typeSelect ? typeSelect.value : "");
                var regionValue = normalize(regionSelect ? regionSelect.value : "");
                var yearValue = normalize(yearSelect ? yearSelect.value : "");
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var type = normalize(card.getAttribute("data-type"));
                    var region = normalize(card.getAttribute("data-region"));
                    var year = normalize(card.getAttribute("data-year"));
                    var match = true;
                    if (query && text.indexOf(query) === -1) {
                        match = false;
                    }
                    if (typeValue && type !== typeValue) {
                        match = false;
                    }
                    if (regionValue && region !== regionValue) {
                        match = false;
                    }
                    if (yearValue && year !== yearValue) {
                        match = false;
                    }
                    card.classList.toggle("hidden-by-filter", !match);
                });
            }
            [input, typeSelect, regionSelect, yearSelect].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
}());
