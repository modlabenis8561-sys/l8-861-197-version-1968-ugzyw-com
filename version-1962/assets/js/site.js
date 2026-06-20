(function () {
    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (target && target.tagName === 'IMG') {
            target.classList.add('image-missing');
        }
    }, true);

    qsa('.nav-toggle').forEach(function (button) {
        button.addEventListener('click', function () {
            var links = document.querySelector('.nav-links');
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            if (links) {
                links.classList.toggle('is-open');
            }
        });
    });

    qsa('[data-hero]').forEach(function (hero) {
        var slides = qsa('.hero-slide', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        show(0);
        start();
    });

    qsa('[data-filter-form]').forEach(function (form) {
        var scope = form.parentElement ? form.parentElement.querySelector('.filter-scope') : null;
        if (!scope) {
            var section = form.closest('section');
            scope = section ? section.querySelector('.filter-scope') : null;
        }
        if (!scope) {
            scope = document.querySelector('.filter-scope') || document;
        }
        var cards = scope ? qsa('.movie-card, .ranking-card', scope) : [];
        var search = form.querySelector('[data-search-input]');
        var type = form.querySelector('[data-type-filter]');
        var year = form.querySelector('[data-year-filter]');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function apply() {
            var keyword = normalize(search && search.value);
            var typeValue = normalize(type && type.value);
            var yearValue = normalize(year && year.value);
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year')
                ].join(' '));
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okType = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1 || text.indexOf(typeValue) !== -1;
                var okYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                card.classList.toggle('is-hidden-card', !(okKeyword && okType && okYear));
            });
        }

        [search, type, year].forEach(function (input) {
            if (input) {
                input.addEventListener('input', apply);
                input.addEventListener('change', apply);
            }
        });
    });
})();
