(function () {
    var body = document.body;
    var menuButton = document.querySelector(".menu-toggle");

    if (menuButton) {
        menuButton.addEventListener("click", function () {
            body.classList.toggle("mobile-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-slide") || 0);
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterList = document.querySelector(".filter-list");
    if (filterList) {
        var keywordInput = document.getElementById("filter-keyword");
        var regionSelect = document.getElementById("filter-region");
        var typeSelect = document.getElementById("filter-type");
        var yearSelect = document.getElementById("filter-year");
        var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (keywordInput && query) {
            keywordInput.value = query;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.textContent
            ].join(" "));
        }

        function applyFilters() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);

            cards.forEach(function (card) {
                var text = cardText(card);
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var visible = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (region && cardRegion.indexOf(region) === -1 && text.indexOf(region) === -1) {
                    visible = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    visible = false;
                }
                if (year && cardYear !== year) {
                    visible = false;
                }

                card.hidden = !visible;
            });
        }

        [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
})();
