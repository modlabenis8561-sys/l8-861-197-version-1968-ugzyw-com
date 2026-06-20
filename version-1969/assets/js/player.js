(function () {
  function canPlayNative(video) {
    return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
  }

  function attachVideo(video, url) {
    if (video.dataset.ready === "true") {
      return;
    }

    video.dataset.ready = "true";

    if (canPlayNative(video)) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = url;
  }

  window.SitePlayer = function (options) {
    var video = options.video;
    var button = options.button;
    var overlay = options.overlay;
    var url = options.url;

    if (!video || !url) {
      return;
    }

    function play() {
      attachVideo(video, url);
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
