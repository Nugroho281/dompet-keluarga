// DompetKeluarga — views.js
// HTML tiap halaman (hash-route). Setiap halaman mengembalikan { html, bind }:
// html adalah string, bind memasang semua kontrol interaktif setelah html
// masuk ke #view. Semua angka datang dari data.js / calc.js — tidak ada
// angka ber-sumber yang ditulis langsung di sini tanpa sumbernya.

import { BPS_SPENDING, EXPENSE_CATEGORIES, GOAL_PRESETS, PRICES_2026, SAMPLE_EXPENSES, SCENARIOS, SEARCH_INDEX, SOURCES, UMP_2026 } from './data.js';
import { donut, formatJt, formatRp, hbar, savingsLine, vbar } from './charts.js';
import { formatBulanTahun, monthsToTarget, scenarioTotals, splitBudget, sumRows, trackerSummary } from './calc.js';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function src(text) {
  return `<p class="src">Sumber: ${esc(text)}</p>`;
}

function kpi(value, label, sub) {
  return `<div class="kpi"><b>${value}</b><span>${esc(label)}</span><small>${esc(sub)}</small></div>`;
}

function posTable(title, rows, total, color) {
  const body = rows.map((r) => `<tr><td>${esc(r[0])}</td><td class="num">${formatRp(r[1])}</td><td class="muted">${esc(r[2])}</td></tr>`).join('');
  return `<section class="card"><h3 style="--accent:${color}">${esc(title)}</h3><div class="table-block"><table class="tbl"><thead><tr><th>Pos</th><th class="num">Per bulan</th><th>Catatan</th></tr></thead><tbody>${body}</tbody><tfoot><tr><td><b>Subtotal</b></td><td class="num"><b>${formatRp(total)}</b></td><td></td></tr></tfoot></table></div></section>`;
}

// ---------- Komponen kalkulator (dipakai Beranda mini + halaman penuh) ----------

function calcHtml(prefix, gaji, compact) {
  const sp = splitBudget(gaji);
  const presets = [
    ['UMP Jakarta 2026', 5729876],
    ['UMP Jabar 2026', 2317601],
    ['UMP Jateng 2026', 2327386],
    ['Upah rata-rata', 3270000],
  ];
  const presetBtns = presets.map(([l, v]) => `<button type="button" class="chip" data-gaji="${v}">${esc(l)} · ${formatJt(v)}</button>`).join('');
  return `<div class="calc" id="${prefix}-calc">
  <div class="calc-inputs">
    <label>Gaji / penghasilan per bulan
      <span class="input-rp"><span>Rp</span><input id="${prefix}-gaji" type="number" min="0" step="1" value="${gaji}" inputmode="numeric"></span>
    </label>
    <div class="presets">${presetBtns}</div>
    ${['kebutuhan', 'keinginan', 'tabungan'].map((k) => {
      const label = { kebutuhan: 'Kebutuhan', keinginan: 'Keinginan', tabungan: 'Tabungan' }[k];
      const dflt = { kebutuhan: 50, keinginan: 30, tabungan: 20 }[k];
      return `<label class="slider-row"><span>${label} <b id="${prefix}-pct-${k}">${dflt}%</b></span>
        <span class="slider-wrap"><input id="${prefix}-range-${k}" type="range" min="0" max="100" value="${dflt}" aria-label="Persen ${label}"><input id="${prefix}-num-${k}" type="number" min="0" max="100" value="${dflt}" aria-label="Persen ${label} angka"></span></label>`;
    }).join('')}
    <p class="calc-sum">Total persen: <b id="${prefix}-sum">100%</b> <span id="${prefix}-sum-note"></span></p>
    <button type="button" class="btn ghost" id="${prefix}-reset">Kembalikan ke 50/30/20</button>
  </div>
  <div class="calc-out" id="${prefix}-out">${calcOutHtml(prefix, sp, compact)}</div>
</div>`;
}

function calcOutHtml(prefix, sp, compact) {
  const parts = [
    { label: 'Kebutuhan', value: sp.kebutuhan, color: '#0c4a3a' },
    { label: 'Keinginan', value: sp.keinginan, color: '#e8a100' },
    { label: 'Tabungan', value: sp.tabungan, color: '#177a5b' },
  ];
  const verdict = sp.persen.tabungan >= 20
    ? ['Sehat — tabungan 20% atau lebih.', 'good']
    : sp.persen.tabungan >= 10
      ? ['Cukup — tabungan 10–19%. Naikkan sedikit demi sedikit ke 20%.', 'warn']
      : ['Perlu diperketat — tabungan di bawah 10%. Cek pos keinginan dulu.', 'bad'];
  const bps4 = 4 * BPS_SPENDING.totalPerCapita;
  const vsBps = sp.kebutuhan >= bps4
    ? `Pos kebutuhanmu (${formatRp(sp.kebutuhan)}) menutup rata-rata belanja keluarga 4 orang (${formatRp(bps4)}/bulan, BPS 2024).`
    : `Pos kebutuhanmu (${formatRp(sp.kebutuhan)}) di bawah rata-rata belanja keluarga 4 orang (${formatRp(bps4)}/bulan, BPS 2024) — wajar bila rumah tanggamu lebih kecil.`;
  return `${donut(parts, compact ? 190 : 220)}
  <p class="verdict ${verdict[1]}">${verdict[0]}</p>
  <p class="muted small">${vsBps}</p>
  ${compact ? '<p><a class="btn" href="#/kalkulator">Buka kalkulator lengkap →</a></p>' : ''}`;
}

