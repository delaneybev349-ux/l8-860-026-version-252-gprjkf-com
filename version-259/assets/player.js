(function () {
    function startVideo(video, overlay) {
        var source = video.getAttribute('src');
        if (!source) {
            return;
        }
        if (!video.canPlayType('application/vnd.apple.mpegurl') && window.Hls && window.Hls.isSupported()) {
            if (!video.hlsInstance) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            }
        }
        overlay.classList.add('is-hidden');
        video.controls = true;
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    function init() {
        document.querySelectorAll('.player-frame').forEach(function (frame) {
            var video = frame.querySelector('video');
            var overlay = frame.querySelector('.player-overlay');
            if (!video || !overlay) {
                return;
            }
            overlay.addEventListener('click', function () {
                startVideo(video, overlay);
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    startVideo(video, overlay);
                }
            });
            video.addEventListener('play', function () {
                overlay.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    overlay.classList.remove('is-hidden');
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
