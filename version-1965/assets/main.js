(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var button = document.querySelector(".nav-toggle");
    if (!button) {
      return;
    }
    button.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".site-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var previous = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === active);
      });
    }

    function move(step) {
      show(active + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupSearchRedirect() {
    document.querySelectorAll("[data-search-redirect]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-movie-filter]"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-category-select]"));
    var query = new URLSearchParams(window.location.search).get("q") || "";

    inputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
    });

    function apply(scopeSelector) {
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-text]"));
      var relatedInput = inputs.find(function (input) {
        return input.getAttribute("data-movie-filter") === scopeSelector;
      });
      var relatedSelect = selects.find(function (select) {
        return select.getAttribute("data-category-select") === scopeSelector;
      });
      var keyword = normalize(relatedInput ? relatedInput.value : "");
      var category = normalize(relatedSelect ? relatedSelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search-text"));
        var genre = normalize(card.getAttribute("data-genre"));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchCategory = !category || genre.indexOf(category) !== -1 || text.indexOf(category) !== -1;
        var match = matchKeyword && matchCategory;
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });

      var empty = scope.parentElement ? scope.parentElement.querySelector(".empty-state") : null;
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    inputs.forEach(function (input) {
      var selector = input.getAttribute("data-movie-filter") || "body";
      input.addEventListener("input", function () {
        apply(selector);
      });
      apply(selector);
    });

    selects.forEach(function (select) {
      var selector = select.getAttribute("data-category-select") || "body";
      select.addEventListener("change", function () {
        apply(selector);
      });
      apply(selector);
    });
  }

  ready(function () {
    setupNavigation();
    setupHeroSlider();
    setupSearchRedirect();
    setupFilters();
  });
})();

window.initStaticMoviePlayer = function (playerId, streamUrl) {
  var shell = document.getElementById(playerId);
  if (!shell) {
    return;
  }
  var video = shell.querySelector("video");
  var cover = shell.querySelector(".player-cover");
  var started = false;
  var hlsInstance = null;

  function bindStream() {
    if (started || !video) {
      return;
    }
    started = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    bindStream();
    shell.classList.add("is-playing");
    video.setAttribute("controls", "controls");
    var request = video.play();
    if (request && typeof request.catch === "function") {
      request.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
  }
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
};
