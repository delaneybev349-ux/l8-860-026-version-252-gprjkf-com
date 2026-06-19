(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            var open = document.body.classList.toggle("menu-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
        document.querySelectorAll(".main-nav a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("menu-open");
                button.setAttribute("aria-expanded", "false");
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === current);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card="movie"]'));
        if (!cards.length) {
            return;
        }
        var search = document.querySelector(".js-search");
        var type = document.querySelector(".js-filter-type");
        var year = document.querySelector(".js-filter-year");
        var sort = document.querySelector(".js-sort");
        var empty = document.querySelector(".empty-state");
        var container = document.querySelector(".catalog-list");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function matches(card) {
            var query = normalize(search && search.value);
            var selectedType = type && type.value;
            var selectedYear = year && year.value;
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-meta"),
                card.getAttribute("data-tags")
            ].join(" "));
            var typeOk = !selectedType || card.getAttribute("data-type") === selectedType;
            var yearOk = !selectedYear || card.getAttribute("data-year") === selectedYear;
            var queryOk = !query || haystack.indexOf(query) !== -1;
            return typeOk && yearOk && queryOk;
        }

        function applySort(visibleCards) {
            if (!container || !sort) {
                return;
            }
            var mode = sort.value;
            var sorted = visibleCards.slice();
            sorted.sort(function (a, b) {
                if (mode === "year-desc") {
                    return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year")) || Number(a.getAttribute("data-order")) - Number(b.getAttribute("data-order"));
                }
                if (mode === "title-asc") {
                    return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
                }
                return Number(a.getAttribute("data-order")) - Number(b.getAttribute("data-order"));
            });
            sorted.forEach(function (card) {
                container.appendChild(card);
            });
        }

        function update() {
            var visible = [];
            cards.forEach(function (card) {
                var ok = matches(card);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible.push(card);
                }
            });
            applySort(visible);
            if (empty) {
                empty.classList.toggle("is-visible", visible.length === 0);
            }
        }

        [search, type, year, sort].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });
        update();
    }

    onReady(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