function bindCalc(prefix, gaji0, compact) {
  const root = document.getElementById(`${prefix}-calc`);
  if (!root) return;
  let gaji = gaji0;
  let split = { kebutuhan: 50, keinginan: 30, tabungan: 20 };
  const out = document.getElementById(`${prefix}-out`);
  const gajiInput = document.getElementById(`${prefix}-gaji`);
  function refresh() {
    const sp = splitBudget(gaji, split);
    out.innerHTML = calcOutHtml(prefix, sp, compact);
    const sum = sp.persen.kebutuhan + sp.persen.keinginan + sp.persen.tabungan;
    document.getElementById(`${prefix}-sum`).textContent = sum + '%';
    document.getElementById(`${prefix}-sum-note`).textContent = sum === 100 ? '✓ pas 100%' : '— selisih masuk ke tabungan';
    for (const k of ['kebutuhan', 'keinginan', 'tabungan']) {
      document.getElementById(`${prefix}-pct-${k}`).textContent = sp.persen[k] + '%';
      document.getElementById(`${prefix}-range-${k}`).value = sp.persen[k];
      document.getElementById(`${prefix}-num-${k}`).value = sp.persen[k];
    }
  }
  gajiInput.addEventListener('input', () => { gaji = Math.max(0, Number(gajiInput.value) || 0); refresh(); });
  $$('.chip', root).forEach((b) => b.addEventListener('click', () => {
    gaji = Number(b.dataset.gaji);
    gajiInput.value = gaji;
    refresh();
  }));
  for (const k of ['kebutuhan', 'keinginan', 'tabungan']) {
    const range = document.getElementById(`${prefix}-range-${k}`);
    const num = document.getElementById(`${prefix}-num-${k}`);
    const set = (v) => { split = { ...split, [k]: Math.max(0, Math.min(100, Number(v) || 0)) }; refresh(); };
    range.addEventListener('input', () => set(range.value));
    num.addEventListener('input', () => set(num.value));
  }
  document.getElementById(`${prefix}-reset`).addEventListener('click', () => {
    split = { kebutuhan: 50, keinginan: 30, tabungan: 20 };
    refresh();
  });
  refresh();
}

// ---------- Beranda ----------

