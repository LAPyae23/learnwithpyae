/**
 * Builds src/data/kanjiStrokes.json from KanjiVG (https://kanjivg.tagaini.net),
 * © Ulrich Apel, licensed CC BY-SA 3.0. Only the stroke path data is kept.
 *
 *   npx tsx scripts/fetch-kanjivg.ts
 *
 * Re-run after adding kanji to src/data/kanjiList.ts.
 */
import fs from 'node:fs';
import { N5_KANJI } from '../src/data/kanjiList';

const BASE = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji';
const OUT = 'src/data/kanjiStrokes.json';

function fileName(char: string) {
  return `${char.codePointAt(0)!.toString(16).padStart(5, '0')}.svg`;
}

async function main() {
  const out: Record<string, string[]> = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, 'utf8'))
    : {};

  for (const { char } of N5_KANJI) {
    if (out[char]?.length) continue;
    const res = await fetch(`${BASE}/${fileName(char)}`);
    if (!res.ok) {
      console.warn(`skip ${char}: HTTP ${res.status}`);
      continue;
    }
    const svg = await res.text();
    // Stroke paths are <path id="kvg:XXXXX-sN" d="..."/>, in stroke order. Keep only the d attribute.
    const strokes = [...svg.matchAll(/<path[^>]*\sid="kvg:[0-9a-f]+-s(\d+)"[^>]*\sd="([^"]+)"/g)]
      .sort((a, b) => Number(a[1]) - Number(b[1]))
      .map((m) => m[2])
      .filter((d) => /^[MmCcSsLlHhVvZz0-9.,\s-]+$/.test(d)); // path data only
    if (!strokes.length) {
      console.warn(`skip ${char}: no strokes parsed`);
      continue;
    }
    out[char] = strokes;
    console.info(`${char}: ${strokes.length} strokes`);
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 0) + '\n');
  console.info(`wrote ${Object.keys(out).length} kanji to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
