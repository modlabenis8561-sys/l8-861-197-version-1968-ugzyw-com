(function () {
    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function bindNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobile = document.querySelector("[data-mobile-nav]");
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = mobile.classList.toggle("is-open");
            document.body.classList.toggle("nav-open", open);
        });
    }

    function bindHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }
        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function bindFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        if (!scopes.length) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var year = scope.querySelector("[data-filter-year]");
            var grid = document.querySelector("[data-card-grid]");
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-card]")) : [];
            if (input && queryValue) {
                input.value = queryValue;
            }
            function apply() {
                var keyword = normalize(input ? input.value : "");
                var selectedRegion = normalize(region ? region.value : "");
                var selectedType = normalize(type ? type.value : "");
                var selectedYear = normalize(year ? year.value : "");
                cards.forEach(function (card) {
                    var search = normalize(card.getAttribute("data-search"));
                    var cardRegion = normalize(card.getAttribute("data-region"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var matched = true;
                    if (keyword && search.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (selectedRegion && cardRegion !== selectedRegion) {
                        matched = false;
                    }
                    if (selectedType && cardType !== selectedType) {
                        matched = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        matched = false;
                    }
                    card.hidden = !matched;
                });
            }
            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        bindNavigation();
        bindHero();
        bindFilters();
    });
}());
