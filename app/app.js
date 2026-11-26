// DompetKeluarga — app.js
// Router hash + pencarian header. Satu halaman aktif dalam satu waktu;
// setiap route merender ke #view lalu memasang kontrolnya sendiri.

import { ROUTES } from './views.js';
import { SEARCH_INDEX } from './data.js';

const view = document.getElementById('view');
const searchInput = document.getElementById('site-search');
const searchResults = document.getElementById('search-results');

const TITLES = {
  '/': 'DompetKeluarga — Anggaran Rumah Tangga',
  '/kalkulator': 'Kalkulator 50/30/20 | DompetKeluarga',
  '/skenario': 'Skenario Rumah Tangga | DompetKeluarga',
  '/pelacak': 'Pelacak Pengeluaran | DompetKeluarga',
  '/tabungan': 'Simulator Target Tabungan | DompetKeluarga',
  '/harga': 'Harga & UMP 2026 | DompetKeluarga',
  '/tentang': 'Tentang & Sumber | DompetKeluarga',
};

function parseHash() {
  const raw = (location.hash || '#/').replace(/^#/, '');
  const parts = raw.split('/').filter((p) => p !== '');
  if (parts.length === 0) return { page: 'home', arg: null };
  const page = parts[0];
  const known = { kalkulator: 'calculator', skenario: 'scenarios', pelacak: 'tracker', tabungan: 'savings', harga: 'prices', tentang: 'about' };
  if (!known[page]) return { page: 'missing', arg: null };
  return { page: known[page], arg: parts[1] ? decodeURIComponent(parts[1]) : null };
}

function render() {
  window.__shotReady = false;
  const { page, arg } = parseHash();
  const fn = ROUTES[page] || ROUTES.missing;
  const { html, bind } = fn(arg);
  view.innerHTML = html;
  document.title = TITLES['/' + (page === 'home' ? '' : page === 'calculator' ? 'kalkulator' : page === 'scenarios' ? 'skenario' : page === 'tracker' ? 'pelacak' : page === 'savings' ? 'tabungan' : page === 'prices' ? 'harga' : page === 'about' ? 'tentang' : '')] || 'DompetKeluarga';
  if (page === 'scenarios' && arg) {
    const names = { lajang: 'Lajang di Jakarta', pasangan: 'Pasangan Muda', keluarga: 'Keluarga 4 Orang' };
    if (names[arg]) document.title = `Skenario: ${names[arg]} | DompetKeluarga`;
  }
  try { bind(); } catch (err) { console.error('bind gagal:', page, err); }
  $$navActive();
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function $$navActive() {
  const { page } = parseHash();
  document.querySelectorAll('.main-nav a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const key = href.replace('#/', '').split('/')[0];
    const map = { '': 'home', kalkulator: 'calculator', skenario: 'scenarios', pelacak: 'tracker', tabungan: 'savings', harga: 'prices', tentang: 'about' };
    a.classList.toggle('active', map[key] === page);
  });
}

function runSearch(q) {
  const query = (q || '').trim().toLowerCase();
  if (query.length < 2) { searchResults.innerHTML = ''; searchResults.hidden = true; return; }
  const words = query.split(/\s+/);
  const hits = SEARCH_INDEX.filter((item) => words.every((w) => item.kata.includes(w) || item.label.toLowerCase().includes(w))).slice(0, 6);
  if (!hits.length) {
    searchResults.innerHTML = '<p class="no-hit">Tidak ketemu — coba kata lain, mis. "kalkulator", "ump", atau "tabungan".</p>';
  } else {
    searchResults.innerHTML = hits.map((h) => `<a href="${h.route}">${h.label}</a>`).join('');
  }
  searchResults.hidden = false;
}

if (searchInput) {
  searchInput.addEventListener('input', () => runSearch(searchInput.value));
  searchInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      const first = searchResults.querySelector('a');
      if (first) { location.hash = first.getAttribute('href'); searchResults.hidden = true; searchInput.value = ''; }
    }
    if (ev.key === 'Escape') { searchResults.hidden = true; searchInput.blur(); }
  });
  document.addEventListener('click', (ev) => {
    if (!ev.target.closest('.search-box')) searchResults.hidden = true;
  });
}

window.addEventListener('hashchange', render);
render();
