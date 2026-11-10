'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type Pt = { x: number; y: number };
const SIZE = 109; // KanjiVG viewBox
const SAMPLES = 24;

/** Evenly resample a polyline to n points. */
function resample(points: Pt[], n: number): Pt[] {
  if (points.length < 2) return Array.from({ length: n }, () => points[0] ?? { x: 0, y: 0 });
  const dists = [0];
  for (let i = 1; i < points.length; i++) {
    dists.push(
      dists[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
    );
  }
  const total = dists[dists.length - 1] || 1;
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / (n - 1);
    while (j < dists.length - 2 && dists[j + 1] < target) j++;
    const seg = dists[j + 1] - dists[j] || 1;
    const t = (target - dists[j]) / seg;
    out.push({
      x: points[j].x + (points[j + 1].x - points[j].x) * t,
      y: points[j].y + (points[j + 1].y - points[j].y) * t,
    });
  }
  return out;
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Sample an SVG path string into points using the browser's geometry engine. */
function samplePath(d: string, n: number): Pt[] {
  const svgNS = 'http://www.w3.org/2000/svg';
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', d);
  const len = path.getTotalLength();
  return Array.from({ length: n }, (_, i) => {
    const p = path.getPointAtLength((len * i) / (n - 1));
    return { x: p.x, y: p.y };
  });
}

/**
 * Judges one drawn stroke against the expected stroke.
 * Checks start point, end point (so direction matters, as in real stroke order) and overall shape.
 */
function judge(drawn: Pt[], expected: Pt[]) {
  const a = resample(drawn, SAMPLES);
  const meanDist = a.reduce((s, p, i) => s + dist(p, expected[i]), 0) / SAMPLES;
  const startOk = dist(a[0], expected[0]) < 22;
  const endOk = dist(a[SAMPLES - 1], expected[SAMPLES - 1]) < 26;
  const reversed = dist(a[0], expected[SAMPLES - 1]) < dist(a[0], expected[0]);
  return { ok: startOk && endOk && meanDist < 16, reversed, meanDist };
}

export interface WriteResult {
  mistakes: number;
  strokes: number;
}

export default function KanjiWriter({
  strokes,
  showGuide,
  onComplete,
  resetKey,
}: {
  strokes: string[];
  showGuide: boolean;
  onComplete: (r: WriteResult) => void;
  resetKey: string | number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [done, setDone] = useState(0); // strokes completed
  const [current, setCurrent] = useState<Pt[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [failsOnStroke, setFailsOnStroke] = useState(0);
  const [flash, setFlash] = useState<{ ok: boolean; msg: string } | null>(null);
  const [demoIndex, setDemoIndex] = useState<number | null>(null);
  const drawing = useRef(false);

  // Sampled after mount (needs the browser's SVG engine), so the server and the first client
  // render match and React doesn't throw a hydration error.
  const [expected, setExpected] = useState<Pt[][]>([]);
  useEffect(() => {
    setExpected(strokes.map((d) => samplePath(d, SAMPLES)));
  }, [strokes]);

  useEffect(() => {
    setDone(0);
    setCurrent([]);
    setMistakes(0);
    setFailsOnStroke(0);
    setFlash(null);
    setDemoIndex(null);
  }, [resetKey]);

  const toSvg = useCallback((e: React.PointerEvent): Pt => {
    const rect = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SIZE,
      y: ((e.clientY - rect.top) / rect.height) * SIZE,
    };
  }, []);

  function down(e: React.PointerEvent) {
    if (done >= strokes.length || demoIndex !== null) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drawing.current = true;
    setCurrent([toSvg(e)]);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const p = toSvg(e);
    setCurrent((prev) =>
      prev.length && dist(prev[prev.length - 1], p) < 0.8 ? prev : [...prev, p]
    );
  }
  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    const drawn = current;
    setCurrent([]);
    if (drawn.length < 2 || !expected[done]) return;

    const result = judge(drawn, expected[done]);
    if (result.ok) {
      const next = done + 1;
      setDone(next);
      setFailsOnStroke(0);
      setFlash({ ok: true, msg: next === strokes.length ? 'ပြီးပါပြီ!' : 'မှန်ပါတယ်' });
      if (next === strokes.length) onComplete({ mistakes, strokes: strokes.length });
    } else {
      setMistakes((m) => m + 1);
      setFailsOnStroke((f) => f + 1);
      setFlash({
        ok: false,
        msg: result.reversed
          ? 'ရေးတဲ့ ဦးတည်ရာ ပြောင်းပြန် ဖြစ်နေပါတယ်'
          : `${done + 1} ချက်မြောက်ကို ပြန်ရေးပါ`,
      });
    }
  }

  // Step-by-step demo animation of the stroke order
  async function playDemo() {
    for (let i = 0; i < strokes.length; i++) {
      setDemoIndex(i);
      await new Promise((r) => setTimeout(r, 700));
    }
    setDemoIndex(null);
  }

  const hintStroke = !showGuide && failsOnStroke >= 2 ? done : null;
  const polyline = current.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-[320px] aspect-square">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="w-full h-full bg-white rounded-2xl border-2 border-border touch-none select-none"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="img"
          aria-label="Kanji ရေးရန် နေရာ"
        >
          {/* practice grid */}
          <line
            x1={SIZE / 2}
            y1={0}
            x2={SIZE / 2}
            y2={SIZE}
            stroke="#e5e7eb"
            strokeDasharray="3 3"
            strokeWidth={0.6}
          />
          <line
            x1={0}
            y1={SIZE / 2}
            x2={SIZE}
            y2={SIZE / 2}
            stroke="#e5e7eb"
            strokeDasharray="3 3"
            strokeWidth={0.6}
          />

          {/* guide */}
          {(showGuide || demoIndex !== null) &&
            strokes.map((d, i) => (
              <path
                key={`g${i}`}
                d={d}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={4}
                strokeLinecap="round"
              />
            ))}

          {/* hint for the next stroke after repeated mistakes */}
          {hintStroke !== null && (
            <path
              d={strokes[hintStroke]}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.7}
            />
          )}

          {/* completed strokes */}
          {strokes.slice(0, done).map((d, i) => (
            <path
              key={`d${i}`}
              d={d}
              fill="none"
              stroke="#111827"
              strokeWidth={4}
              strokeLinecap="round"
            />
          ))}

          {/* demo */}
          {demoIndex !== null &&
            strokes
              .slice(0, demoIndex + 1)
              .map((d, i) => (
                <path
                  key={`demo${i}`}
                  d={d}
                  fill="none"
                  stroke={i === demoIndex ? '#006633' : '#111827'}
                  strokeWidth={4}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  className={i === demoIndex ? 'kanji-draw' : ''}
                />
              ))}

          {/* stroke number for the next stroke in guide mode */}
          {showGuide && done < expected.length && expected[done] && (
            <circle cx={expected[done][0].x} cy={expected[done][0].y} r={3} fill="#006633" />
          )}

          {/* live ink */}
          {polyline && (
            <polyline
              points={polyline}
              fill="none"
              stroke="#006633"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between w-full max-w-[320px] text-[13px]">
        <span className="text-muted-foreground tabular-nums">
          {done}/{strokes.length} ချက် · အမှား {mistakes}
        </span>
        <span
          className={
            flash ? (flash.ok ? 'text-success font-semibold' : 'text-danger font-semibold') : ''
          }
        >
          {flash?.msg}
        </span>
      </div>

      <button
        onClick={playDemo}
        disabled={demoIndex !== null}
        className="text-[13px] font-semibold text-primary border border-primary/30 bg-secondary rounded-xl px-4 py-2 disabled:opacity-50"
      >
        ▶ ရေးနည်းအစဉ် ကြည့်မယ်
      </button>
    </div>
  );
}
