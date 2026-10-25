// 萌虎素材处理：src.png（1279×1671，AI 生成原图截屏）→ 抠透明底 → tiger-base.png（512×669）
// 用法：node scripts/make-tiger.mjs cutout
// 抠图双重判据：邻接像素色差（容梯度）+ 行背景模型距离（防漏进浅色方块）
import { readFileSync, writeFileSync } from 'node:fs';
import { decodePng, encodePng } from './png.mjs';

const SRC = 'design-assets/tiger/src.png';

const src = decodePng(readFileSync(SRC));
const { w, h, rgba } = src;
console.log('源图', w + 'x' + h);

// ---------- 行背景模型：每行取左右边缘 8 列中值 ----------
function rowBg(y) {
  const pick = (x0) => {
    const rs = [], gs = [], bs = [];
    for (let i = 0; i < 8; i++) {
      const o = (y * w + x0 + i) * 4;
      rs.push(rgba[o]); gs.push(rgba[o + 1]); bs.push(rgba[o + 2]);
    }
    const med = (a) => a.sort((p, q) => p - q)[4];
    return [med(rs), med(gs), med(bs)];
  };
  const L = pick(0), R = pick(w - 8);
  return [L, R];
}
const bgL = [], bgR = [];
for (let y = 0; y < h; y++) { const [L, R] = rowBg(y); bgL.push(L); bgR.push(R); }
function bgAt(x, y) {
  const t = x / (w - 1);
  const L = bgL[y], R = bgR[y];
  return [L[0] + (R[0] - L[0]) * t, L[1] + (R[1] - L[1]) * t, L[2] + (R[2] - L[2]) * t];
}
const distBg = (x, y) => {
  const o = (y * w + x) * 4, b = bgAt(x, y);
  return Math.max(Math.abs(rgba[o] - b[0]), Math.abs(rgba[o + 1] - b[1]), Math.abs(rgba[o + 2] - b[2]));
};

// ---------- 泛洪：从四边出发，邻接差 ≤ T 且距背景模型 ≤ B 判为背景 ----------
const T = 8, B = 22;
const isBg = new Uint8Array(w * h);
const queue = [];
for (let x = 0; x < w; x++) { queue.push(x, (h - 1) * w + x); }
for (let y = 0; y < h; y++) { queue.push(y * w, y * w + w - 1); }
const dAt = (i) => {
  const x = i % w, y = (i / w) | 0;
  return distBg(x, y);
};
let head = 0;
while (head < queue.length) {
  const i = queue[head++];
  if (isBg[i]) continue;
  if (dAt(i) > B) continue;
  isBg[i] = 1;
  const x = i % w, y = (i / w) | 0;
  const o = i * 4;
  const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
  for (const j of nb) {
    if (j < 0 || isBg[j]) continue;
    const p = j * 4;
    const d = Math.max(Math.abs(rgba[p] - rgba[o]), Math.abs(rgba[p + 1] - rgba[o + 1]), Math.abs(rgba[p + 2] - rgba[o + 2]));
    if (d <= T) queue.push(j);
  }
}
let bgCount = 0;
for (let i = 0; i < w * h; i++) if (isBg[i]) bgCount++;
console.log('背景像素', ((bgCount / (w * h)) * 100).toFixed(1) + '%');

// ---------- 应用透明 + 输出全分辨率抠图（供检查） ----------
const cut = Buffer.from(rgba);
for (let i = 0; i < w * h; i++) if (isBg[i]) cut[i * 4 + 3] = 0;
writeFileSync('design-assets/tiger/cut-full.png', encodePng({ w, h, rgba: cut }));

// ---------- 面积平均降采样到 512 宽（保持纵横比） ----------
const OW = 512, OH = Math.round((h * OW) / w);
const out = Buffer.alloc(OW * OH * 4, 0);
const sx = w / OW, sy = h / OH;
for (let oy = 0; oy < OH; oy++) {
  for (let ox = 0; ox < OW; ox++) {
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    const x0 = ox * sx, x1 = (ox + 1) * sx, y0 = oy * sy, y1 = (oy + 1) * sy;
    for (let y = Math.floor(y0); y < Math.min(h, Math.ceil(y1)); y++) {
      const fy = Math.min(y + 1, y1) - Math.max(y, y0);
      if (fy <= 0) continue;
      for (let x = Math.floor(x0); x < Math.min(w, Math.ceil(x1)); x++) {
        const fx = Math.min(x + 1, x1) - Math.max(x, x0);
        if (fx <= 0) continue;
        const o = (y * w + x) * 4, cov = fx * fy;
        r += cut[o] * cov; g += cut[o + 1] * cov; b += cut[o + 2] * cov; a += cut[o + 3] * cov;
        n += cov;
      }
    }
    if (n > 0) {
      const o = (oy * OW + ox) * 4;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n; out[o + 3] = a / n;
    }
  }
}
writeFileSync('design-assets/tiger/tiger-base.png', encodePng({ w: OW, h: OH, rgba: out }));
console.log('输出 tiger-base.png', OW + 'x' + OH);