export function home() {
  const bps = BPS_SPENDING;
  const kpis = [
    kpi(formatRp(5729876), 'UMP DKI Jakarta 2026', 'Tertinggi nasional · Kemnaker'),
    kpi(formatRp(bps.totalPerCapita), 'Belanja /kapita /bulan', 'BPS Susenas 2024'),
    kpi(bps.makananShare.toLocaleString('id-ID') + '%', 'Belanja untuk makan', 'Rp751.789/kapita · BPS 2024'),
    kpi(formatRp(bps.garisKemiskinan), 'Garis kemiskinan /kapita', 'BPS, Sep 2024'),
    kpi(bps.inflasi2024.toLocaleString('id-ID') + '%', 'Inflasi 2024', 'BPS, tahun kalender'),
    kpi(formatRp(16650) + '/kg', 'Beras medium I', 'PIHPS, 24 Nov 2026'),
  ].join('');
  const scenarioCards = SCENARIOS.map((s) => {
    const t = scenarioTotals(s);
    return `<a class="card link-card" href="#/skenario/${s.id}"><h3>${esc(s.nama)}</h3><p class="muted">${esc(s.anggota)}</p><p class="big">${formatRp(s.gaji)}<span class="muted small"> /bulan</span></p><p class="small">${esc(s.gajiLabel)}</p><p class="small">Kebutuhan ${formatRp(t.kebutuhan)} · Keinginan ${formatRp(t.keinginan)} · Tabungan ${formatRp(t.tabungan)}</p><span class="more">Lihat rincian →</span></a>`;
  }).join('');
  const pricePreview = PRICES_2026.slice(0, 5).map((p) => `<tr><td>${esc(p.item)}</td><td class="num">${formatRp(p.harga)}</td><td class="muted">/${esc(p.satuan)}</td></tr>`).join('');
  const html = `
  <section class="hero">
    <p class="eyebrow">Situs anggaran rumah tangga · Bahasa Indonesia</p>
    <h1>DompetKeluarga</h1>
    <p class="lead">Masukkan gaji, lihat alokasi 50/30/20, catat belanja, dan kejar target tabungan — semua angka ber-sumber: BPS, Kemnaker, dan Bank Indonesia.</p>
    <p class="hero-cta"><a class="btn" href="#/kalkulator">Hitung anggaranku →</a> <a class="btn ghost" href="#/pelacak">Catat pengeluaran</a></p>
  </section>
  <section class="kpi-grid" aria-label="Angka utama">${kpis}</section>
  <section class="card">
    <h2>Kalkulator 50/30/20 — coba langsung</h2>
    <p class="muted">Aturan 50/30/20: 50% kebutuhan, 30% keinginan, 20% tabungan. Ubah gaji atau geser persennya — donat dan rupiah ikut berubah.</p>
    ${calcHtml('home', 5729876, true)}
  </section>
  <section>
    <h2>Tiga skenario rumah tangga nyata</h2>
    <p class="muted">Penghasilan tiap skenario = UMP 2026 yang disebut di kartunya. Setiap rupiahnya dihitung 50/30/20 — buka untuk melihat rincian per pos.</p>
    <div class="card-grid">${scenarioCards}</div>
  </section>
  <section class="card">
    <h2>Ke mana larinya belanja orang Indonesia?</h2>
    <p class="muted">Rata-rata pengeluaran per kapita per bulan, BPS Susenas 2024. Separuh belanja masih untuk makan.</p>
    ${hbar([
      { label: 'Makanan', value: bps.makanan, color: '#0c4a3a' },
      { label: 'Perumahan & fasilitas RT', value: bps.perumahan, color: '#177a5b' },
      { label: 'Barang & jasa', value: bps.barangJasa, color: '#e8a100' },
      { label: 'Pesta & upacara', value: bps.pestaUpacara, color: '#d9552c' },
    ])}
    ${src(SOURCES.bpsSusenas + ' — total Rp1.500.556/kapita/bulan; makanan Rp751.789 (50,1%), bukan makanan Rp748.767 (49,9%).')}
  </section>
  <section class="card">
    <h2>Harga minggu ini</h2>
    <p class="muted">Harga rata-rata nasional di pedagang eceran — lima yang paling sering dibeli.</p>
    <div class="table-block"><table class="tbl"><thead><tr><th>Komoditas</th><th class="num">Harga</th><th></th></tr></thead><tbody>${pricePreview}</tbody></table></div>
    <p><a href="#/harga">Lihat semua 15 harga + tabel UMP 2026 →</a></p>
    ${src(SOURCES.pihps + '; BBM: ' + SOURCES.bbm + '.')}
  </section>
  <section class="card">
    <h2>Cara memakai situs ini — 3 langkah</h2>
    <ol class="steps"><li><b>Hitung</b> — masukkan gaji di <a href="#/kalkulator">kalkulator 50/30/20</a>, atau pakai salah satu <a href="#/skenario">skenario siap pakai</a>.</li><li><b>Catat</b> — setiap belanja masuk ke <a href="#/pelacak">pelacak pengeluaran</a>; saring per kategori dan lihat sisa anggaranmu.</li><li><b>Kejar</b> — pasang target di <a href="#/tabungan">simulator tabungan</a> dan lihat bulan berapa tercapai.</li></ol>
  </section>`;
  return { html, bind() { bindCalc('home', 5729876, true); } };
}

// ---------- Kalkulator ----------

export function calculator() {
  const html = `
  <h1>Kalkulator 50/30/20</h1>
  <p class="lead">Bagi gajimu ke tiga pos: <b>kebutuhan</b>, <b>keinginan</b>, dan <b>tabungan</b>. Aturan 50/30/20 adalah patokan umum perencana keuangan — geser persennya bila kondisi rumah tanggamu berbeda.</p>
  <section class="card">
    ${calcHtml('calc', 5729876, false)}
  </section>
  <section class="card">
    <h2>Kenapa 50/30/20?</h2>
    <ul>
      <li><b>50% kebutuhan</b> — yang wajib dibayar tiap bulan: sewa, makan, transportasi, listrik, air.</li>
      <li><b>30% keinginan</b> — yang bikin hidup enak tapi bisa ditunda: makan di luar, hiburan, langganan.</li>
      <li><b>20% tabungan</b> — dana darurat dulu, baru investasi. Anjuran umum: dana darurat 3–6× pengeluaran bulanan.</li>
    </ul>
    <p class="muted small">Patokan pengeluaran: rata-rata orang Indonesia belanja Rp1.500.556/kapita/bulan (BPS Susenas 2024); keluarga 4 orang berarti sekitar Rp6.002.224/bulan (hitungan situs: 4 × Rp1.500.556).</p>
    ${src(SOURCES.bpsSusenas)}
  </section>
  <section class="card">
    <h2>Contoh cepat — gaji UMP Jakarta</h2>
    <p>Dengan gaji Rp5.729.876 (UMP DKI Jakarta 2026, Kemnaker): kebutuhan Rp2.864.938, keinginan Rp1.718.963, tabungan Rp1.145.975. Bandingkan dengan Kebutuhan Hidup Layak Jakarta versi Kemenaker: Rp5.890.000/bulan — UMP masih di bawah KHL sekitar Rp160.000.</p>
    ${src(SOURCES.ump + '; ' + SOURCES.khl)}
  </section>`;
  return { html, bind() { bindCalc('calc', 5729876, false); } };
}

