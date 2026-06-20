(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var next = slider.querySelector("[data-hero-next]");
      var prev = slider.querySelector("[data-hero-prev]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, position) {
          slide.classList.toggle("is-active", position === current);
          slide.setAttribute("aria-hidden", position === current ? "false" : "true");
        });

        dots.forEach(function (dot, position) {
          dot.classList.toggle("is-active", position === current);
          dot.setAttribute("aria-current", position === current ? "true" : "false");
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

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      dots.forEach(function (dot, position) {
        dot.addEventListener("click", function () {
          show(position);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var filterScope = document.querySelector("[data-filter-scope]");

    if (filterScope) {
      var input = filterScope.querySelector(".filter-input");
      var selects = Array.prototype.slice.call(filterScope.querySelectorAll(".filter-select"));
      var empty = filterScope.querySelector(".empty-state");
      var items = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));

      function applyFilters() {
        var word = normalize(input ? input.value : "");
        var selected = {};
        var visible = 0;

        selects.forEach(function (select) {
          selected[select.getAttribute("data-filter")] = normalize(select.value);
        });

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute("data-title"),
            item.getAttribute("data-region"),
            item.getAttribute("data-year"),
            item.getAttribute("data-type"),
            item.getAttribute("data-genre"),
            item.getAttribute("data-tags"),
            item.textContent
          ].join(" "));

          var matched = !word || haystack.indexOf(word) !== -1;

          Object.keys(selected).forEach(function (key) {
            var value = selected[key];
            if (value) {
              matched = matched && normalize(item.getAttribute("data-" + key)).indexOf(value) !== -1;
            }
          });

          item.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        if (query) {
          input.value = query;
        }

        input.addEventListener("input", applyFilters);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });

      applyFilters();
    }
  });
})();