// ---------- 七色重上色：亮度阶梯重映射（立体像素明暗面自动保留） ----------
// pink 锚点从本图自动采样（亮度四分位均值），其余复用美西螈管线的通用色梯
const base = decodePng(readFileSync('design-assets/tiger/tiger-base.png'));
const { w: bw, h: bh, rgba: ba } = base;
const lumaOf = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
const satOf = (r, g, b) => {
  const mx = Math.max(r, g, b);
  return mx === 0 ? 0 : (mx - Math.min(r, g, b)) / mx;
};
const colored = [];
for (let i = 0; i < bw * bh; i++) {
  const o = i * 4;
  if (ba[o + 3] < 16) continue;
  const mx = Math.max(ba[o], ba[o + 1], ba[o + 2]);
  // 近黑像素（眼睛/深阴影）视为中性：饱和度公式在暗区失真，且它们应保持深色
  if (mx < 48 || satOf(ba[o], ba[o + 1], ba[o + 2]) < 0.15) continue;
  colored.push({ l: lumaOf(ba[o], ba[o + 1], ba[o + 2]), o });
}
colored.sort((a, b) => a.l - b.l);
const q = (p) => {
  const idx = Math.min(colored.length - 1, Math.floor(colored.length * p));
  const slice = colored.slice(Math.max(0, idx - 200), idx + 200);
  const m = [0, 0, 0];
  for (const c of slice) { m[0] += ba[c.o]; m[1] += ba[c.o + 1]; m[2] += ba[c.o + 2]; }
  return '#' + m.map((v) => Math.round(v / slice.length).toString(16).padStart(2, '0')).join('');
};
// pink 锚点对齐美西螈 lucy 粉的饱和气质（原图偏浅，自动采样会发白，故手定饱和粉梯）
const autoPink = ['#d64f7e', '#ee6f9d', '#f8a0be', '#fdd0e0'];
console.log('pink 锚点（对齐美西螈风）:', autoPink.join(' '));

const RAMPS = {
  pink: autoPink,
  purple: ['#6c4bc4', '#9b7bd4', '#c9b8f0', '#e4dbf8'],
  wild: ['#503f30', '#604c3b', '#8b6543', '#a27a56'],
  cyan: ['#6cb2de', '#b0d5fc', '#d3e5fd', '#e2eeff'],
  gold: ['#b6710e', '#d69a1f', '#ffd11b', '#ffe27a'],
  blue: ['#5b6fe3', '#8690f5', '#a79fff', '#c3c0ff'],
  green: ['#3d7a2b', '#58a83c', '#8fd45f', '#c7eda0'],
};
const hexRgb = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
function rampColor(anchors, t) {
  const seg = Math.min(2, Math.floor(t * 3));
  const f = t * 3 - seg;
  const a = hexRgb(anchors[seg]), b = hexRgb(anchors[seg + 1]);
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

// 亮度黑白点取 5%/95% 百分位（不是极值）：萌虎原图整体偏浅，
// 极值归一会让大多数体素落在色梯顶端（发白）；百分位拉伸让中间调回到色梯中段
let lMin = Infinity, lMax = -Infinity;
for (const c of colored) { if (c.l < lMin) lMin = c.l; if (c.l > lMax) lMax = c.l; }
const lP5 = colored[Math.floor(colored.length * 0.05)].l;
const lP95 = colored[Math.floor(colored.length * 0.95)].l;
console.log('亮度 极值', lMin.toFixed(0), '-', lMax.toFixed(0), '| 拉伸用 P5-P95:', lP5.toFixed(0), '-', lP95.toFixed(0));

for (const [name, anchors] of Object.entries(RAMPS)) {
  const outv = Buffer.from(ba);
  for (let i = 0; i < bw * bh; i++) {
    const o = i * 4;
    if (outv[o + 3] < 16) continue;
    const r = outv[o], g = outv[o + 1], b = outv[o + 2];
    // 眼睛/深阴影保持中性（近黑不重上色）
    if (Math.max(r, g, b) < 48 || satOf(r, g, b) < 0.15) continue;
    const t = (lumaOf(r, g, b) - lP5) / (lP95 - lP5);
    const [nr, ng, nb] = rampColor(anchors, Math.max(0, Math.min(1, t)));
    outv[o] = nr; outv[o + 1] = ng; outv[o + 2] = nb;
  }
  writeFileSync(`public/assets/tiger-${name}.png`, encodePng({ w: bw, h: bh, rgba: outv }));

  // favicon：256×256 画布按高适配居中
  const scale = 256 / bh;
  const iw = Math.round(bw * scale);
  const fav = Buffer.alloc(256 * 256 * 4, 0);
  const x0 = Math.floor((256 - iw) / 2);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < iw; x++) {
      const sX = Math.min(bw - 1, Math.floor(x / scale));
      const sY = Math.min(bh - 1, Math.floor(y / scale));
      const so = (sY * bw + sX) * 4;
      const fo = (y * 256 + x0 + x) * 4;
      fav[fo] = outv[so]; fav[fo + 1] = outv[so + 1]; fav[fo + 2] = outv[so + 2]; fav[fo + 3] = outv[so + 3];
    }
  }
  writeFileSync(`public/favicon-tiger-${name}.png`, encodePng({ w: 256, h: 256, rgba: fav }));
  console.log('变体', name, '已输出');
}
