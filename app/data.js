// DompetKeluarga — data.js
// Semua angka di sini TERVERIFIKASI lewat pencarian web (Nov 2026) dan
// masing-masing membawa sumber + tahun. Angka yang tidak terverifikasi
// TIDAK ditampilkan. Hitungan turunan (mis. 50/30/20 dari UMP) diberi
// label "hitungan situs" dan rumusnya ditulis di samping angkanya.

export const SOURCES = {
  ump: 'Kementerian Ketenagakerjaan (Kemnaker), daftar UMP 2026 — berlaku 1 Jan 2026',
  bpsSusenas: 'BPS, Susenas 2024 — Pengeluaran untuk Konsumsi Penduduk Indonesia',
  bpsMiskin: 'BPS, BRS Profil Kemiskinan, September 2024',
  bpsInflasi: 'BPS, inflasi tahun kalender 2024',
  bpsUpah: 'BPS, Sakernas Agustus 2024',
  pihps: 'Bank Indonesia, PIHPS Nasional — harga rata-rata eceran, 24 Nov 2026',
  bbm: 'Kementerian ESDM / Kemenkeu, Nov 2026 — harga dipertahankan s.d. 31 Des 2026',
  khl: 'Kementerian Ketenagakerjaan, Kebutuhan Hidup Layak (KHL) Jakarta 2026',
};

// Upah Minimum Provinsi 2026 (Rp/bulan). Sumber: Kemnaker, Jan 2026.
// Dipilih 9 provinsi: tertinggi, terendah, dan seluruh Jawa + Bali.
export const UMP_2026 = [
  { prov: 'DKI Jakarta', ump: 5729876, naik: 6.17, ump2025: 5396761, note: 'Tertinggi nasional' },
  { prov: 'Papua Selatan', ump: 4508850, naik: null, ump2025: null, note: 'Tertinggi ke-2' },
  { prov: 'Papua', ump: 4436283, naik: null, ump2025: null, note: '' },
  { prov: 'Bali', ump: 3207459, naik: 7.04, ump2025: 2996561, note: '' },
  { prov: 'Banten', ump: 3100881, naik: 6.74, ump2025: 2905119, note: '' },
  { prov: 'Jawa Timur', ump: 2446880, naik: 6.11, ump2025: 2305985, note: '' },
  { prov: 'DI Yogyakarta', ump: 2417495, naik: 6.78, ump2025: 2264080, note: '' },
  { prov: 'Jawa Tengah', ump: 2327386, naik: 7.28, ump2025: 2169349, note: '' },
  { prov: 'Jawa Barat', ump: 2317601, naik: 5.77, ump2025: 2191232, note: 'Terendah nasional' },
];

// Pola pengeluaran penduduk — BPS Susenas 2024 (Rp per kapita per bulan).
export const BPS_SPENDING = {
  totalPerCapita: 1500556,
  makanan: 751789,
  makananShare: 50.1,
  bukanMakanan: 748767,
  bukanMakananShare: 49.9,
  // Kelompok bukan makanan terbesar (Rp/kapita/bulan)
  perumahan: 391751,
  barangJasa: 180325,
  pestaUpacara: 28326,
  // Anggota rumah tangga rata-rata, Susenas 2024
  anggotaRT: 3.84,
  garisKemiskinan: 595242,
  tingkatKemiskinan: 8.57,
  miskinJuta: 24.06,
  inflasi2024: 1.57,
  upahRata: 3270000,
  khlJakarta: 5890000,
};

// Harga kebutuhan pokok — PIHPS Nasional, 24 Nov 2026 (rata-rata nasional).
export const PRICES_2026 = [
  { item: 'Beras medium I', harga: 16650, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Beras super I', harga: 17950, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Telur ayam ras', harga: 29250, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Daging ayam ras', harga: 38500, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Daging sapi kualitas I', harga: 151850, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Minyak goreng curah', harga: 20550, satuan: 'liter', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Minyak goreng kemasan bermerek I', harga: 24450, satuan: 'liter', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Gula pasir lokal', harga: 19500, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Bawang merah', harga: 40950, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Bawang putih', harga: 40200, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Cabai rawit merah', harga: 97550, satuan: 'kg', ket: 'PIHPS 24 Nov 2026' },
  { item: 'Pertalite', harga: 10000, satuan: 'liter', ket: 'ESDM, dipertahankan s.d. 31 Des 2026' },
  { item: 'Biosolar', harga: 6800, satuan: 'liter', ket: 'ESDM, dipertahankan s.d. 31 Des 2026' },
  { item: 'LPG 3 kg (pangkalan)', harga: 19000, satuan: 'tabung', ket: 'ESDM, dipertahankan s.d. 31 Des 2026' },
  { item: 'Pertamax (Jawa/Bali)', harga: 15950, satuan: 'liter', ket: 'Pertamina, Nov 2026' },
];

