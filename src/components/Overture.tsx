import { useEffect, useRef } from 'react';
import '@fontsource/archivo/latin-900.css';
import '@fontsource/dm-mono/latin-400.css';

const WORD = 'VOLTA';
const ANGLES = [7.5, -2.5, -10, 12.5, -5, 5];
const PHOTOS = [
  { src: '/media/stack-confetti.jpg', position: 'center' },
  { src: '/media/stack-lasers.jpg', position: 'center' },
  { src: '/media/stack-wine.jpg', position: 'center' },
  { src: '/media/stack-guitar.jpg', position: 'center' },
  { src: '/media/stack-club.jpg', position: 'center' },
  { src: '/media/stack-dj.jpg', position: 'center' },
];

const NAV = [
  { label: 'Εκδηλώσεις', href: '/browse', glyph: 'calendar', chip: '#e4ddd2', ink: '#4c463e', wide: true },
  { label: 'Πανηγύρια', href: '/categories?category=Village%20Festivals', glyph: 'sun', chip: '#f0e0c0', ink: '#7a5524', wide: true },
  { label: 'Μουσική', href: '/categories?category=Live%20Music%20%26%20Nightlife', glyph: 'music', chip: '#6d5bd0', ink: '#ffffff', wide: true },
  { label: 'Οικογένεια', href: '/categories?category=Kids%20%26%20Family', glyph: 'people', chip: '#d7e4ea', ink: '#35586a', wide: true },
  { label: 'Γεύσεις', href: '/categories?category=Food%20%26%20Wine', glyph: 'glass', chip: '#f3d2c4', ink: '#8a4b32', wide: false },
  { label: 'Πολιτισμός', href: '/categories?category=Culture%20%26%20Theatre', glyph: 'columns', chip: '#e3d7f0', ink: '#5a4578', wide: false },
  { label: 'Ύπαιθρος', href: '/categories?category=Outdoors%20%26%20Nature', glyph: 'tree', chip: '#d5e6d2', ink: '#2f6a45', wide: false },
  { label: 'Καταχώρηση', href: '/submit', glyph: 'plus', chip: '#dce8d6', ink: '#3d6844', wide: true },
];
const NAV_FOCUS = NAV.findIndex((item) => item.glyph === 'music');

function NavGlyph({ name }: { name: string }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };
  if (name === 'calendar') {
    return (
      <svg {...props}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3.5v3M16 3.5v3M4 10h16" />
      </svg>
    );
  }
  if (name === 'sun') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
      </svg>
    );
  }
  if (name === 'music') {
    return (
      <svg {...props}>
        <path d="M9 18V6l10-2v12" />
        <circle cx="7" cy="18" r="2.4" />
        <circle cx="17" cy="16" r="2.4" />
      </svg>
    );
  }
  if (name === 'people') {
    return (
      <svg {...props}>
        <circle cx="9" cy="8" r="3" />
        <circle cx="16.5" cy="9" r="2.2" />
        <path d="M3.5 19c.7-2.7 2.9-4.2 5.5-4.2s4.8 1.5 5.5 4.2" />
        <path d="M14.2 15.1c1.5-.3 3 .2 4 1.4.8 1 1.3 2.1 1.6 2.5" />
      </svg>
    );
  }
  if (name === 'glass') {
    return (
      <svg {...props}>
        <path d="M7.5 3h9v1.5c0 3-2 5.2-4.5 5.2S7.5 7.5 7.5 4.5V3z" />
        <path d="M12 9.7V18M8.5 21h7" />
      </svg>
    );
  }
  if (name === 'columns') {
    return (
      <svg {...props}>
        <path d="M4 20h16M6.5 20V9M12 20V9M17.5 20V9M4 9h16M8 9V5h8v4" />
      </svg>
    );
  }
  if (name === 'tree') {
    return (
      <svg {...props}>
        <path d="M12 21v-4" />
        <path d="M12 3 5.5 13h13z" />
        <path d="M12 8 7 17h10z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}

const LINE = 'Βρες πού να βολτάρεις σήμερα';
const FILLS = [
  { src: '/media/hero-concert.jpg', aspect: 1.5 },
  { src: '/media/hero-lights.jpg', aspect: 1.5 },
  { src: '/media/hero-hands.jpg', aspect: 1.5 },
  { src: '/media/stack-dj.jpg', aspect: 1.5 },
  { src: '/media/stack-club.jpg', aspect: 1.5 },
  { src: '/media/stack-guitar.jpg', aspect: 1.5 },
  { src: '/media/stack-wine.jpg', aspect: 1.5 },
  { src: '/media/stack-lasers.jpg', aspect: 1.333 },
  { src: '/media/stack-confetti.jpg', aspect: 1.5 },
];

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solve = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const dx = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break;
      const next = t - (sampleX(t) - x) / dx;
      if (next < 0 || next > 1) break;
      t = next;
    }
    if (Math.abs(sampleX(t) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 12; i += 1) {
        const mid = (lo + hi) / 2;
        if (sampleX(mid) < x) lo = mid;
        else hi = mid;
      }
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return sampleY(solve(x));
  };
}

