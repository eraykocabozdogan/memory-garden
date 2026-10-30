import handwriting from "~/lib/handwriting.json";

// Candidate 9-3b: a line written as if by a pen. The glyph outlines come from Caveat at build
// time (`pnpm handwriting`), split into one path per contour; a thick stroke travels along each
// in turn as a mask, so the ink appears where the pen is rather than in a left-to-right wipe.
// Only works for fixed lines: anything a visitor types has no path to follow.

/** How long the whole line takes to be written, in milliseconds. */
const DURATION = 2600;
/** Wide enough to cover a letter's thickness as the mask passes along its outline. */
const NIB = 15;

export function Handwriting({ line = 0, className }: { line?: number; className?: string }) {
  const glyph = handwriting[line];
  if (!glyph) return null;
  const id = `hw-${line}`;
  const total = glyph.strokes.reduce((sum, stroke) => sum + stroke.length, 0);

  let elapsed = 0;
  const strokes = glyph.strokes.map((stroke, i) => {
    const share = (stroke.length / total) * DURATION;
    const delay = elapsed;
    elapsed += share;
    return { ...stroke, key: `${i}`, duration: share, delay };
  });

  return (
    <svg
      viewBox={`0 0 ${glyph.width} ${glyph.height}`}
      role="img"
      aria-label={glyph.text}
      className={className}
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse">
          {strokes.map((stroke) => (
            // pathLength normalises each contour's dash to 0–1, so nothing is measured at
            // runtime. A dash pattern restarts at every "M", which is why each contour is its
            // own path instead of one path for the whole line.
            <path
              key={stroke.key}
              d={stroke.d}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={NIB}
              // A round cap paints a blob even on a zero-length dash, which would show every
              // dot and cedilla before the pen reached it.
              strokeLinecap="butt"
              strokeLinejoin="round"
              className="anim-kalem"
              style={{
                animationDuration: `${Math.round(stroke.duration)}ms`,
                animationDelay: `${Math.round(stroke.delay)}ms`,
              }}
            />
          ))}
        </mask>
      </defs>
      <path d={glyph.d} fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}
