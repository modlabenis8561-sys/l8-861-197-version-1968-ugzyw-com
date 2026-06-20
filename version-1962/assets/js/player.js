(function () {
    function initPlayer(box) {
        var source = box.getAttribute('data-src');
        var video = box.querySelector('video');
        var layer = box.querySelector('.play-layer');
        var hls = null;
        var ready = false;

        function attach() {
            if (!source || !video || ready) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    maxBufferLength: 30
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }
            ready = true;
        }

        function play(event) {
            if (event) {
                event.preventDefault();
            }
            attach();
            if (layer) {
                layer.classList.add('is-hidden');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (!video) {
            return;
        }
        if (layer) {
            layer.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