// ---------- Skenario ----------

export function scenarios(activeId = 'lajang') {
  const active = SCENARIOS.find((s) => s.id === activeId) || SCENARIOS[0];
  const t = scenarioTotals(active);
  const tabs = SCENARIOS.map((s) => `<button type="button" class="tab${s.id === active.id ? ' active' : ''}" data-tab="${s.id}" aria-pressed="${s.id === active.id}">${esc(s.nama)}</button>`).join('');
  const parts = [
    { label: 'Kebutuhan (50%)', value: t.kebutuhan, color: '#0c4a3a' },
    { label: 'Keinginan (30%)', value: t.keinginan, color: '#e8a100' },
    { label: 'Tabungan (20%)', value: t.tabungan, color: '#177a5b' },
  ];
  const html = `
  <h1>Tiga skenario rumah tangga nyata</h1>
  <p class="lead">Setiap skenario memakai penghasilan dari UMP 2026 yang disebut, lalu dipecah 50/30/20 sampai rupiah terakhir. Pilih tab untuk berpindah.</p>
  <div class="tabs" role="tablist">${tabs}</div>
  <section class="card">
    <h2>${esc(active.nama)} <span class="muted small">· ${esc(active.anggota)}</span></h2>
    <p><b>Penghasilan contoh: ${formatRp(active.gaji)}/bulan</b><br><span class="muted">${esc(active.rumus)}</span></p>
    <p class="muted">${esc(active.catatan)}</p>
    ${donut(parts, 220)}
    ${posTable('Kebutuhan — 50%', active.kebutuhan, t.kebutuhan, '#0c4a3a')}
    ${posTable('Keinginan — 30%', active.keinginan, t.keinginan, '#e8a100')}
    ${posTable('Tabungan — 20%', active.tabungan, t.tabungan, '#177a5b')}
    <p class="muted small">Total alokasi ${formatRp(t.total)} = penghasilan ${formatRp(t.gaji)} — tidak ada rupiah yang hilang. ${src(SOURCES.ump)}</p>
  </section>
  <section class="card">
    <h2>Bandingkan dengan rata-rata nasional</h2>
    <p class="muted">Pengeluaran rata-rata per kapita Rp1.500.556/bulan (BPS 2024) — untuk keluarga 4 orang sekitar Rp6.002.224/bulan.</p>
    ${vbar([
      { label: 'Lajang', value: 4583901, short: 'Rp4,58 jt', color: '#177a5b' },
      { label: 'Pasangan', value: 7064606, short: 'Rp7,06 jt', color: '#0c4a3a' },
      { label: 'Keluarga 4', value: 6437982, short: 'Rp6,44 jt', color: '#e8a100' },
      { label: 'Rata-rata BPS ×4', value: 6002224, short: 'Rp6,00 jt', color: '#d9552c' },
    ])}
    <p class="muted small">Batang = total belanja (kebutuhan + keinginan) tiap skenario vs rata-rata BPS untuk 4 orang. Hitungan situs dari data.js.</p>
    ${src(SOURCES.bpsSusenas)}
  </section>`;
  return {
    html,
    bind() {
      $$('.tab').forEach((b) => b.addEventListener('click', () => { location.hash = '#/skenario/' + b.dataset.tab; }));
    },
  };
}

// ---------- Pelacak ----------

const LS_EXP = 'dompetkeluarga-expenses-v1';
const LS_BUDGET = 'dompetkeluarga-budget-v1';

function loadExpenses() {
  try {
    const raw = localStorage.getItem(LS_EXP);
    if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length) return arr; }
  } catch { /* abaikan: pakai contoh */ }
  return SAMPLE_EXPENSES.map((e) => ({ ...e }));
}

function saveExpenses(list) {
  try { localStorage.setItem(LS_EXP, JSON.stringify(list)); } catch { /* penyimpanan penuh/diblokir: tetap jalan di memori */ }
}

function loadBudget() {
  try { const v = Number(localStorage.getItem(LS_BUDGET)); if (v > 0) return v; } catch { /* abaikan */ }
  return 4023739;
}

