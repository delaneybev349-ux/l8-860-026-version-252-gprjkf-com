(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('[data-menu-button]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (menuButton && mobileNav) {
            menuButton.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
            var index = 0;
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle('is-active', position === index);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle('is-active', position === index);
                });
            }
            dots.forEach(function (dot, position) {
                dot.addEventListener('click', function () {
                    show(position);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
        });

        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var category = panel.querySelector('[data-filter-category]');
            var type = panel.querySelector('[data-filter-type]');
            var year = panel.querySelector('[data-filter-year]');
            var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
            var items = Array.prototype.slice.call(scope.querySelectorAll('.filter-item'));
            var empty = document.querySelector('[data-empty-state]');
            function currentValue(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }
            function apply() {
                var term = currentValue(input);
                var chosenCategory = currentValue(category);
                var chosenType = currentValue(type);
                var chosenYear = currentValue(year);
                var shown = 0;
                items.forEach(function (item) {
                    var text = (item.getAttribute('data-search') || '').toLowerCase();
                    var matchTerm = !term || text.indexOf(term) !== -1;
                    var matchCategory = !chosenCategory || item.getAttribute('data-category') === chosenCategory;
                    var matchType = !chosenType || item.getAttribute('data-type') === chosenType;
                    var matchYear = !chosenYear || item.getAttribute('data-year') === chosenYear;
                    var visible = matchTerm && matchCategory && matchType && matchYear;
                    item.style.display = visible ? '' : 'none';
                    if (visible) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', shown === 0);
                }
            }
            [input, category, type, year].forEach(function (element) {
                if (element) {
                    element.addEventListener(element.tagName === 'INPUT' ? 'input' : 'change', apply);
                }
            });
            apply();
        });
    });
})();