// Tiga skenario rumah tangga. Penghasilan = jumlah UMP 2026 yang disebut
// (hitungan situs, rumus ditulis). Alokasi = aturan 50/30/20 dari penghasilan.
export const SCENARIOS = [
  {
    id: 'lajang',
    nama: 'Lajang di Jakarta',
    anggota: '1 orang',
    gaji: 5729876,
    gajiLabel: 'UMP DKI Jakarta 2026',
    rumus: 'Rp5.729.876 (UMP DKI Jakarta 2026)',
    catatan: 'Satu penghasilan, satu mulut. Tantangan terbesarnya: sewa dan makan di luar.',
    kebutuhan: [
      ['Sewa kos / kontrakan', 1200000, 'Contoh: kos Jakarta, 1 kamar'],
      ['Makan & belanja dapur', 900000, 'Patokan: Rp751.789/kapita (BPS 2024) + harga PIHPS'],
      ['Transportasi', 350000, 'Contoh: 35 liter Pertalite × Rp10.000'],
      ['Listrik, air, internet', 300000, 'Contoh tagihan bulanan'],
      ['Pulsa & keperluan lain', 114938, 'Sisa pos kebutuhan'],
    ],
    keinginan: [
      ['Makan di luar & nongkrong', 700000, 'Contoh mingguan'],
      ['Hiburan & langganan', 350000, 'Streaming, gim, musik'],
      ['Belanja & gaya hidup', 668963, 'Sisa pos keinginan'],
    ],
    tabungan: [
      ['Dana darurat', 700000, 'Target 3× pengeluaran: Rp13,8 jt'],
      ['Investasi / masa depan', 445975, 'Sisa pos tabungan'],
    ],
  },
  {
    id: 'pasangan',
    nama: 'Pasangan Muda',
    anggota: '2 orang, belum punya anak',
    gaji: 8830757,
    gajiLabel: 'UMP DKI Jakarta + UMP Banten 2026',
    rumus: 'Rp5.729.876 + Rp3.100.881 (UMP DKI + Banten 2026)',
    catatan: 'Dua penghasilan, satu dapur. Kunci: satu rekening bersama untuk kebutuhan.',
    kebutuhan: [
      ['Sewa / cicilan rumah', 1800000, 'Contoh: kontrakan 2 kamar'],
      ['Makan & belanja dapur', 1500000, 'Patokan: 2 × Rp751.789 (BPS 2024)'],
      ['Transportasi berdua', 600000, 'Contoh: 2 motor, Pertalite'],
      ['Listrik, air, internet', 400000, 'Contoh tagihan bulanan'],
      ['Pulsa & keperluan lain', 115379, 'Sisa pos kebutuhan'],
    ],
    keinginan: [
      ['Makan di luar berdua', 900000, 'Contoh: 2× seminggu'],
      ['Hiburan & langganan', 450000, 'Streaming, jalan-jalan'],
      ['Belanja & gaya hidup', 1299227, 'Sisa pos keinginan'],
    ],
    tabungan: [
      ['Dana darurat', 1000000, 'Target 3× pengeluaran: Rp21,2 jt'],
      ['Investasi / masa depan', 766151, 'Sisa pos tabungan'],
    ],
  },
  {
    id: 'keluarga',
    nama: 'Keluarga 4 Orang',
    anggota: '2 dewasa + 2 anak',
    gaji: 8047477,
    gajiLabel: 'UMP DKI Jakarta + UMP Jawa Barat 2026',
    rumus: 'Rp5.729.876 + Rp2.317.601 (UMP DKI + Jabar 2026)',
    catatan: 'Empat mulut, satu dapur. Patokan BPS: keluarga 4 orang rata-rata belanja Rp6.002.224/bulan (4 × Rp1.500.556, Susenas 2024).',
    kebutuhan: [
      ['Sewa / cicilan rumah', 1200000, 'Contoh: rumah pinggiran'],
      ['Makan & belanja dapur', 1500000, 'Contoh: 10 kg beras × Rp16.650 + lauk (PIHPS)'],
      ['Sekolah & anak', 600000, 'Contoh: SPP + keperluan sekolah'],
      ['Transportasi', 400000, 'Contoh: 40 liter Pertalite × Rp10.000'],
      ['Listrik, air, internet', 250000, 'Contoh tagihan bulanan'],
      ['Kesehatan', 73739, 'Sisa pos kebutuhan'],
    ],
    keinginan: [
      ['Makan di luar keluarga', 600000, 'Contoh: 2× sebulan'],
      ['Hiburan & langganan', 400000, 'Streaming, rekreasi anak'],
      ['Belanja & gaya hidup', 1414243, 'Sisa pos keinginan'],
    ],
    tabungan: [
      ['Dana darurat', 1000000, 'Target 3× pengeluaran: Rp19,3 jt'],
      ['Pendidikan anak / investasi', 609495, 'Sisa pos tabungan'],
    ],
  },
];