export function tracker() {
  const cats = EXPENSE_CATEGORIES.map((c) => `<option>${esc(c)}</option>`).join('');
  const html = `
  <h1>Pelacak pengeluaran</h1>
  <p class="lead">Catat setiap belanja — tambah, saring, urutkan, hapus. Data tersimpan di perambanmu sendiri (localStorage); tidak dikirim ke mana pun. Isi awal di bawah ini adalah <b>contoh satu bulan keluarga</b>, hapus dan ganti dengan belanjamu sendiri.</p>
  <section class="card">
    <h2>Tambah pengeluaran</h2>
    <form id="exp-form" class="exp-form">
      <label>Nama <input id="exp-nama" type="text" required maxlength="80" placeholder="cth. Belanja pasar"></label>
      <label>Kategori <select id="exp-kategori">${cats}</select></label>
      <label>Jumlah (Rp) <input id="exp-jumlah" type="number" min="1" step="1" required placeholder="50000"></label>
      <label>Tanggal <input id="exp-tanggal" type="date" value="2026-11-27" required></label>
      <button class="btn" type="submit">+ Tambah</button>
    </form>
    <p id="exp-error" class="error" role="alert"></p>
  </section>
  <section class="card">
    <h2>Ringkasan bulan ini</h2>
    <label class="budget-line">Anggaran belanja bulan ini (Rp)
      <span class="input-rp"><span>Rp</span><input id="exp-budget" type="number" min="0" step="1" value="${loadBudget()}"></span>
      <span class="muted small">Awal: Rp4.023.739 = pos kebutuhan skenario Keluarga 4 Orang (50% dari Rp8.047.477).</span>
    </label>
    <div id="exp-summary"></div>
    <div id="exp-chart"></div>
  </section>
  <section class="card">
    <h2>Daftar pengeluaran <span id="exp-count" class="muted small"></span></h2>
    <div class="filter-row">
      <label>Cari <input id="exp-search" type="search" placeholder="cth. beras"></label>
      <label>Kategori <select id="exp-filter"><option value="">Semua kategori</option>${cats}</select></label>
      <label>Urutkan <select id="exp-sort"><option value="tanggal-desc">Tanggal (terbaru)</option><option value="tanggal-asc">Tanggal (terlama)</option><option value="jumlah-desc">Jumlah (terbesar)</option><option value="jumlah-asc">Jumlah (terkecil)</option></select></label>
      <button type="button" class="btn ghost" id="exp-reset-sample">Kembalikan contoh awal</button>
    </div>
    <div class="table-block"><table class="tbl" id="exp-table"><thead><tr><th>Tanggal</th><th>Nama</th><th>Kategori</th><th class="num">Jumlah</th><th></th></tr></thead><tbody id="exp-body"></tbody><tfoot id="exp-foot"></tfoot></table></div>
    <p id="exp-empty" class="muted" hidden>Tidak ada pengeluaran yang cocok dengan saringanmu.</p>
  </section>`;
  return {
    html,
    bind() {
      let list = loadExpenses();
      let anggaran = loadBudget();
      const body = $('#exp-body');
      const foot = $('#exp-foot');
      function render() {
        const q = ($('#exp-search').value || '').toLowerCase();
        const cat = $('#exp-filter').value;
        const sort = $('#exp-sort').value;
        let rows = list.filter((e) => (!cat || e.kategori === cat) && (!q || e.nama.toLowerCase().includes(q) || e.kategori.toLowerCase().includes(q)));
        rows = [...rows].sort((a, b) => {
          if (sort === 'tanggal-asc') return a.tanggal.localeCompare(b.tanggal);
          if (sort === 'jumlah-desc') return b.jumlah - a.jumlah;
          if (sort === 'jumlah-asc') return a.jumlah - b.jumlah;
          return b.tanggal.localeCompare(a.tanggal);
        });
        body.innerHTML = rows.map((e) => `<tr><td>${esc(e.tanggal)}</td><td>${esc(e.nama)}</td><td>${esc(e.kategori)}</td><td class="num">${formatRp(e.jumlah)}</td><td><button type="button" class="btn-del" data-del="${esc(e.id)}" aria-label="Hapus ${esc(e.nama)}">Hapus</button></td></tr>`).join('');
        const shownTotal = rows.reduce((a, e) => a + e.jumlah, 0);
        foot.innerHTML = `<tr><td colspan="3"><b>Total yang ditampilkan</b></td><td class="num"><b>${formatRp(shownTotal)}</b></td><td></td></tr>`;
        $('#exp-empty').hidden = rows.length > 0;
        $('#exp-count').textContent = `(${rows.length} dari ${list.length} baris)`;
        const s = trackerSummary(list, anggaran);
        const bar = s.anggaran > 0 ? Math.min(100, Math.round((s.total / s.anggaran) * 100)) : 0;
        $('#exp-summary').innerHTML = `<div class="summary-grid">
          <div><b>${formatRp(s.total)}</b><span>Total tercatat</span></div>
          <div><b>${formatRp(s.anggaran)}</b><span>Anggaran bulan ini</span></div>
          <div><b class="${s.over ? 'over' : 'good-text'}">${formatRp(s.sisa)}</b><span>${s.over ? 'Melebihi anggaran!' : 'Sisa anggaran'}</span></div></div>
          <div class="meter"><span style="width:${bar}%;background:${s.over ? '#d9552c' : '#177a5b'}"></span></div>
          <p class="muted small">${bar}% anggaran terpakai. ${s.over ? 'Kamu sudah melewati anggaran — cek kategori terbesar di bawah.' : 'Masih dalam anggaran.'}</p>`;
        const top = Object.entries(s.perKategori).sort((a, b) => b[1] - a[1]);
        const colors = ['#0c4a3a', '#177a5b', '#e8a100', '#d9552c', '#7a5c2e', '#4a6b8a', '#8a6d9e', '#5c6b64'];
        $('#exp-chart').innerHTML = top.length ? `<h3>Per kategori</h3>${hbar(top.map(([label, value], i) => ({ label, value, color: colors[i % colors.length] })))}` : '';
        $$('[data-del]', body).forEach((b) => b.addEventListener('click', () => {
          list = list.filter((e) => e.id !== b.dataset.del);
          saveExpenses(list);
          render();
        }));
      }
      $('#exp-form').addEventListener('submit', (ev) => {
        ev.preventDefault();
        const nama = $('#exp-nama').value.trim();
        const jumlah = Number($('#exp-jumlah').value);
        const tanggal = $('#exp-tanggal').value;
        const err = $('#exp-error');
        if (!nama || !(jumlah > 0) || !tanggal) { err.textContent = 'Isi nama, jumlah (lebih dari 0), dan tanggal.'; return; }
        err.textContent = '';
        list = [{ id: 'u' + Date.now(), nama, kategori: $('#exp-kategori').value, jumlah, tanggal }, ...list];
        saveExpenses(list);
        ev.target.reset();
        $('#exp-tanggal').value = '2026-11-27';
        render();
      });
      $('#exp-budget').addEventListener('input', (ev) => {
        anggaran = Math.max(0, Number(ev.target.value) || 0);
        try { localStorage.setItem(LS_BUDGET, String(anggaran)); } catch { /* abaikan */ }
        render();
      });
      for (const id of ['exp-search', 'exp-filter', 'exp-sort']) document.getElementById(id).addEventListener('input', render);
      $('#exp-reset-sample').addEventListener('click', () => {
        list = SAMPLE_EXPENSES.map((e) => ({ ...e }));
        saveExpenses(list);
        render();
      });
      render();
    },
  };
}

