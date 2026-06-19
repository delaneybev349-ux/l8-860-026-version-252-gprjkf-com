(function () {
    function initMobileNav() {
        var button = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
        panel.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                panel.classList.remove('is-open');
            });
        });
    }

    function initHeroSlider() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                play();
            });
        });
        show(0);
        play();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initFilters() {
        var root = document.querySelector('[data-filter-root]');
        var list = document.querySelector('[data-filter-list]');
        if (!root || !list) {
            return;
        }
        var input = root.querySelector('[data-filter-input]');
        var genre = root.querySelector('[data-filter-genre]');
        var year = root.querySelector('[data-filter-year]');
        var type = root.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        function applyFilter() {
            var q = normalize(input && input.value);
            var g = normalize(genre && genre.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (g && normalize(card.getAttribute('data-genre')).indexOf(g) === -1) {
                    ok = false;
                }
                if (y && normalize(card.getAttribute('data-year')) !== y) {
                    ok = false;
                }
                if (t && normalize(card.getAttribute('data-type')).indexOf(t) === -1) {
                    ok = false;
                }
                card.classList.toggle('is-hidden', !ok);
            });
        }
        [input, genre, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    window.setupMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var cover = document.querySelector('.player-cover');
        if (!video || !streamUrl) {
            return;
        }
        var ready = false;
        function bindStream() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            bindStream();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }
        if (cover) {
            cover.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHeroSlider();
        initFilters();
    });
})();
