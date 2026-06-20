(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
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

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var state = {
      query: '',
      type: 'all',
      year: 'all'
    };

    if (!cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var query = normalize(state.query);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okType = state.type === 'all' || type === state.type;
        var okYear = state.year === 'all' || year === state.year;
        card.classList.toggle('is-hidden', !(okQuery && okType && okYear));
      });
    }

    searchInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        state.query = input.value;
        searchInputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        apply();
      });
    });

    panels.forEach(function (panel) {
      panel.addEventListener('click', function (event) {
        var typeButton = event.target.closest('[data-filter-type]');
        var yearButton = event.target.closest('[data-filter-year]');
        if (typeButton) {
          state.type = typeButton.getAttribute('data-filter-type');
          panel.querySelectorAll('[data-filter-type]').forEach(function (button) {
            button.classList.toggle('is-active', button === typeButton);
          });
          apply();
        }
        if (yearButton) {
          state.year = yearButton.getAttribute('data-filter-year');
          panel.querySelectorAll('[data-filter-year]').forEach(function (button) {
            button.classList.toggle('is-active', button === yearButton);
          });
          apply();
        }
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-play-trigger]');
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute('data-stream-url');
      var prepared = false;
      var hls = null;

      function prepare() {
        if (prepared || !streamUrl) {
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        prepare();
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        video.controls = true;
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (!prepared || video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