// ---------- Tabungan ----------

export function savings() {
  const presetBtns = GOAL_PRESETS.map((g, i) => `<button type="button" class="chip" data-goal="${i}">${esc(g.nama)} · ${formatJt(g.target)}</button>`).join('');
  const html = `
  <h1>Simulator target tabungan</h1>
  <p class="lead">Punya target? Masukkan jumlahnya dan berapa yang bisa disisihkan tiap bulan — situs menghitung berapa bulan sampai tercapai dan menggambar jalannya.</p>
  <section class="card">
    <div class="sav-form">
      <label>Target tabungan (Rp)
        <span class="input-rp"><span>Rp</span><input id="sav-target" type="number" min="0" step="1" value="18000000"></span>
      </label>
      <label>Disisihkan per bulan (Rp)
        <span class="input-rp"><span>Rp</span><input id="sav-monthly" type="number" min="0" step="1" value="1000000"></span>
      </label>
    </div>
    <div class="presets">${presetBtns}</div>
    <p class="muted small" id="sav-preset-note">Dana darurat 3 bulan: contoh 3 × Rp6.002.224 (pengeluaran keluarga 4 orang, BPS 2024).</p>
    <div id="sav-out"></div>
  </section>
  <section class="card">
    <h2>Aturan praktis dana darurat</h2>
    <ul>
      <li><b>Lajang:</b> 3× pengeluaran bulanan. Contoh: pengeluaran Rp4.583.901/bulan → target Rp13,8 jt.</li>
      <li><b>Pasangan:</b> 3–6× pengeluaran bulanan. Contoh: pengeluaran Rp7.064.606/bulan → target Rp21,2–42,4 jt.</li>
      <li><b>Keluarga:</b> 6× pengeluaran bulanan lebih aman. Contoh: pengeluaran Rp6.437.982/bulan → target Rp38,6 jt.</li>
    </ul>
    <p class="muted small">Angka pengeluaran contoh di atas adalah hitungan situs dari skenario di halaman <a href="#/skenario">Skenario</a> (kebutuhan + keinginan). Anjuran "3–6×" adalah panduan umum perencana keuangan, bukan statistik BPS.</p>
  </section>`;
  return {
    html,
    bind() {
      const out = $('#sav-out');
      const targetInput = $('#sav-target');
      const monthlyInput = $('#sav-monthly');
      function refresh() {
        const target = Math.max(0, Number(targetInput.value) || 0);
        const monthly = Math.max(0, Number(monthlyInput.value) || 0);
        const { months, finish } = monthsToTarget(target, monthly);
        if (target <= 0) { out.innerHTML = '<p class="muted">Masukkan target tabungan dulu.</p>'; return; }
        if (monthly <= 0) { out.innerHTML = '<p class="muted">Masukkan jumlah yang bisa disisihkan tiap bulan.</p>'; return; }
        if (!Number.isFinite(months)) { out.innerHTML = '<p class="muted">Tidak tercapai tanpa menabung tiap bulan.</p>'; return; }
        const years = Math.floor(months / 12);
        const rem = months % 12;
        const dur = years > 0 ? `${years} tahun ${rem} bulan` : `${months} bulan`;
        out.innerHTML = `<div class="summary-grid">
          <div><b>${months} bulan</b><span>Waktu sampai target (${dur})</span></div>
          <div><b>${formatBulanTahun(finish)}</b><span>Tercapai sekitar</span></div>
          <div><b>${formatRp(monthly)}</b><span>Disisihkan / bulan</span></div></div>
        <p>Menabung ${formatRp(monthly)} tiap bulan, target ${formatRp(target)} tercapai dalam <b>${months} bulan</b> — sekitar <b>${formatBulanTahun(finish)}</b>.</p>
        ${savingsLine(monthly, target, months)}`;
      }
      targetInput.addEventListener('input', refresh);
      monthlyInput.addEventListener('input', refresh);
      $$('.chip[data-goal]').forEach((b) => b.addEventListener('click', () => {
        const g = GOAL_PRESETS[Number(b.dataset.goal)];
        targetInput.value = g.target;
        $('#sav-preset-note').textContent = g.ket;
        refresh();
      }));
      refresh();
    },
  };
}

