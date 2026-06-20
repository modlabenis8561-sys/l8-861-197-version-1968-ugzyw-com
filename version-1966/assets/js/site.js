(function () {
    const mobileToggle = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const prev = document.querySelector('[data-hero-prev]');
    const next = document.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    if (slides.length) {
        showSlide(0);
        startHero();
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });
    }

    const panel = document.getElementById('global-search-panel');
    const forms = Array.from(document.querySelectorAll('[data-search-form]'));

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[match];
        });
    }

    function movieMatches(movie, query) {
        const text = [movie.title, movie.category, movie.year, movie.region, movie.desc, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        return text.indexOf(query) !== -1;
    }

    function renderSearch(query) {
        if (!panel || typeof SITE_MOVIES === 'undefined') {
            return;
        }
        const keyword = query.trim().toLowerCase();
        const results = keyword ? SITE_MOVIES.filter(function (movie) {
            return movieMatches(movie, keyword);
        }).slice(0, 24) : [];
        const items = results.map(function (movie) {
            return '<a class="search-result" href="' + escapeHtml(movie.url) + '">' +
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">' +
                '<div><h3>' + escapeHtml(movie.title) + '</h3>' +
                '<p>' + escapeHtml(movie.desc) + '</p>' +
                '<div class="card-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>★ ' + escapeHtml(movie.rating) + '</span></div></div>' +
                '</a>';
        }).join('');
        panel.hidden = false;
        panel.innerHTML = '<div class="search-panel-inner">' +
            '<div class="search-panel-head"><h2>搜索结果</h2><button class="search-close" type="button" data-search-close>×</button></div>' +
            '<div class="search-results-grid">' + (items || '<p>没有找到相关影片</p>') + '</div>' +
            '</div>';
        const close = panel.querySelector('[data-search-close]');
        if (close) {
            close.addEventListener('click', function () {
                panel.hidden = true;
            });
        }
    }

    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = form.querySelector('[data-search-input]');
            if (input) {
                renderSearch(input.value);
            }
        });
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && panel) {
            panel.hidden = true;
        }
    });

    const grid = document.querySelector('[data-card-grid]');
    const sortButtons = Array.from(document.querySelectorAll('[data-sort]'));
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-tag]'));

    function getCards() {
        if (!grid) {
            return [];
        }
        return Array.from(grid.querySelectorAll('.movie-card'));
    }

    function sortCards(mode) {
        const cards = getCards();
        cards.sort(function (a, b) {
            if (mode === 'views') {
                return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
            }
            if (mode === 'rating') {
                return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
            }
            if (mode === 'year') {
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            }
            return a.dataset.title.localeCompare(b.dataset.title, 'zh-Hans-CN');
        });
        cards.forEach(function (card) {
            grid.appendChild(card);
        });
    }

    sortButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            sortButtons.forEach(function (btn) {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            sortCards(button.dataset.sort);
        });
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const tag = button.dataset.filterTag;
            filterButtons.forEach(function (btn) {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            getCards().forEach(function (card) {
                const tags = card.dataset.tags || '';
                const visible = tag === 'all' || tags.indexOf(tag) !== -1;
                card.classList.toggle('hidden-by-filter', !visible);
            });
        });
    });
})();
