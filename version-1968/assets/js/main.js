(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('.site-search-form'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('.filter-grid'));
    grids.forEach(function (grid) {
      var section = grid.closest('.content-section') || document;
      var input = section.querySelector('.filter-input');
      var select = section.querySelector('.filter-select');
      var items = Array.prototype.slice.call(grid.children);

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var year = select ? select.value : '';
        var visible = 0;
        items.forEach(function (item) {
          if (item.classList.contains('empty-state')) {
            return;
          }
          var haystack = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-year'),
            item.getAttribute('data-region'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-type')
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || item.getAttribute('data-year') === year;
          var show = matchKeyword && matchYear;
          item.classList.toggle('is-hidden-by-filter', !show);
          if (show) {
            visible += 1;
          }
        });
        var empty = grid.querySelector('.empty-state');
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.textContent = '没有找到匹配的影片';
          grid.appendChild(empty);
        }
        empty.style.display = visible ? 'none' : 'block';
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (select) {
        select.addEventListener('change', apply);
      }
      apply();
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(movie.link) + '" class="card-link">',
      '<div class="poster-frame">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<div class="poster-glow">▶</div>',
      '</div>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h2>' + escapeHtml(movie.title) + '</h2>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-tags">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('pageSearchInput');
    var title = document.getElementById('searchTitle');
    if (!results || !input || !Array.isArray(window.SiteMovieIndex)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function render(value) {
      var keyword = normalize(value);
      if (!keyword) {
        title.textContent = '精选推荐';
        return;
      }
      var matches = window.SiteMovieIndex.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' ')
        ].join(' '));
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);
      title.textContent = '搜索结果';
      if (!matches.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配的影片</div>';
        return;
      }
      results.innerHTML = matches.map(movieCard).join('');
    }

    input.addEventListener('input', function () {
      render(input.value);
    });
    render(query);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('.player-cover');
      var stream = player.getAttribute('data-stream');
      var hls = null;
      var loaded = false;

      function start() {
        if (!video || !stream) {
          return;
        }
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (!loaded) {
          loaded = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              var parsedPlay = video.play();
              if (parsedPlay && typeof parsedPlay.catch === 'function') {
                parsedPlay.catch(function () {});
              }
            });
          } else {
            video.src = stream;
          }
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