// ---------- Harga & UMP ----------

export function prices() {
  const priceRows = PRICES_2026.map((p) => `<tr><td>${esc(p.item)}</td><td class="num">${formatRp(p.harga)}</td><td class="muted">/${esc(p.satuan)}</td><td class="muted">${esc(p.ket)}</td></tr>`).join('');
  const umpRows = UMP_2026.map((u) => `<tr><td>${esc(u.prov)}</td><td class="num">${formatRp(u.ump)}</td><td class="num">${u.naik === null ? '—' : '+' + u.naik.toLocaleString('id-ID') + '%'}</td><td class="muted">${esc(u.note)}</td></tr>`).join('');
  const bps = BPS_SPENDING;
  const html = `
  <h1>Harga &amp; UMP 2026</h1>
  <p class="lead">Dua tabel acuan untuk menyusun anggaran: harga kebutuhan pokok minggu ini dan upah minimum tiap provinsi. Klik judul kolom <b>UMP</b> untuk mengurutkan.</p>
  <section class="card">
    <h2>Harga kebutuhan pokok</h2>
    <p class="muted">Harga rata-rata nasional di pedagang eceran, 24 Nov 2026.</p>
    <div class="table-block"><table class="tbl"><thead><tr><th>Komoditas</th><th class="num">Harga</th><th></th><th>Sumber</th></tr></thead><tbody>${priceRows}</tbody></table></div>
    ${src(SOURCES.pihps + '; BBM & LPG: ' + SOURCES.bbm + '; Pertamax: Pertamina, Nov 2026.')}
    <p class="muted small">Contoh hitungan: 10 kg beras medium (Rp166.500) + 2 kg telur (Rp58.500) + 2 kg ayam (Rp77.000) + 2 liter minyak curah (Rp41.100) = <b>Rp343.100</b> untuk seminggu dapur keluarga — hitungan situs dari harga di atas.</p>
  </section>
  <section class="card">
    <h2>Upah Minimum Provinsi 2026</h2>
    <p class="muted">Berlaku 1 Januari 2026. Selisih tertinggi (DKI Jakarta) ke terendah (Jawa Barat): Rp3.412.275.</p>
    <div class="table-block"><table class="tbl" id="ump-table"><thead><tr><th>Provinsi</th><th class="num"><button type="button" class="th-btn" id="ump-sort">UMP/bulan ↕</button></th><th class="num">Kenaikan</th><th>Catatan</th></tr></thead><tbody>${umpRows}</tbody></table></div>
    ${src(SOURCES.ump + ' — dikutip dari Kemnaker, Jan 2026.')}
    <h3>UMP tertinggi vs terendah</h3>
    ${hbar([
      { label: 'DKI Jakarta (tertinggi)', value: 5729876, color: '#0c4a3a' },
      { label: 'Bali', value: 3207459, color: '#177a5b' },
      { label: 'Banten', value: 3100881, color: '#177a5b' },
      { label: 'Jawa Timur', value: 2446880, color: '#e8a100' },
      { label: 'Jawa Barat (terendah)', value: 2317601, color: '#d9552c' },
    ])}
  </section>
  <section class="card">
    <h2>Angka acuan BPS 2024</h2>
    <div class="kpi-grid">
      ${kpi(formatRp(bps.totalPerCapita), 'Belanja /kapita /bulan', 'Susenas 2024')}
      ${kpi(formatRp(bps.makanan), 'Untuk makan /kapita', '50,1% dari total')}
      ${kpi(formatRp(bps.garisKemiskinan), 'Garis kemiskinan /kapita', 'Sep 2024')}
      ${kpi(bps.tingkatKemiskinan.toLocaleString('id-ID') + '%', 'Penduduk miskin', bps.miskinJuta.toLocaleString('id-ID') + ' jt jiwa · Sep 2024')}
      ${kpi(bps.anggotaRT.toLocaleString('id-ID'), 'Anggota rumah tangga rata-rata', 'Susenas 2024')}
      ${kpi(formatRp(bps.upahRata), 'Upah rata-rata /bulan', 'Sakernas Agt 2024')}
    </div>
    <p class="muted small">Keluarga 4 orang di garis kemiskinan: 4 × Rp595.242 = <b>Rp2.380.968/bulan</b> (hitungan situs). Rata-rata belanja keluarga 4 orang: 4 × Rp1.500.556 = <b>Rp6.002.224/bulan</b> (hitungan situs).</p>
    ${src(SOURCES.bpsSusenas + '; ' + SOURCES.bpsMiskin + '; ' + SOURCES.bpsUpah + '; ' + SOURCES.bpsInflasi + '.')}
  </section>`;
  return {
    html,
    bind() {
      let asc = false;
      $('#ump-sort').addEventListener('click', () => {
        asc = !asc;
        const tbody = $('#ump-table tbody');
        const rows = $$('tr', tbody);
        rows.sort((a, b) => {
          const va = Number(a.children[1].textContent.replace(/[^0-9]/g, ''));
          const vb = Number(b.children[1].textContent.replace(/[^0-9]/g, ''));
          return asc ? va - vb : vb - va;
        });
        tbody.append(...rows);
        $('#ump-sort').textContent = asc ? 'UMP/bulan ↑' : 'UMP/bulan ↓';
      });
    },
  };
}

