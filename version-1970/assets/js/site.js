import { H as Hls } from './hls-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function initMobileMenu() {
    const toggle = $('[data-menu-toggle]');
    const panel = $('[data-mobile-panel]');

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', () => {
        panel.classList.toggle('is-open');
        toggle.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
}

function initHero() {
    const hero = $('[data-hero]');

    if (!hero) {
        return;
    }

    const slides = $$('[data-hero-slide]', hero);
    const dots = $$('[data-hero-dot]', hero);
    const prev = $('[data-hero-prev]', hero);
    const next = $('[data-hero-next]', hero);
    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => show(current + 1), 5000);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    prev?.addEventListener('click', () => {
        show(current - 1);
        start();
    });

    next?.addEventListener('click', () => {
        show(current + 1);
        start();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            show(index);
            start();
        });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
}

function initFilters() {
    const panel = $('[data-filter-panel]');
    const grid = $('[data-filter-grid]');

    if (!panel || !grid) {
        return;
    }

    const keywordInput = $('[data-filter-keyword]', panel);
    const regionSelect = $('[data-filter-region]', panel);
    const yearSelect = $('[data-filter-year]', panel);
    const resetButton = $('[data-filter-reset]', panel);
    const counter = $('[data-filter-count]');
    const cards = $$('[data-movie-card]', grid);

    function applyFilter() {
        const keyword = keywordInput.value.trim().toLowerCase();
        const region = regionSelect.value;
        const year = yearSelect.value;
        let visibleCount = 0;

        cards.forEach((card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.year,
                card.dataset.genre,
                card.textContent,
            ].join(' ').toLowerCase();
            const matchesKeyword = !keyword || haystack.includes(keyword);
            const matchesRegion = !region || card.dataset.region === region;
            const matchesYear = !year || card.dataset.year === year;
            const isVisible = matchesKeyword && matchesRegion && matchesYear;

            card.classList.toggle('is-hidden', !isVisible);
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (counter) {
            counter.textContent = `当前显示 ${visibleCount} 部影片`;
        }
    }

    [keywordInput, regionSelect, yearSelect].forEach((control) => {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
    });

    resetButton?.addEventListener('click', () => {
        keywordInput.value = '';
        regionSelect.value = '';
        yearSelect.value = '';
        applyFilter();
    });
}

async function initSearchPage() {
    const results = $('[data-search-results]');
    const status = $('[data-search-status]');
    const input = $('[data-search-input]');

    if (!results || !status) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();

    if (input) {
        input.value = query;
    }

    if (!query) {
        return;
    }

    status.textContent = '正在搜索影片...';

    try {
        const module = await import('./search-data.js');
        const data = module.movies || [];
        const lowerQuery = query.toLowerCase();
        const matched = data.filter((movie) => {
            const text = [
                movie.title,
                movie.region,
                movie.year,
                movie.type,
                movie.genre,
                movie.tags,
                movie.oneLine,
                movie.summary,
            ].join(' ').toLowerCase();
            return text.includes(lowerQuery);
        });

        status.textContent = `搜索“${query}”找到 ${matched.length} 个结果`;
        results.innerHTML = matched.map(renderSearchCard).join('');
    } catch (error) {
        status.textContent = '搜索数据加载失败，请刷新页面重试。';
    }
}

function renderSearchCard(movie) {
    return `
        <article class="movie-card" data-movie-card>
            <a class="poster-link" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
                <img src="${escapeHtml(movie.poster)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                <span class="poster-shade"></span>
                <span class="play-badge">▶</span>
                <span class="rating-badge">★ ${escapeHtml(movie.rating)}</span>
            </a>
            <div class="movie-card-body">
                <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
                <p class="movie-meta">${escapeHtml(movie.region)} · ${escapeHtml(movie.year)} · ${escapeHtml(movie.type)}</p>
                <p class="movie-genre">${escapeHtml(movie.genre)}</p>
                <p class="movie-desc">${escapeHtml(movie.oneLine || movie.summary)}</p>
            </div>
        </article>`;
}

function initPlayers() {
    $$('[data-player]').forEach((player) => {
        const button = $('[data-play-button]', player);
        const video = $('video', player);
        const message = $('[data-player-message]', player);
        const source = player.dataset.hls;
        let hls = null;

        if (!button || !video || !source) {
            return;
        }

        button.addEventListener('click', () => {
            button.classList.add('is-hidden');
            message.textContent = '正在加载播放源...';

            const playVideo = () => {
                const playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {
                        message.textContent = '请再次点击播放器开始播放。';
                    });
                }
            };

            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    message.textContent = '';
                    playVideo();
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        message.textContent = '网络加载异常，正在重试...';
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        message.textContent = '媒体解析异常，正在恢复...';
                        hls.recoverMediaError();
                    } else {
                        message.textContent = '播放源暂时无法加载，请刷新页面重试。';
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', () => {
                    message.textContent = '';
                    playVideo();
                }, { once: true });
            } else {
                message.textContent = '当前浏览器不支持 HLS 播放。';
            }
        });

        window.addEventListener('beforeunload', () => {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
});
