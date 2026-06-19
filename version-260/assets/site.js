
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
  const toggle = $('[data-menu-toggle]');
  const panel = $('[data-mobile-panel]');
  if (!toggle || !panel) {
    return;
  }

  toggle.addEventListener('click', () => {
    panel.classList.toggle('is-open');
  });
}

function initSearchForms() {
  $$('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"], input[type="search"]');
      const query = input ? input.value.trim() : '';
      const base = form.dataset.searchBase || './search.html';
      const target = query ? `${base}?q=${encodeURIComponent(query)}` : base;
      window.location.href = target;
    });
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
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(index + 1), 5200);
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      show(dotIndex);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      show(index - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      show(index + 1);
      restart();
    });
  }

  restart();
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function fillFilterOptions(grid, selector, datasetKey) {
  const select = $(selector);
  if (!grid || !select) {
    return;
  }

  const values = new Set();
  $$('[data-card]', grid).forEach((card) => {
    const raw = card.dataset[datasetKey] || '';
    raw.split(/[,，、/|\s]+/).forEach((value) => {
      const trimmed = value.trim();
      if (trimmed) {
        values.add(trimmed);
      }
    });
  });

  Array.from(values)
    .sort((a, b) => b.localeCompare(a, 'zh-Hans-CN'))
    .slice(0, 80)
    .forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
}

function initFilters() {
  const grid = $('[data-filter-grid]');
  if (!grid) {
    return;
  }

  const input = $('[data-filter-input]');
  const liveSearch = $('[data-live-search]');
  const region = $('[data-filter-region]');
  const year = $('[data-filter-year]');
  const reset = $('[data-filter-reset]');
  const cards = $$('[data-card]', grid);
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  fillFilterOptions(grid, '[data-filter-region]', 'region');
  fillFilterOptions(grid, '[data-filter-year]', 'year');

  if (input && initialQuery) {
    input.value = initialQuery;
  }
  if (liveSearch && initialQuery) {
    liveSearch.value = initialQuery;
  }

  const apply = () => {
    const query = normalize((input && input.value) || (liveSearch && liveSearch.value));
    const regionValue = normalize(region && region.value);
    const yearValue = normalize(year && year.value);

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.type,
      ].join(' '));
      const matchQuery = !query || haystack.includes(query);
      const matchRegion = !regionValue || normalize(card.dataset.region).includes(regionValue);
      const matchYear = !yearValue || normalize(card.dataset.year).includes(yearValue);
      card.hidden = !(matchQuery && matchRegion && matchYear);
    });
  };

  [input, liveSearch, region, year].filter(Boolean).forEach((control) => {
    control.addEventListener('input', apply);
    control.addEventListener('change', apply);
  });

  if (reset) {
    reset.addEventListener('click', () => {
      if (input) input.value = '';
      if (liveSearch) liveSearch.value = '';
      if (region) region.value = '';
      if (year) year.value = '';
      cards.forEach((card) => {
        card.hidden = false;
      });
    });
  }

  apply();
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearchForms();
  initHero();
  initFilters();
});