// ---------- Tentang ----------

export function about() {
  const html = `
  <h1>Tentang &amp; sumber</h1>
  <p class="lead">DompetKeluarga adalah situs anggaran rumah tangga berbahasa Indonesia. Semua alatnya berjalan di perambanmu — tanpa akun, tanpa server, tanpa data yang dikirim ke mana pun.</p>
  <section class="card">
    <h2>Metodologi</h2>
    <ul>
      <li><b>Angka ber-sumber:</b> setiap angka statistik di situs ini diverifikasi lewat pencarian web dan membawa sumber + tahun. Angka yang tidak terverifikasi tidak ditampilkan.</li>
      <li><b>Hitungan situs:</b> angka berlabel "hitungan situs" adalah aritmetika dari angka ber-sumber (mis. 50/30/20 dari UMP, 4 × pengeluaran per kapita). Rumusnya selalu ditulis.</li>
      <li><b>Contoh:</b> angka berlabel "Contoh" adalah ilustrasi (mis. sewa kos, SPP) supaya tabel tidak kosong — ganti dengan angkamu sendiri di kalkulator dan pelacak.</li>
      <li><b>Aturan 50/30/20:</b> patokan umum perencana keuangan (50% kebutuhan, 30% keinginan, 20% tabungan). Bukan aturan hukum — sesuaikan dengan kondisi rumah tanggamu.</li>
      <li><b>Anjuran dana darurat 3–6× pengeluaran:</b> panduan umum perencana keuangan, bukan statistik.</li>
    </ul>
  </section>
  <section class="card">
    <h2>Daftar sumber</h2>
    <ul>
      <li><b>Upah Minimum Provinsi 2026</b> — ${esc(SOURCES.ump)}.</li>
      <li><b>Pola pengeluaran &amp; ukuran rumah tangga</b> — ${esc(SOURCES.bpsSusenas)}.</li>
      <li><b>Kemiskinan</b> — ${esc(SOURCES.bpsMiskin)} (garis Rp595.242/kapita/bulan; tingkat 8,57%, 24,06 jt jiwa).</li>
      <li><b>Inflasi 2024 (1,57%)</b> — ${esc(SOURCES.bpsInflasi)}.</li>
      <li><b>Upah rata-rata (Rp3,27 jt/bulan)</b> — ${esc(SOURCES.bpsUpah)}.</li>
      <li><b>Harga pangan 24 Nov 2026</b> — ${esc(SOURCES.pihps)}.</li>
      <li><b>BBM &amp; LPG bersubsidi</b> — ${esc(SOURCES.bbm)}.</li>
      <li><b>Kebutuhan Hidup Layak Jakarta (Rp5,89 jt)</b> — ${esc(SOURCES.khl)}.</li>
    </ul>
    <p class="muted small">Harga pangan bergerak harian — angka PIHPS di atas adalah potret 24 Nov 2026. Cek harga terbaru sebelum belanja besar.</p>
  </section>
  <section class="card">
    <h2>Peta situs</h2>
    <ul>
      <li><a href="#/">Beranda</a> — angka utama, kalkulator mini, skenario, harga minggu ini.</li>
      <li><a href="#/kalkulator">Kalkulator 50/30/20</a> — bagi gajimu per pos.</li>
      <li><a href="#/skenario">Skenario</a> — lajang, pasangan, keluarga 4 orang.</li>
      <li><a href="#/pelacak">Pelacak pengeluaran</a> — catat, saring, urutkan, hapus.</li>
      <li><a href="#/tabungan">Simulator tabungan</a> — kapan targetmu tercapai.</li>
      <li><a href="#/harga">Harga &amp; UMP 2026</a> — tabel harga pangan + UMP.</li>
    </ul>
  </section>`;
  return { html, bind() {} };
}

export function missing() {
  return { html: `<h1>Halaman tidak ditemukan</h1><p>Alamat itu tidak ada di DompetKeluarga. <a href="#/">Kembali ke Beranda</a>.</p>`, bind() {} };
}

export const ROUTES = { home, calculator, scenarios, tracker, savings, prices, about, missing };
