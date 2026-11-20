document.documentElement.classList.add('js');

// Sticky navigation background
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Number formatting for the animated counters
function format(el, value) {
  const decimals = Number(el.dataset.decimals || 0);
  let text = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-US');
  if (el.dataset.format === 'plus') text += '+';
  return (el.dataset.prefix || '') + text + (el.dataset.suffix || '');
}

function runCounter(el) {
  const target = Number(el.dataset.count);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = format(el, target); return; }
  const start = performance.now(), duration = 1400;
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = format(el, target * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Weekly figures, October 2025 to November 2026
const GROWTH = [1622,1723,1840,1963,2193,2045,2594,2727,2838,3053,3317,3504,3553,3652,3768,3926,4082,4285,4468,4577,4768,5004,5235,5423,5748,6046,6260,6430,6742,6832,6931,7344,7611,8048,8446,8785,8890,9123,9389,9589,10540,10813,10980,11066,11329,11765,11910,12067,12270,12328,12485,12765];
const SERIES = {
  impressions: [5760,4780,4470,5160,8720,9850,6060,8610,7680,11000,11400,8760,6670,7120,6930,11300,16300,17200,23000,29300,29500,25700,21400,16900,23600,21400,23300,26300,30300,14000,14500,12100,13300,9230,16500,14200,10700,11300,19000,28600,20900,32900,33200,22600,22000,21800,19900,17700,19000,28100,28100,43400],
  // position is inverted so that a better rank draws higher
  position: [33,31,15,14,11,9,13,15,16,16,16,19,17,15,19,15,12,12,9,8,8,11,15,16,10,10,9,6,7,10,11,11,12,11,12,13,13,12,17,17,15,15,13,12,11,11,15,15,15,16,16,15].map((v) => 40 - v),
  linkedin: [6000,6000,6000,6000,6000,6000,6000,6000,6000,6000,8523,8740,8882,9001,9084,9141,9236,9309,9408,9472,9549,9606,9677,9781,9903,9964,10511,10622,10671,10733,10820,10873,10920,11027,11095,11147,11286,11409,11184,11574,11702,12449,12449,12449,12525,12635,12635,12635,12751,12905,12911,13009],
};

(function drawGrowth() {
  const host = document.getElementById('growthChart');
  if (!host) return;
  const W = 640, H = 300, L = 44, R = 96, T = 34, B = 30, max = 14000;
  const x = (i) => L + (i / (GROWTH.length - 1)) * (W - L - R);
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const pts = GROWTH.map((v, i) => [x(i), y(v)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  const area = d + ' L ' + last[0].toFixed(1) + ' ' + (H - B) + ' L ' + L + ' ' + (H - B) + ' Z';
  const grid = [0, 4000, 8000, 12000].map((v) => '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text class="axis" x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + (v ? v / 1000 + 'k' : '0') + '</text>').join('');
  const fx = pts[0][0], fy = pts[0][1], lx = last[0], ly = last[1];
  host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">'
    + '<defs><linearGradient id="gArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C9A45C" stop-opacity=".35"/><stop offset="1" stop-color="#C9A45C" stop-opacity="0"/></linearGradient></defs>'
    + grid
    + '<path class="fade" d="' + area + '" fill="url(#gArea)"/>'
    + '<path class="line" d="' + d + '"/>'
    + '<circle class="dot" cx="' + fx + '" cy="' + fy + '" r="6"/>'
    + '<circle class="dot fade" cx="' + lx + '" cy="' + ly + '" r="7"/>'
    + '<text class="label" x="' + (fx + 12) + '" y="' + (fy - 12) + '">1,622</text>'
    + '<text class="label fade" x="' + (lx + 12) + '" y="' + (ly + 2) + '">12,765</text>'
    + '<text class="label--sub fade" x="' + (lx + 12) + '" y="' + (ly + 18) + '">Nov 2026</text>'
    + '<text class="axis" x="' + L + '" y="' + (H - 8) + '">Oct 2025</text>'
    + '<text class="axis" x="' + (W - R) + '" y="' + (H - 8) + '" text-anchor="end">Nov 2026</text>'
    + '</svg>';
  const line = host.querySelector('.line');
  line.style.setProperty('--len', Math.ceil(line.getTotalLength()));
})();

document.querySelectorAll('.spark').forEach((el) => {
  const data = SERIES[el.dataset.series];
  if (!data) return;
  const W = 300, H = 44, min = Math.min.apply(null, data), max = Math.max.apply(null, data);
  const d = data.map((v, i) => (i ? 'L' : 'M') + (i / (data.length - 1) * W).toFixed(1) + ' ' + (H - 3 - (v - min) / (max - min) * (H - 6)).toFixed(1)).join(' ');
  el.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '"/></svg>';
});

// Small growth line for the first story
(function drawMini() {
  const host = document.getElementById('growthMini');
  if (!host) return;
  const W = 300, H = 112, L = 6, R = 62, T = 22, B = 8, max = 13500;
  const pts = GROWTH.map((v, i) => [L + (i / (GROWTH.length - 1)) * (W - L - R), T + (1 - v / max) * (H - T - B)]);
  const d = pts.map((q, i) => (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' ');
  const f = pts[0], l = pts[pts.length - 1];
  host.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path class="line" d="' + d + '"/><circle class="dot" cx="' + f[0] + '" cy="' + f[1] + '" r="4"/><circle class="dot" cx="' + l[0] + '" cy="' + l[1] + '" r="5"/><text x="' + (f[0] + 8) + '" y="' + (f[1] - 8) + '">1,622</text><text x="' + (l[0] + 8) + '" y="' + (l[1] + 5) + '">12,765</text></svg>';
  const line = host.querySelector('.line');
  line.style.setProperty('--len', Math.ceil(line.getTotalLength()));
})();

// Reveal on scroll, with a small stagger inside each group
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 90 + 'ms';
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(runCounter);
    io.unobserve(el);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// Safety net: if anything on screen is still hidden after load, show it
window.addEventListener('load', () => setTimeout(() => {
  document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) { el.classList.add('is-in'); el.querySelectorAll('[data-count]').forEach(runCounter); io.unobserve(el); }
  });
}, 1800));

// Carousel arrows
document.querySelectorAll('.car-nav').forEach((navEl) => {
  const track = document.getElementById(navEl.dataset.target);
  if (!track) return;
  navEl.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
    const card = track.firstElementChild;
    const step = card ? Math.min(card.getBoundingClientRect().width + 20, track.clientWidth * 0.9) : track.clientWidth * 0.8;
    track.scrollBy({ left: Number(btn.dataset.dir) * step, behavior: 'smooth' });
  }));
});

// Screenshots: click to enlarge
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const big = lightbox.querySelector('img'), cap = lightbox.querySelector('p');
  const close = () => { lightbox.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('.frame').forEach((frame) => frame.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;
    const img = frame.querySelector('img');
    big.src = img.src; big.alt = img.alt; cap.textContent = frame.querySelector('figcaption strong').textContent;
    lightbox.hidden = false; document.body.style.overflow = 'hidden';
  }));
  lightbox.addEventListener('click', (e) => { if (e.target !== big) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// Stories: one open at a time, the visual on the right follows
document.querySelectorAll('.story__head').forEach((head) => head.addEventListener('click', () => {
  const story = head.parentElement;
  if (story.classList.contains('is-open')) return;
  document.querySelectorAll('.story').forEach((s) => { s.classList.remove('is-open'); s.querySelector('.story__head').setAttribute('aria-expanded', 'false'); });
  story.classList.add('is-open'); head.setAttribute('aria-expanded', 'true');
}));