// Target tabungan contoh (angka contoh situs, bukan statistik).
export const GOAL_PRESETS = [
  { nama: 'Dana darurat 3 bulan', target: 18000000, ket: 'Contoh: 3 × Rp6.002.224 (pengeluaran keluarga 4 orang, BPS 2024)' },
  { nama: 'Liburan keluarga', target: 5000000, ket: 'Contoh target' },
  { nama: 'Laptop baru', target: 8000000, ket: 'Contoh target' },
  { nama: 'Motor baru', target: 20000000, ket: 'Contoh target' },
];

// Kategori pelacak pengeluaran.
export const EXPENSE_CATEGORIES = [
  'Makan & dapur',
  'Transportasi',
  'Rumah & tagihan',
  'Kesehatan',
  'Pendidikan',
  'Hiburan',
  'Belanja',
  'Lainnya',
];

// Contoh isi awal pelacak: satu bulan contoh keluarga (angka contoh situs,
// supaya grafik dan tabel langsung terisi — diberi label jelas "Contoh").
export const SAMPLE_EXPENSES = [
  { id: 'c1', nama: 'Belanja pasar mingguan', kategori: 'Makan & dapur', jumlah: 350000, tanggal: '2026-11-03' },
  { id: 'c2', nama: 'Beras 10 kg', kategori: 'Makan & dapur', jumlah: 166500, tanggal: '2026-11-05' },
  { id: 'c3', nama: 'Pertalite 20 liter', kategori: 'Transportasi', jumlah: 200000, tanggal: '2026-11-07' },
  { id: 'c4', nama: 'Listrik PLN', kategori: 'Rumah & tagihan', jumlah: 285000, tanggal: '2026-11-10' },
  { id: 'c5', nama: 'Telur 2 kg + ayam 1 kg', kategori: 'Makan & dapur', jumlah: 97000, tanggal: '2026-11-12' },
  { id: 'c6', nama: 'Nonton bioskop keluarga', kategori: 'Hiburan', jumlah: 180000, tanggal: '2026-11-15' },
  { id: 'c7', nama: 'SPP anak', kategori: 'Pendidikan', jumlah: 450000, tanggal: '2026-11-18' },
  { id: 'c8', nama: 'Gas LPG 3 kg', kategori: 'Rumah & tagihan', jumlah: 19000, tanggal: '2026-11-20' },
  { id: 'c9', nama: 'Obat & vitamin', kategori: 'Kesehatan', jumlah: 125000, tanggal: '2026-11-22' },
  { id: 'c10', nama: 'Baju anak', kategori: 'Belanja', jumlah: 220000, tanggal: '2026-11-25' },
];

// Indeks pencarian header: topik -> rute.
export const SEARCH_INDEX = [
  { kata: 'kalkulator 50 30 20 gaji alokasi', label: 'Kalkulator 50/30/20', route: '#/kalkulator' },
  { kata: 'skenario lajang pasangan keluarga', label: 'Skenario rumah tangga', route: '#/skenario' },
  { kata: 'pelacak pengeluaran catat belanja', label: 'Pelacak pengeluaran', route: '#/pelacak' },
  { kata: 'tabungan target dana darurat simulator', label: 'Simulator target tabungan', route: '#/tabungan' },
  { kata: 'harga beras telur minyak ump upah', label: 'Harga & UMP 2026', route: '#/harga' },
  { kata: 'beranda angka utama bps', label: 'Beranda — angka utama', route: '#/' },
  { kata: 'tentang sumber metodologi', label: 'Tentang & sumber', route: '#/tentang' },
  { kata: 'ump jakarta jawa barat provinsi', label: 'Tabel UMP 2026', route: '#/harga' },
  { kata: 'garis kemiskinan miskin', label: 'Garis kemiskinan (Harga & UMP)', route: '#/harga' },
  { kata: 'dana darurat 3 bulan', label: 'Dana darurat (Simulator tabungan)', route: '#/tabungan' },
];
