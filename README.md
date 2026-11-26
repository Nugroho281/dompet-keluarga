# DompetKeluarga — Anggaran Rumah Tangga yang Ketahuan Ujungnya

![DompetKeluarga](https://img.shields.io/badge/data-BPS%202024%20%2B%20UMP%202026-0c4a3a)
![offline](https://img.shields.io/badge/offline-tanpa%20network-177a5b)
![license](https://img.shields.io/badge/license-MIT-f2a007)

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/Nugroho281/dompet-keluarga/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/Nugroho281/dompet-keluarga/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

<sub>Entered on [make.fun](https://make.fun/?ref=scz7tdtw&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>

Situs anggaran rumah tangga berbahasa Indonesia: kalkulator 50/30/20
interaktif, 3 skenario rumah tangga nyata berbasis UMP 2026, pelacak
pengeluaran yang benar-benar berfungsi, simulator target tabungan, dan
tabel harga kebutuhan pokok + UMP 2026 — setiap angka disertai sumber dan
tahunnya (BPS, Kemnaker, Bank Indonesia).

## Isi

- **Beranda** — 6 angka utama (UMP Jakarta Rp5.729.876; belanja/kapita
  Rp1.500.556; makanan 50,1%; garis kemiskinan Rp595.242; inflasi 1,57%;
  beras Rp16.650/kg) + kalkulator mini + 3 skenario + grafik BPS + harga.
- **Kalkulator 50/30/20** — masukkan gaji (preset UMP 2026), geser persen
  kebutuhan/keinginan/tabungan, donat + rupiah ikut berubah, lengkap dengan
  vonis sehat/cukup/perlu diperketat dan perbandingan vs rata-rata BPS.
- **Skenario** — Lajang di Jakarta (UMP DKI Rp5.729.876), Pasangan Muda
  (UMP DKI + Banten Rp8.830.757), Keluarga 4 Orang (UMP DKI + Jabar
  Rp8.047.477); tiap pos dipecah sampai rupiah terakhir (3 tab berfungsi).
- **Pelacak pengeluaran** — tambah/hapus, cari nama, saring kategori,
  urutkan tanggal/jumlah, total + grafik per kategori, sisa vs anggaran
  bulanan (tersimpan di localStorage perambanmu sendiri).
- **Simulator tabungan** — target + sisihan/bulan → bulan tercapai +
  grafik akumulasi; preset dana darurat, liburan, laptop, motor.
- **Harga & UMP 2026** — 15 harga pokok (PIHPS 24 Nov 2026) + tabel UMP 9
  provinsi yang bisa diurutkan + angka acuan BPS 2024.
- **Tentang & sumber** — metodologi + daftar lengkap sumber.

## Menjalankan

```sh
node serve.ts            # http://localhost:8080
```

Situs statis murni (vanilla HTML/CSS/JS, tanpa framework, tanpa network).
Semua grafik digambar sebagai SVG oleh kode sendiri (`app/charts.js`).

## Menyerahkan (make.fun)

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` menyalin `app/` + `screenshots/` ke `/output` dan menulis
`dossier.json` via `vendor/makefun-frontend.ts` (pustaka kit, tidak diubah).

## Sumber data

Kementerian Ketenagakerjaan (daftar UMP 2026; KHL Jakarta 2026); BPS —
Susenas 2024 (pengeluaran per kapita Rp1.500.556/bulan), BRS Kemiskinan
Sep 2024 (garis Rp595.242; 8,57%), Sakernas Agt 2024 (upah rata-rata
Rp3,27 jt/bulan), inflasi 2024 (1,57%); Bank Indonesia — PIHPS Nasional
24 Nov 2026 (harga pangan eceran); Kementerian ESDM — Pertalite
Rp10.000/liter, Biosolar Rp6.800/liter, LPG 3 kg Rp19.000/tabung
(dipertahankan s.d. 31 Des 2026). DompetKeluarga adalah ringkasan
independen — bukan situs pemerintah.

## Lisensi

MIT — lihat `LICENSE`.
