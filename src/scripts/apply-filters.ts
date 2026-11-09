import type { Category, District } from '../../shared/taxonomy';
import { filtersFromURL, filtersToQuery, matchesEvent, type EventFilters, type Timeframe } from '../lib/filters';
import { resultLabel } from '../lib/labels';
import type { FilterableEvent } from '../lib/types';

function cardEvent(card: HTMLElement): FilterableEvent {
  return {
    startDate: card.dataset.start || '',
    endDate: card.dataset.end || undefined,
    district: (card.dataset.district || 'Nicosia') as District,
    category: (card.dataset.category || 'Culture & Theatre') as Category,
    searchText: card.dataset.search || '',
  };
}

function readState(): EventFilters {
  return filtersFromURL(new URL(window.location.href));
}

export function initFilters(): void {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-event-card]'));
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('[data-search-input]'));
  const sheet = document.getElementById('filter-sheet');
  const openButton = document.getElementById('open-filters');
  const count = document.getElementById('filter-count');
  let state = readState();

  const setSheet = (open: boolean) => {
    if (!sheet) return;
    sheet.hidden = !open;
    document.body.classList.toggle('overflow-hidden', open);
    if (open) document.getElementById('close-filters')?.focus();
  };

  const syncControls = () => {
    document.querySelectorAll<HTMLElement>('a[data-timeframe]').forEach((link) => {
      link.setAttribute('aria-current', link.dataset.timeframe === state.timeframe ? 'true' : 'false');
    });
    document.querySelectorAll<HTMLElement>('a[data-district]').forEach((link) => {
      link.setAttribute('aria-current', link.dataset.district === state.district ? 'true' : 'false');
    });
    document.querySelectorAll<HTMLElement>('a[data-category]').forEach((link) => {
      link.setAttribute('aria-current', link.dataset.category === state.category ? 'true' : 'false');
    });
    for (const input of inputs) {
      if (document.activeElement !== input) input.value = state.q;
    }
    const active = [state.timeframe, state.district !== 'all', state.category, state.q.trim()].filter(Boolean).length;
    if (count) {
      count.hidden = active === 0;
      count.textContent = active ? String(active) : '';
    }
  };

  const apply = () => {
    let feedCount = 0;
    let featuredCount = 0;
    for (const card of cards) {
      const visible = matchesEvent(cardEvent(card), state);
      card.hidden = !visible;
      if (!visible) continue;
      if (card.dataset.section === 'featured') featuredCount += 1;
      if (card.dataset.section === 'feed') feedCount += 1;
    }
    const featured = document.getElementById('featured-section');
    if (featured) featured.hidden = featuredCount === 0;
    const empty = document.getElementById('feed-empty');
    if (empty) empty.hidden = feedCount !== 0;
    const result = document.getElementById('result-count');
    if (result) result.textContent = resultLabel(feedCount);
    syncControls();
    const next = filtersToQuery(state);
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== next) history.replaceState(null, '', next);
  };

  document.querySelectorAll<HTMLAnchorElement>('a[data-timeframe]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const value = link.dataset.timeframe as Timeframe;
      state = { ...state, timeframe: state.timeframe === value ? null : value };
      apply();
    });
  });

  document.querySelectorAll<HTMLAnchorElement>('a[data-district]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const value = (link.dataset.district || 'all') as District | 'all';
      state = { ...state, district: state.district === value ? 'all' : value };
      apply();
    });
  });

  document.querySelectorAll<HTMLAnchorElement>('a[data-category]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const value = link.dataset.category as Category;
      state = { ...state, category: state.category === value ? null : value };
      apply();
    });
  });

  for (const input of inputs) {
    input.addEventListener('input', () => {
      state = { ...state, q: input.value };
      for (const other of inputs) {
        if (other !== input) other.value = input.value;
      }
      apply();
    });
  }

  document.querySelectorAll<HTMLFormElement>('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      apply();
    });
  });

  const fab = document.getElementById('filter-fab');
  const mobileFilters = document.getElementById('mobile-filter-row');
  if (fab && mobileFilters && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        fab.hidden = entry.isIntersecting;
      },
      { threshold: 0.15 },
    );
    observer.observe(mobileFilters);
  }

  openButton?.addEventListener('click', () => setSheet(true));
  document.querySelectorAll<HTMLElement>('[data-close-sheet]').forEach((button) => {
    button.addEventListener('click', () => setSheet(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && sheet && !sheet.hidden) setSheet(false);
  });

  const scroller = document.getElementById('featured-scroller');
  document.getElementById('featured-prev')?.addEventListener('click', () => {
    scroller?.scrollBy({ left: -340, behavior: 'smooth' });
  });
  document.getElementById('featured-next')?.addEventListener('click', () => {
    scroller?.scrollBy({ left: 340, behavior: 'smooth' });
  });

  apply();
}
