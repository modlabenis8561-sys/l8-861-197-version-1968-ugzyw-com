(function () {
    window.initStreamPlayer = function (streamUrl) {
        var shell = document.getElementById("movie-player");
        var video = document.getElementById("movie-video");
        var button = shell ? shell.querySelector(".player-poster") : null;
        var hls = null;
        var loaded = false;

        if (!shell || !video || !button || !streamUrl) {
            return;
        }

        function playVideo() {
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        function start() {
            shell.classList.add("is-playing");

            if (loaded) {
                playVideo();
                return;
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal && hls) {
                        hls.destroy();
                        hls = null;
                        video.src = streamUrl;
                        video.load();
                        playVideo();
                    }
                });
                return;
            }

            video.src = streamUrl;
            video.load();
            playVideo();
        }

        button.addEventListener("click", start);
        shell.addEventListener("click", function (event) {
            if (!loaded && event.target === shell) {
                start();
            }
        });
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
    };
})();
