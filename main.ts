// DompetKeluarga — main.ts (Node 22, standard library only).
//
// Entry point program/v1: menyalin app/ dan screenshots/ dari samping file
// ini ke /output (atau $MAKEFUN_OUTPUT_DIR di luar grader), lalu menulis
// /output/dossier.json lewat buildDossier dari vendor/makefun-frontend.ts
// (pustaka kit — JANGAN diubah: scorer membandingkan dossier byte per byte
// dengan yang ditulis salinan kit yang sama).
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//   node serve.ts   # lalu buka http://localhost:8080

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// Caps mengikuti gate scorer: teks dossier maks 160 KiB, maks 4 screenshot
// @ 256 KiB, app/ maks 993 file & 16 MiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