const hop = bezier(0.8, 0, 0.2, 1);
const hop2 = bezier(0.9, 0, 0.1, 1);

function power2InOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function progress(time: number, start: number, duration: number, ease: (value: number) => number) {
  if (time <= start) return 0;
  if (time >= start + duration) return 1;
  return ease((time - start) / duration);
}

function ranks(length: number) {
  const items = Array.from({ length }, (_, index) => index);
  for (let i = length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = items[i];
    items[i] = items[j];
    items[j] = swap;
  }
  const rank = new Array<number>(length);
  items.forEach((charIndex, order) => {
    rank[charIndex] = order;
  });
  return rank;
}

function Masked({ text, marker, fills = false }: { text: string; marker: string; fills?: boolean }) {
  return (
    <>
      {text.split('').map((char, index) => (
        <span className="ov-mask" key={`${marker}-${index}`}>
          <span className="ov-rise" data-ov={marker}>
            {fills ? (
              <>
                <span className="ov-solid">{char}</span>
                {FILLS.map((fill, fillIndex) => (
                  <span
                    key={fill.src}
                    className={fillIndex === 0 ? 'ov-ink is-on' : 'ov-ink'}
                    data-fill={fillIndex}
                    data-aspect={fill.aspect}
                    style={{ backgroundImage: `url("${fill.src}")` }}
                  >
                    {char}
                  </span>
                ))}
              </>
            ) : (
              char
            )}
          </span>
        </span>
      ))}
    </>
  );
}

