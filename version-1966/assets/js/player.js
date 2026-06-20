function initializePlayer(streamUrl) {
    const video = document.getElementById('movie-player');
    const overlay = document.getElementById('player-overlay');
    let attached = false;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function attachStream() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        attachStream();
        overlay.classList.add('is-hidden');
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            overlay.classList.remove('is-hidden');
        }
    });
    video.addEventListener('ended', function () {
        overlay.classList.remove('is-hidden');
    });
}
