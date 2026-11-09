type ReelItem = {
  name: string;
  place: string;
  year: string;
  image: string;
  href: string;
};

const MOVE_MS = 1000;
const HOLD_MS = 1200;
const RESUME_MS = 3000;

function mod(value: number, count: number): number {
  return ((value % count) + count) % count;
}

function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function grey(distance: number): string {
  const t = clamp(Math.abs(distance) / 1.65, 0, 1);
  const channel = Math.round(17 + t * (214 - 17));
  return `rgb(${channel} ${channel} ${channel})`;
}

export function initReel(root: HTMLElement): void {
  const raw = root.dataset.items;
  if (!raw) return;
  const items = JSON.parse(raw) as ReelItem[];
  const count = items.length;
  if (!count) return;

  const frame = root.querySelector<HTMLElement>('[data-reel-frame]');
  const nameTrack = root.querySelector<HTMLElement>('[data-name-track]');
  const mediaTrack = root.querySelector<HTMLElement>('[data-media-track]');
  const counter = root.querySelector<HTMLElement>('[data-reel-count]');
  if (!frame || !nameTrack || !mediaTrack || !counter) return;

  const copyCount = new Set(
    [...nameTrack.querySelectorAll<HTMLElement>('[data-copy]')].map((node) => node.dataset.copy),
  ).size;
  const loopStart = Math.floor(copyCount / 2) * count;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let position = loopStart;
  let pointerId: number | null = null;
  let pointerY = 0;
  let pointerAt = 0;
  let dragOrigin = loopStart;
  let dragging = false;
  let moved = false;
  let velocity = 0;
  let anim: { from: number; to: number; start: number } | null = null;
  let holdUntil = 0;
  let resumeAt = 0;
  let autoplay = !reduced;
  let hovering = false;
  let wheelTimer = 0;
  let nameStride = 46;
  let mediaStride = 220;

  const measure = () => {
    const frameHeight = frame.getBoundingClientRect().height;
    const gap = window.innerWidth < 720 ? 8 : 12;
    mediaStride = (frameHeight - gap * 2) / 3 + gap;
    nameStride = window.innerWidth < 800 ? 34 : window.innerWidth >= 1100 ? 46 : 44;
    root.style.setProperty('--media-stride', `${mediaStride}px`);
    root.style.setProperty('--name-stride', `${nameStride}px`);
  };

  const shiftFor = (pos: number, stride: number) => (pos + 0.5) * stride;

  const rebase = () => {
    const max = loopStart + count;
    while (position >= max) {
      position -= count;
      dragOrigin -= count;
      if (anim) {
        anim.from -= count;
        anim.to -= count;
      }
    }
    while (position < loopStart) {
      position += count;
      dragOrigin += count;
      if (anim) {
        anim.from += count;
        anim.to += count;
      }
    }
  };

  const paintNames = () => {
    const trackShift = shiftFor(position, nameStride);
    nameTrack.style.transform = `translate3d(0, ${-trackShift}px, 0)`;
    nameTrack.querySelectorAll<HTMLButtonElement>('[data-i]').forEach((button) => {
      const copy = Number(button.dataset.copy);
      const index = Number(button.dataset.i);
      const center = (copy * count + index) * nameStride + nameStride / 2;
      const distance = (center - trackShift) / nameStride;
      button.style.color = grey(distance);
      const meta = button.querySelector<HTMLElement>('[data-meta]');
      if (meta) {
        const near = Math.abs(distance) < 0.72;
        meta.style.opacity = near ? String(1 - Math.abs(distance) / 0.72) : '0';
      }
    });
  };

  const paintMedia = () => {
    const trackShift = shiftFor(position, mediaStride);
    mediaTrack.style.transform = `translate3d(0, ${-trackShift}px, 0)`;
    mediaTrack.querySelectorAll<HTMLElement>('[data-i]').forEach((card) => {
      const copy = Number(card.dataset.copy);
      const index = Number(card.dataset.i);
      const center = (copy * count + index) * mediaStride + mediaStride / 2;
      const distance = (center - trackShift) / mediaStride;
      card.classList.toggle('is-live', Math.abs(distance) < 0.35 && !dragging && !anim);
    });
  };

  const paint = () => {
    const selected = mod(Math.round(position), count);
    counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
    paintNames();
    paintMedia();
  };

  const animateTo = (target: number) => {
    if (reduced) {
      position = target;
      anim = null;
      paint();
      return;
    }
    anim = { from: position, to: target, start: performance.now() };
  };

  const stopAutoplay = () => {
    autoplay = false;
    resumeAt = performance.now() + RESUME_MS;
  };

  const frameStep = (now: number) => {
    rebase();
    if (anim) {
      const t = clamp((now - anim.start) / MOVE_MS, 0, 1);
      position = anim.from + (anim.to - anim.from) * ease(t);
      if (t >= 1) {
        position = anim.to;
        anim = null;
        holdUntil = now + HOLD_MS;
        if (!reduced) autoplay = resumeAt <= now;
      }
    } else if (!dragging && !hovering && autoplay && now >= holdUntil && now >= resumeAt) {
      animateTo(Math.round(position) + 1);
    } else if (!dragging && !autoplay && resumeAt && now >= resumeAt) {
      autoplay = true;
      holdUntil = now + HOLD_MS;
    }
    rebase();
    paint();
    requestAnimationFrame(frameStep);
  };

  const distanceFor = (node: HTMLElement) => {
    const copy = Number(node.dataset.copy);
    const index = Number(node.dataset.i);
    return copy * count + index - position;
  };

  root.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    pointerId = event.pointerId;
    pointerY = event.clientY;
    pointerAt = performance.now();
    anim = null;
    position = Math.round(position);
    rebase();
    dragOrigin = position;
    dragging = true;
    moved = false;
    velocity = 0;
    stopAutoplay();
    paint();
    root.setPointerCapture(event.pointerId);
  });

  const openOrFocus = (node: HTMLElement) => {
    const media = node.closest<HTMLElement>('[data-media-track] [data-i]');
    const name = node.closest<HTMLButtonElement>('[data-name-track] [data-i]');
    const target = media ?? name;
    if (!target) return;
    const distance = distanceFor(target);
    if (Math.abs(distance) < 0.35) {
      const href = media?.querySelector<HTMLAnchorElement>('a')?.href ?? name?.dataset.href;
      if (href) window.location.href = href;
      return;
    }
    stopAutoplay();
    animateTo(position + distance);
  };

  root.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const dy = pointerY - event.clientY;
    if (Math.abs(dy) > 4) moved = true;
    const now = performance.now();
    const next = dragOrigin + dy / mediaStride;
    const dt = Math.max(16, now - pointerAt);
    velocity = (next - position) / dt;
    position = next;
    pointerY = event.clientY;
    pointerAt = now;
    dragOrigin = position;
    rebase();
    if (moved) event.preventDefault();
  });

  const release = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    if (!moved) {
      const hit = document.elementFromPoint(event.clientX, event.clientY);
      if (hit instanceof HTMLElement) openOrFocus(hit);
      return;
    }
    const extra = clamp(velocity * 36, -0.45, 0.45);
    animateTo(Math.round(position + extra));
  };

  root.addEventListener('pointerup', release);
  root.addEventListener('pointercancel', release);

  root.addEventListener('pointerenter', () => {
    hovering = true;
    stopAutoplay();
  });

  root.addEventListener('pointerleave', () => {
    hovering = false;
    resumeAt = performance.now() + RESUME_MS;
  });

  window.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      stopAutoplay();
      anim = null;
      const line = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta = clamp(event.deltaY * line, -220, 220) / mediaStride;
      position += delta * 0.9;
      velocity = delta / 120;
      window.clearTimeout(wheelTimer);
      rebase();
      wheelTimer = window.setTimeout(() => {
        const extra = clamp(velocity * 48, -0.28, 0.28);
        animateTo(Math.round(position + extra));
      }, 90);
    },
    { passive: false },
  );

  mediaTrack.addEventListener('click', (event) => {
    event.preventDefault();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    stopAutoplay();
    animateTo(Math.round(position) + (event.key === 'ArrowDown' ? 1 : -1));
  });

  measure();
  paint();
  holdUntil = performance.now() + 700;
  window.addEventListener('resize', () => {
    measure();
    paint();
  });
  requestAnimationFrame(frameStep);
}
