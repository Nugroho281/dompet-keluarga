// DompetKeluarga — charts.js
// Semua grafik digambar sebagai SVG oleh kode ini (tanpa pustaka, tanpa gambar
// luar). Fungsi-fungsi di sini hanya menerima angka dan mengembalikan string
// SVG; tidak ada fetch, tidak ada network.

const ESC = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function formatRp(n) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

export function formatJt(n) {
  if (n >= 1000000) return 'Rp' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' jt';
  if (n >= 1000) return 'Rp' + Math.round(n / 1000).toLocaleString('id-ID') + ' rb';
  return formatRp(n);
}

// Donat 3 segmen (dipakai kalkulator 50/30/20 + skenario).
export function donut(parts, size = 220) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r - 30;
  let angle = -Math.PI / 2;
  let arcs = '';
  for (const p of parts) {
    const frac = p.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1);
    const yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0);
    const yi0 = cy + inner * Math.sin(a0);
    if (frac >= 0.999) {
      arcs += `<circle cx="${cx}" cy="${cy}" r="${(r + inner) / 2}" fill="none" stroke="${p.color}" stroke-width="${r - inner}" />`;
    } else if (frac > 0.001) {
      arcs += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${p.color}" />`;
    }
    angle = a1;
  }
  const legend = parts.map((p) => {
    const pct = Math.round((p.value / total) * 100);
    return `<div class="legend-row"><span class="swatch" style="background:${p.color}"></span><span>${ESC(p.label)}</span><b>${pct}% · ${formatRp(p.value)}</b></div>`;
  }).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Diagram donat alokasi anggaran">${arcs}<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="donut-center">${formatJt(total)}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-sub">per bulan</text></svg><div class="legend">${legend}</div></div>`;
}

// Batang horizontal berlabel (dipakai: pengeluaran BPS, UMP provinsi,
// belanja per kategori, harga pangan).
export function hbar(rows, opts = {}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const money = opts.money === undefined ? true : opts.money;
  const bars = rows.map((r) => {
    const pct = Math.round((r.value / max) * 100);
    const val = money ? formatRp(r.value) : String(r.value);
    return `<div class="hbar-row"><span class="hbar-label">${ESC(r.label)}</span><span class="hbar-track"><span class="hbar-fill" style="width:${pct}%;background:${r.color || 'var(--leaf)'}"></span></span><b class="hbar-value">${val}</b></div>`;
  }).join('');
  return `<div class="hbar">${bars}</div>`;
}

// Batang vertikal (dipakai: perbandingan pengeluaran per kapita, dsb).
export function vbar(rows, height = 180) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const w = 460;
  const bw = Math.min(64, (w - 40) / rows.length - 14);
  const gap = (w - 40 - bw * rows.length) / (rows.length + 1);
  let x = 20 + gap;
  const bars = rows.map((r) => {
    const h = Math.max(4, ((height - 46) * r.value) / max);
    const y = height - 26 - h;
    const out = `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw}" height="${h.toFixed(1)}" rx="4" fill="${r.color || 'var(--leaf)'}"></rect><text x="${(x + bw / 2).toFixed(1)}" y="${(height - 30 - h).toFixed(1)}" text-anchor="middle" class="chart-val">${ESC(r.short)}</text><text x="${(x + bw / 2).toFixed(1)}" y="${height - 10}" text-anchor="middle" class="chart-lab">${ESC(r.label)}</text>`;
    x += bw + gap;
    return out;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${height}" class="vbar-svg" role="img" aria-label="Diagram batang">${bars}<line x1="20" y1="${height - 26}" x2="${w - 20}" y2="${height - 26}" stroke="var(--line)" /></svg>`;
}

// Garis akumulasi tabungan (dipakai simulator target).
export function savingsLine(monthly, target, months) {
  const w = 560;
  const h = 200;
  const padL = 64;
  const padB = 28;
  const padT = 14;
  const n = Math.min(months, 60);
  const maxY = Math.max(target, monthly * n) * 1.05;
  const px = (i) => padL + ((w - padL - 16) * i) / Math.max(n, 1);
  const py = (v) => padT + (h - padT - padB) * (1 - v / maxY);
  let pts = '';
  for (let i = 0; i <= n; i++) pts += `${px(i).toFixed(1)},${py(monthly * i).toFixed(1)} `;
  const targetY = py(target);
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = padT + (h - padT - padB) * (1 - f);
    return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - 16}" y2="${y.toFixed(1)}" stroke="var(--line)" stroke-width="1" /><text x="${padL - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="chart-lab">${formatJt(maxY * f)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" class="line-svg" role="img" aria-label="Grafik akumulasi tabungan"><defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#177a5b" stop-opacity="0.25" /><stop offset="1" stop-color="#177a5b" stop-opacity="0" /></linearGradient></defs>${grid}<polygon points="${padL},${py(0).toFixed(1)} ${pts}${px(n).toFixed(1)},${py(0).toFixed(1)}" fill="url(#sg)" /><polyline points="${pts}" fill="none" stroke="#177a5b" stroke-width="3" stroke-linejoin="round" /><line x1="${padL}" y1="${targetY.toFixed(1)}" x2="${w - 16}" y2="${targetY.toFixed(1)}" stroke="#d9552c" stroke-width="2" stroke-dasharray="6 4" /><text x="${w - 20}" y="${(targetY - 6).toFixed(1)}" text-anchor="end" class="chart-target">Target ${formatRp(target)}</text><text x="${padL}" y="${h - 8}" class="chart-lab">Bulan 0</text><text x="${w - 16}" y="${h - 8}" text-anchor="end" class="chart-lab">Bulan ${n}</text></svg>`;
}
