(function () {
    function setupMoviePlayer(src) {
        var video = document.querySelector("[data-player-video]");
        var cover = document.querySelector("[data-player-button]");
        var hlsInstance = null;
        var ready = false;

        if (!video || !cover || !src) {
            return;
        }

        function activate() {
            if (ready) {
                return Promise.resolve();
            }
            ready = true;
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
            return Promise.resolve();
        }

        function play() {
            cover.classList.add("is-hidden");
            activate().then(function () {
                var result = video.play();
                if (result && typeof result.catch === "function") {
                    result.catch(function () {});
                }
            });
        }

        cover.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!ready || video.paused) {
                play();
            } else {
                video.pause();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
}());
