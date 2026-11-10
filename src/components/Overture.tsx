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
  { label: 'Εκδηλώσεις', href: '/browse' },
  { label: 'Πανηγύρια', href: '/categories?category=Village%20Festivals' },
  { label: 'Μουσική', href: '/categories?category=Live%20Music%20%26%20Nightlife' },
  { label: 'Οικογένεια', href: '/categories?category=Kids%20%26%20Family' },
  { label: 'Καταχώρηση', href: '/submit' },
];

const LINE = 'Βρες πού να βολτάρεις σήμερα';
const FILLS = ['/media/hero-concert.jpg', '/media/hero-lights.jpg', '/media/hero-hands.jpg'];

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
                {FILLS.map((src, fillIndex) => (
                  <span
                    key={src}
                    className={fillIndex === 0 ? 'ov-ink is-on' : 'ov-ink'}
                    data-fill={fillIndex}
                    style={{ backgroundImage: `url("${src}")` }}
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
      word.style.setProperty('--fill-w', `${wordBox.width}px`);
      word.style.setProperty('--fill-h', `${wordBox.height}px`);
      word.querySelectorAll<HTMLElement>(':scope > .ov-mask').forEach((mask) => {
        const box = mask.getBoundingClientRect();
        mask.style.setProperty('--fill-x', `${wordBox.left - box.left}px`);
        mask.style.setProperty('--fill-y', `${wordBox.top - box.top}px`);
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

  return (
    <div className={skipIntro ? 'ov is-ready' : 'ov'} ref={rootRef} id="top">
      <style>{CSS}</style>
      <section className="ov-hero" aria-label="What's On Cyprus">
        <nav className="ov-nav" aria-label="Κύρια">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className="ov-link">
              <span className="ov-mask">
                <span className="ov-rise" data-ov="line">
                  {item.label}
                </span>
              </span>
            </a>
          ))}
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
.ov-link {
  display: inline-flex;
  align-items: center;
  color: inherit;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
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
  background-size: var(--fill-w) var(--fill-h);
  background-position: var(--fill-x) var(--fill-y);
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
  .ov-hero { padding: 28px 20px 28px; }
  .ov-nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px 22px;
    padding-bottom: 16px;
    border-bottom: 1px solid #16120c;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.16em;
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