export default function Overture({ skipIntro = false }: { skipIntro?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const word = root.querySelector<HTMLElement>('.ov-hero-word');
    if (!word) return;

    const place = () => {
      const wordBox = word.getBoundingClientRect();
      word.querySelectorAll<HTMLElement>('.ov-ink').forEach((ink) => {
        const mask = ink.parentElement?.parentElement;
        if (!mask) return;
        const aspect = Number(ink.dataset.aspect) || 1.5;
        let coverW = wordBox.width;
        let coverH = coverW / aspect;
        if (coverH < wordBox.height) {
          coverH = wordBox.height;
          coverW = coverH * aspect;
        }
        const box = mask.getBoundingClientRect();
        const extraX = (coverW - wordBox.width) / 2;
        const extraY = (coverH - wordBox.height) / 2;
        ink.style.backgroundSize = `${coverW}px ${coverH}px`;
        ink.style.backgroundPosition = `${wordBox.left - box.left - extraX}px ${wordBox.top - box.top - extraY}px`;
      });
    };

    place();
    const observer = new ResizeObserver(place);
    observer.observe(word);
    let current = 0;
    let timer = 0;
    let swap = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      timer = window.setInterval(() => {
        const next = (current + 1) % FILLS.length;
        word.querySelectorAll<HTMLElement>('.ov-ink').forEach((node) => {
          if (Number(node.dataset.fill) === next) {
            node.style.zIndex = '2';
            node.classList.add('is-on');
          }
        });
        swap = window.setTimeout(() => {
          word.querySelectorAll<HTMLElement>('.ov-ink').forEach((node) => {
            if (Number(node.dataset.fill) !== next) {
              node.classList.remove('is-on');
              node.style.zIndex = '1';
            }
          });
          current = next;
        }, 1200);
      }, 3000);
    }

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.clearTimeout(swap);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (skipIntro) {
      if (location.search) history.replaceState(null, '', `${location.pathname}${location.hash}`);
      return;
    }
    if (!location.hash) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      window.scrollTo(0, 0);
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const panel = root.querySelector<HTMLElement>('[data-panel]');
    const portraits = [...root.querySelectorAll<HTMLElement>('[data-portrait]')];
    const preChars = [...root.querySelectorAll<HTMLElement>('[data-ov="pre"]')];
    const heroChars = [...root.querySelectorAll<HTMLElement>('[data-ov="hero"]')];
    const lines = [...root.querySelectorAll<HTMLElement>('[data-ov="line"]')];
    const counter = root.querySelector<HTMLElement>('[data-counter]');
    if (!panel || !counter) return;

    const preRank = ranks(preChars.length);
    const heroRank = ranks(heroChars.length);
    document.documentElement.classList.add('ov-lock');

    const origin = performance.now();
    let frame = 0;
    let unlocked = false;

    const apply = (time: number) => {
      portraits.forEach((portrait, index) => {
        const enter = progress(time, index * 0.2, 1, hop);
        const leave = progress(time, 3.5 + (portraits.length - 1 - index) * 0.075, 1, hop);
        const shown = enter * (1 - leave);
        portrait.style.transform = `rotate(${ANGLES[index]}deg) scale(${shown})`;
        portrait.style.clipPath = `inset(${20 * (1 - shown)}%)`;
      });

      const preIn = (index: number) => progress(time, 0.35 + preRank[index] * 0.125, 1, hop2);
      const preOut = progress(time, 3.25, 0.75, hop2);
      preChars.forEach((char, index) => {
        const y = 100 * (1 - preIn(index)) - 100 * preOut;
        char.style.transform = `translateY(${y}%)`;
      });

      const countIn = progress(time, 0.35, 1, hop2);
      const value = Math.round(progress(time, 0.35, 2, power2InOut) * 100);
      counter.textContent = String(value).padStart(3, '0');
      counter.style.transform = `translateY(${100 * (1 - countIn) - 100 * preOut}%)`;

      const lift = progress(time, 4.35, 1, hop);
      panel.style.clipPath = `inset(0 0 ${lift * 100}% 0)`;
      if (lift >= 1) panel.style.pointerEvents = 'none';
      if (!unlocked && time >= 5.35) {
        unlocked = true;
        document.documentElement.classList.remove('ov-lock');
      }

      heroChars.forEach((char, index) => {
        const shown = progress(time, 4.65 + heroRank[index] * 0.125, 1, hop2);
        char.style.transform = `translateY(${100 * (1 - shown)}%)`;
      });
      lines.forEach((line, index) => {
        const shown = progress(time, 4.75 + index * 0.075, 0.9, hop);
        line.style.transform = `translateY(${100 * (1 - shown)}%)`;
      });
    };

    const tick = (now: number) => {
      const time = (now - origin) / 1000 - 0.5;
      apply(time);
      if (time < 6.6) frame = requestAnimationFrame(tick);
    };

    apply(-1);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.classList.remove('ov-lock');
    };
  }, [skipIntro]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nav = root.querySelector<HTMLElement>('.ov-nav');
    if (!nav) return;
    const slots = [...nav.querySelectorAll<HTMLElement>('.ov-slot')];
    const mobileQuery = window.matchMedia('(max-width: 720px)');
    let centered = false;

    const paint = () => {
      if (!mobileQuery.matches) return;
      const mid = nav.scrollTop + nav.clientHeight / 2;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      slots.forEach((slot, index) => {
        const center = slot.offsetTop + slot.offsetHeight / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          best = index;
          bestDist = dist;
        }
      });
      slots.forEach((slot, index) => {
        const link = slot.querySelector<HTMLElement>('.ov-link');
        if (!link) return;
        const depth = String(Math.min(2, Math.abs(index - best)));
        if (link.dataset.depth !== depth) link.dataset.depth = depth;
      });
    };

    const centerOn = (index: number) => {
      const slot = slots[index];
      if (!slot) return;
      nav.scrollTop = slot.offsetTop - (nav.clientHeight - slot.offsetHeight) / 2;
    };

    const sync = () => {
      if (!mobileQuery.matches) {
        nav.scrollTop = 0;
        centered = false;
        return;
      }
      if (!centered) {
        centerOn(NAV_FOCUS);
        centered = true;
      }
      paint();
    };

    sync();
    const frame = requestAnimationFrame(sync);
    nav.addEventListener('scroll', paint, { passive: true });
    mobileQuery.addEventListener('change', sync);
    return () => {
      cancelAnimationFrame(frame);
      nav.removeEventListener('scroll', paint);
      mobileQuery.removeEventListener('change', sync);
    };
  }, []);

  return (
    <div className={skipIntro ? 'ov is-ready' : 'ov'} ref={rootRef} id="top">
      <style>{CSS}</style>
      <section className="ov-hero" aria-label="What's On Cyprus">
        <nav className="ov-nav" aria-label="Κύρια">
          <span className="ov-nav-pad" aria-hidden="true" />
          {NAV.map((item, index) => (
            <span key={item.href} className={item.wide ? 'ov-slot' : 'ov-slot ov-slot-more'}>
              <a
                href={item.href}
                className="ov-link"
                data-depth={Math.min(2, Math.abs(index - NAV_FOCUS))}
                style={{ ['--chip' as string]: item.chip, ['--ink' as string]: item.ink }}
              >
                <span className="ov-ico" aria-hidden="true">
                  <NavGlyph name={item.glyph} />
                </span>
                <span className="ov-mask">
                  <span className="ov-rise" data-ov="line">
                    {item.label}
                  </span>
                </span>
              </a>
            </span>
          ))}
          <span className="ov-nav-pad" aria-hidden="true" />
        </nav>
        <h1 className="ov-hero-word" aria-label={WORD}>
          <Masked text={WORD} marker="hero" fills />
        </h1>
        <div className="ov-foot">
          <img className="ov-mark" src="/favicon.png" alt="" width={36} height={36} />
          <p>
            <span className="ov-mask">
              <span className="ov-rise" data-ov="line">
                {LINE}
              </span>
            </span>
          </p>
        </div>
      </section>

      <div className="ov-panel" data-panel aria-hidden="true">
        {PHOTOS.map((photo, index) => (
          <div
            key={`${photo.src}-${index}`}
            className="pl-img"
            data-portrait
            style={{
              backgroundImage: `url("${photo.src}")`,
              backgroundPosition: photo.position,
              zIndex: index + 1,
              ['--rot' as string]: `${ANGLES[index]}deg`,
            }}
          />
        ))}
        <div className="ov-brand">
          <div className="ov-word">
            <Masked text={WORD} marker="pre" />
          </div>
          <span className="ov-mask ov-count-mask">
            <span className="ov-count" data-counter>
              000
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.ov-hero {
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 28px 40px 32px;
  background: #e7e0d1;
  color: #16120c;
}
.ov-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 18px;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  line-height: 1;
  text-transform: uppercase;
}
.ov-slot {
  display: contents;
}
.ov-slot-more,
.ov-nav-pad {
  display: none;
}
.ov-link {
  display: inline-flex;
  align-items: center;
  color: inherit;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
}
.ov-ico {
  display: none;
}
.ov-hero-word {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  margin: 0;
  font-family: Archivo, sans-serif;
  font-weight: 900;
  font-size: clamp(72px, 18vw, 248px);
  line-height: 0.82;
  letter-spacing: -0.045em;
  text-transform: uppercase;
}
.ov-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.ov-mark {
  width: 34px;
  height: 34px;
  object-fit: contain;
}
.ov-foot p {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-align: center;
}
.ov-foot .ov-mask {
  line-height: 1.45;
  padding: 0.08em 0.15em 0.18em;
}
.ov-hero-word .ov-rise {
  display: grid;
}
.ov-hero-word .ov-solid,
.ov-hero-word .ov-ink {
  grid-area: 1 / 1;
}
.ov-solid {
  color: #16120c;
}
.ov-ink {
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  opacity: 0;
  transition: opacity 1.2s ease;
}
.ov-ink.is-on {
  opacity: 1;
}
.ov-mask {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  line-height: 0.86;
}
.ov-rise,
.ov-count {
  display: block;
  transform: translateY(100%);
  will-change: transform;
}
.ov-panel {
  position: fixed;
  inset: 0;
  z-index: 60;
  overflow: hidden;
  background: #13110d;
  color: #f3ede1;
  clip-path: inset(0 0 0 0);
}
.pl-img {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 250px;
  height: 320px;
  margin: -160px 0 0 -125px;
  background-color: #241f1a;
  background-position: center;
  background-size: cover;
  transform: rotate(var(--rot)) scale(0);
  clip-path: inset(20%);
  will-change: transform, clip-path;
}
.ov-brand {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 8;
  display: flex;
  align-items: center;
  gap: 0.42em;
  transform: translate(-50%, -50%);
}
.ov-word {
  display: flex;
  font-family: Archivo, sans-serif;
  font-weight: 900;
  font-size: clamp(40px, 6vw, 72px);
  line-height: 0.86;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  text-shadow: 0 2px 14px rgba(0, 0, 0, 0.72);
}
.ov-count-mask {
  line-height: 1;
}
.ov-count {
  font-family: "DM Mono", ui-monospace, monospace;
  font-size: clamp(16px, 1.7vw, 22px);
  font-weight: 400;
  letter-spacing: 0.08em;
  color: #b78a4e;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 720px) {
  .ov-hero {
    padding: 18px 16px 22px;
    overflow-x: clip;
    container-type: inline-size;
  }
  .ov-hero-word {
    width: 100%;
    min-width: 0;
    font-size: clamp(80px, 23vw, 104px);
    font-size: clamp(80px, 26.5cqi, 124px);
    letter-spacing: -0.06em;
  }
  .ov-nav {
    --ov-nav-h: 228px;
    --ov-slot-h: 46px;
    position: relative;
    width: min(100%, 360px);
    height: var(--ov-nav-h);
    margin-inline: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0;
    padding: 0;
    border: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scroll-snap-type: y mandatory;
    scrollbar-width: none;
    touch-action: pan-y;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.2;
    text-transform: none;
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%);
    mask-image: linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%);
  }
  .ov-nav::-webkit-scrollbar { display: none; }
  .ov-nav-pad {
    display: block;
    flex: none;
    width: 100%;
    height: calc((var(--ov-nav-h) - var(--ov-slot-h)) / 2);
  }
  .ov-slot,
  .ov-slot-more {
    display: grid;
    place-items: center;
    position: relative;
    flex: none;
    width: 100%;
    height: var(--ov-slot-h);
    scroll-snap-align: center;
    scroll-snap-stop: normal;
  }
  .ov-slot:has([data-depth="1"]) { z-index: 3; }
  .ov-slot:has([data-depth="0"]) { z-index: 5; }
  .ov-nav .ov-mask {
    line-height: 1.25;
    padding: 0.08em 0 0.12em;
  }
  .ov-link {
    width: 74%;
    height: 46px;
    justify-content: flex-start;
    gap: 12px;
    padding: 0 16px 0 10px;
    border-radius: 16px;
    background: #b7b1a6;
    color: #1c1914;
    box-shadow: 0 8px 16px rgba(22, 18, 12, 0.06);
    transition: width 0.18s ease, height 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }
  .ov-link[data-depth="1"] {
    width: 88%;
    height: 50px;
    background: rgba(255, 252, 247, 0.92);
    color: #2c2823;
  }
  .ov-link[data-depth="0"] {
    width: 100%;
    height: 58px;
    background: #fff;
    color: #16120c;
    font-weight: 700;
    box-shadow: 0 16px 32px rgba(22, 18, 12, 0.16);
  }
  .ov-ico {
    display: grid;
    place-items: center;
    flex: none;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: var(--chip);
    color: var(--ink);
  }
  .pl-img {
    width: 168px;
    height: 216px;
    margin: -108px 0 0 -84px;
  }
}
.ov.is-ready .ov-panel { display: none !important; }
.ov.is-ready .ov-rise,
.ov.is-ready .ov-count { transform: none !important; }

@media (prefers-reduced-motion: reduce) {
  .ov-panel { display: none !important; }
  .ov-rise, .ov-count { transform: none !important; }
}
`;
