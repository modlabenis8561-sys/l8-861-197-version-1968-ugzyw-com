(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showHero(activeIndex + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    showHero(0);
    startHero();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var searchInput = filterRoot.querySelector('[data-search-input]');
    var categoryFilter = filterRoot.querySelector('[data-category-filter]');
    var yearFilter = filterRoot.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var category = normalize(categoryFilter ? categoryFilter.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('hidden-by-filter', !matched);
      });
    }

    [searchInput, categoryFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  var playerBlock = document.querySelector('[data-player]');
  if (playerBlock) {
    var video = playerBlock.querySelector('video');
    var overlay = playerBlock.querySelector('.player-overlay');
    var started = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || started) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', function () {
        if (hlsInstance) {
          hlsInstance.stopLoad();
        }
      });
    }
  }
})();
