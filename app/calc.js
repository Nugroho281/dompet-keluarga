// DompetKeluarga — calc.js
// Semua hitungan anggaran di satu tempat, supaya views.js hanya merangkai
// HTML. Tidak ada angka "ajaib" di sini: persentase default 50/30/20 adalah
// aturan anggaran yang dinamai di halaman, dan setiap hitungan diberi label.

export const DEFAULT_SPLIT = { kebutuhan: 50, keinginan: 30, tabungan: 20 };

// Bagi gaji bulanan ke tiga pos. Persen boleh diubah pengguna; bila jumlahnya
// bukan 100, sisanya ditampung di "tabungan" supaya total selalu sama dengan gaji.
export function splitBudget(gaji, split = DEFAULT_SPLIT) {
  const g = Math.max(0, Math.floor(Number(gaji) || 0));
  const k = Math.max(0, Math.min(100, Number(split.kebutuhan) || 0));
  const i = Math.max(0, Math.min(100, Number(split.keinginan) || 0));
  const t = Math.max(0, 100 - k - i);
  return {
    gaji: g,
    kebutuhan: Math.round((g * k) / 100),
    keinginan: Math.round((g * i) / 100),
    tabungan: Math.round((g * t) / 100),
    persen: { kebutuhan: k, keinginan: i, tabungan: t },
  };
}

// Jumlah semua baris [nama, jumlah, keterangan] dalam satu pos skenario.
export function sumRows(rows) {
  return rows.reduce((a, r) => a + (Number(r[1]) || 0), 0);
}

// Total satu skenario (tiga pos) + selisih terhadap gaji (harus 0 bila pas).
export function scenarioTotals(scenario) {
  const kebutuhan = sumRows(scenario.kebutuhan);
  const keinginan = sumRows(scenario.keinginan);
  const tabungan = sumRows(scenario.tabungan);
  return { kebutuhan, keinginan, tabungan, total: kebutuhan + keinginan + tabungan, gaji: scenario.gaji };
}

// Berapa bulan untuk mencapai target bila menabung tetap tiap bulan.
// Mengembalikan bulan (dibulatkan ke atas) + tanggal tercapai dari bulan ini.
export function monthsToTarget(target, perBulan, startDate = new Date()) {
  const t = Math.max(0, Number(target) || 0);
  const m = Math.max(0, Number(perBulan) || 0);
  if (t <= 0) return { months: 0, finish: null };
  if (m <= 0) return { months: Infinity, finish: null };
  const months = Math.ceil(t / m);
  const finish = new Date(startDate.getFullYear(), startDate.getMonth() + months, 1);
  return { months, finish };
}

export function formatBulanTahun(d) {
  if (!d) return '—';
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

// Ringkasan pelacak: total, per kategori, sisa vs anggaran bulanan.
export function trackerSummary(expenses, anggaranBulanan) {
  const total = expenses.reduce((a, e) => a + (Number(e.jumlah) || 0), 0);
  const perKategori = {};
  for (const e of expenses) {
    perKategori[e.kategori] = (perKategori[e.kategori] || 0) + (Number(e.jumlah) || 0);
  }
  const anggaran = Math.max(0, Number(anggaranBulanan) || 0);
  return { total, perKategori, anggaran, sisa: anggaran - total, over: anggaran > 0 && total > anggaran };
}
