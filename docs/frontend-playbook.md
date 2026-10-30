# Frontend playbook

A reusable record of how we choose and wire up a frontend look, built interactively with the
project owner (Memory Garden, Stage 2). Written to be copied to other projects. Each choice
records the options, the pick and why, so the next project can start from it.

## How we work

1. Go through the choices in order. The theme comes first because its CSS variables wire every
   later piece together.
2. For each choice: summary, a short list of the best websites, the owner picks and shares the
   code or link.
3. Claude applies it to the live kitchen-sink page (`/ui`) and redeploys, so the difference is
   visible straight away.
4. Record the pick here, with the reason.
5. Check contrast, battery cost (WebGL/3D) and Turkish characters before accepting a pick.

## Choices

### 1. Mood (decided)

- **Words:** intimate · paper-like · gentle
- **Slots:** feeling = intimate, look = paper-like, pace = gentle.
- **Why:** Memory Garden is a private memory journal for two people; flowers are the accent, not
  the core. The Curtis plates (cream paper, muted greens, deep red, thin ink lines) fit the
  paper look. "Nostalgic", "archival" and "quiet" were considered and kept only as flavor.
- **Implies:** cream and paper neutrals over green everywhere, soft shadows, serif or script
  accents, soft easing and slow fades, effects used in one or two places at most.

### 2. Colors, light and dark (decided)

- **Pick:** Parchment (cream paper, forest-green ink). Rosewood (blush paper, brick-rose ink)
  and Faded ink (ivory paper, slate-blue ink) were the other candidates.
- **Why:** closest to the Curtis plates, so the artwork sits naturally on the page. Rosewood's
  primary and destructive buttons were both red, which risks confusing "Save" and "Delete".
  Faded ink's blue clashed with the plates' warm tones.
- **Dark mode:** "night paper", a warm dark brown with cream text, to keep the paper feel.
- **Where:** `apps/web/app/theme.css` (`:root` = light, `.dark` = dark), shadcn token names,
  mapped to Tailwind in `app.css` with `@theme inline`.
- **How we got there (reusable):**
  1. The owner was overwhelmed by tweakcn's preset gallery, so Claude drafted three palettes
     from the mood words instead and showed them side by side on a live `/ui` page.
  2. Contrast was checked in code before showing anything:
     `node scripts/contrast-check.mjs <theme.css>` parses `:root` and `.dark` oklch tokens.
     Thresholds: 7:1 body text, 4.5:1 other text, 3:1 input borders and focus rings.
  3. Input borders are deliberately darker than card borders so fields stay visible.
- **If the owner fine-tunes in tweakcn:** paste its Code output (Tailwind v4, oklch) over
  `theme.css` and rerun the checker.
- **Tip:** for "too many choices" steps, narrow to three candidates built from the mood words
  and let the owner compare them live. It is faster than browsing galleries.

### 3. Typography (decided)

- **Pick:** Lora (headings) + Source Sans 3 (body) + Caveat (handwriting accent).
  Candidates were Soft (Fraunces + Nunito Sans) and Journal (Newsreader only), with Kalam and
  Dancing Script as other handwriting options.
- **Why:** the calmest and most readable set for long entries, and the best fit for "paper-like".
  Dancing Script is lovely for a title but hard to read at small sizes.
- **Handwriting use:** small accents only (dates, short captions, one-line quotes), never body
  text. Assumed because the owner did not specify further.
- **Where:** `apps/web/app/typography.css` (`--ff-body`, `--ff-heading`, `--ff-hand`), mapped to
  Tailwind in `app.css` (`font-sans`, `font-heading`, `font-hand`); fonts imported in `root.tsx`.
- **How we got there (reusable):**
  1. Shortlist as complete pairs, not single fonts: a pair is easier to judge than a font.
  2. Turkish check on the font files themselves, not on the website: union of the `latin` and
     `latin-ext` subset cmaps must contain ç ğ ı İ ö ş ü (and â î û ₺). Done with fontTools.
  3. Self-host with Fontsource (`@fontsource-variable/<name>`); remove unused candidates after
     the pick so only three families ship.
  4. A browser test asserts the computed font family and that `document.fonts.check` passes
     with Turkish letters.
- **Mistake to avoid:** a scripted multi-step edit of a JSX file stripped `{`/`}` from template
  strings (`${button}` became `$button`) and shipped unnoticed, because tests and the type
  checker did not catch it. Rewrite files whole instead of patching by string offsets, and add
  a test per visible piece (a size or style assertion) so a silent style loss fails.

### 4. Shape and depth (decided)

- **Pick:** Paper: 8px base radius, a light warm-tinted shadow, airy spacing (20px card padding,
  12px stack gap). Candidates were Soft (16px, larger shadow, 24px padding) and Archive (4px,
  flat with borders only, 16px padding).
- **Why:** balanced; Soft's larger cards cost too much space on phones in list-heavy screens,
  Archive felt the least "gentle".
- **Paper grain:** on for now, revisit at the end. A tiny inline SVG noise (feTurbulence) on the
  page background only, so no battery cost; `data-grain="off"` on `<html>` turns it off.
- **Where:** `apps/web/app/shape.css` (`--radius`, `--sh-card`, `--sh-lift`, `--pad-card`,
  `--gap-stack`), mapped in `app.css` to Tailwind `rounded-sm/md/lg/xl`, `shadow-card`,
  `shadow-lift`, `p-card`, `gap-stack`.
- **How we got there (reusable):** one radius token drives every corner size (sm/md/lg/xl are
  offsets of it), shadows are tinted with the foreground hue instead of black so they look warm,
  and density lives in two spacing tokens so a variant changes all cards at once. Tests assert
  the computed radius, padding and shadow so a lost token fails visibly.

### 5. Base components (decided)

- **Pick:** shadcn/ui with **Base UI** primitives (shadcn's default since July 2026; Radix via
  `-b radix`, React Aria via `-b aria`) and the **Vega** style (0.5rem radius, balanced spacing,
  the successor of "New York"), which matches the Paper shape. Theme switching via
  **next-themes** (`attribute="class"`, light / dark / system).
- **Install (React Router, pnpm monorepo):**
  1. Add a path alias in both `tsconfig.json` and `tsconfig.app.json` (`"~/*": ["./app/*"]`) and
     in `vite.config.ts`. shadcn reads `tsconfig.json`: without it there, it creates a literal
     `~/` folder.
  2. `pnpm dlx shadcn@latest init -b base -p vega -y --no-monorepo --no-rtl`. Without `-p` it
     stops at an interactive preset prompt.
  3. **init overwrites the CSS:** it appends neutral `:root`/`.dark` colours and an Inter font
     that override your theme. Rewrite `app.css` afterwards: keep `tw-animate-css` and
     `shadcn/tailwind.css` imports, drop its colours, font and chart tokens.
  4. `pnpm dlx shadcn@latest add button input textarea label dialog dropdown-menu tabs sonner
     badge card popover calendar -y`.
- **Adapt the generated code to your tokens:** the Card ships with `rounded-xl`, `shadow-xs`
  and 24px spacing; bind it to `rounded-lg border shadow-card` and `--pad-card`.
- **Check new dependencies:** shadcn now writes `cn` from the `cn` npm package instead of
  `clsx` + `tailwind-merge`. Verified: npm maintainer is shadcn and it has provenance
  attestations.
- **Lint:** Biome's `a11y/noLabelWithoutControl` flags shadcn's `label.tsx` (the `htmlFor` comes
  from the caller); turned off for `app/components/ui/**` only.
- **Turkish date picker:** `import { tr } from "react-day-picker/locale"` and pass `locale={tr}`.
- **Tests:** buttons keep their height and paint with the theme's `--primary` (not shadcn's
  neutral default); menu, dialog, date picker and toast open.
- **Tinted variants escape the token check:** shadcn's destructive button is a 10–20% red wash
  with red text, not a solid fill. In dark mode it measured 4.18:1 (below 4.5) although every
  token pair passed. Fixed by lightening the dark `--destructive` to `oklch(0.74 0.15 28)`
  (now 4.97:1) and added a browser test that measures the rendered pixels in both modes.
- **Adding more components later:** `shadcn add` asks before overwriting existing files
  (`button.tsx`, `input.tsx`); answer no (`yes n | pnpm dlx shadcn@latest add <name>`) so our
  token-bound edits survive.

### 6. Layout blocks (decided)

- **App shell (decided):** shadcn **sidebar-08** pattern: `<Sidebar variant="inset"
  collapsible="icon">` + `<SidebarInset>`, so the content sits on the sidebar like a sheet of
  paper. Our nav is flat (five items), so only the `sidebar` component was installed, not the
  block's demo parts (team switcher, nested menus). Mobile: the sidebar is hidden and a fixed
  five-item bottom bar replaces it, padded with `env(safe-area-inset-bottom)` for iPhones.
  Rejected: sidebar-07 (plain sidebar collapsing to icons).
- **Login (decided): a herbarium sheet.** Plate of the day taped to the sheet on the left with a
  handwritten caption; a museum-style label on the right (plant, Latin name, meaning,
  date) holding underlined fields; an ink stamp hanging off
  the corner (wide screens only). Component: `app/components/herbarium-login.tsx`.
  - Rejected: shadcn login-01/02/04 ("generic"), notebook cover, letter; photo corners,
    stitches; plain card label; boxed fields; a fixed flower; a plate-number row (picked, then
    dropped: only 4 of the 10 rotating flowers' sources carry one, so it came and went).
  - **How we got there:** the owner disliked all blocks, so four concepts were derived from the
    mood words; the chosen one was then built with every detail switchable (layout, mounting,
    label, fields, flower, ornaments) and kept in the URL, so the owner picked detail by detail.
  - **Content traps found while checking screenshots:** the catalog has flowers with sad
    meanings (abandonment, folly), so the "flower of the day" rotates only through a
    hand-picked warm list; the catalog `path` mixes Latin with Turkish variant words ("Rosa ›
    kırmızı"), so the label uses `scientificName()` (shared package, tested on all records)
    instead of printing the path.
- **Lesson:** blocks are good for structure (shells), weak for identity screens (login,
  landing). Design identity screens from the mood words instead.

### 7. Icons (decided)

- **Pick:** **Phosphor**, `light` weight by default (one `IconContext.Provider` in `root.tsx`),
  `regular` for navigation (sidebar, bottom bar), where thin strokes look faint at small sizes.
  Rejected: Lucide 2px and 1.5px, Phosphor duotone ("+" fill looked odd), Tabler ("tool" feel).
- **How we got there:** a comparison page drew the same eleven concepts with every candidate,
  in buttons and in a mobile bottom bar, so the sets were judged in context, not in a gallery.
- **Switching shadcn off Lucide:** set `"iconLibrary": "phosphor"` in `components.json` (future
  `shadcn add` uses it), then swap the existing imports in `components/ui` (X, Check,
  CaretRight/Down/Left, SidebarSimple, CheckCircle, Info, SpinnerGap, WarningOctagon, Warning).
  Remove `lucide-react` and the losing candidates' packages afterwards.
- **Check packages before installing:** `pnpm view <pkg> maintainers repository.url`; Phosphor
  is published by its author (rektdeckard), Tabler by its author (codecalm).
- **Test:** the default weight and the navigation override render different paths, and a
  button's icon matches the default.

### 8. Animated background

- **Chosen:** a dense bouquet of cut-out Curtis flowers (63 of them, 93% of the sheet covered)
  printed on rippling silk, hand-written WebGL2
  (`app/components/art/silk-plate.tsx` + `gl.ts`). Rejected after live comparison: React Bits
  Particles, Aurora, Iridescence, Grid Motion, Drift Wall, Logo Loop, plain Silk, a still plate
  wall, and a 3D flower made of flowing plates.
- **Cutting the flowers out of the paper** (`pnpm flowers:cutout`, `scripts/flower-cutout.mjs`):
  read the paper colour as the median of the plate's border pixels; drop every pixel within a
  Chebyshev distance of 34 of it, which takes the paper trapped between leaves as well; flood
  from the border with a looser distance of 52, limited to pixels as yellow as the paper, for
  stains and shadows; label what is left and drop islands under 2% of the largest, which removes
  the engraved captions; feather the mask by about a pixel and trim. 31s for 61 plates.
- **What the method cannot do:** near-white flowers on cream paper (white rose, white lilac,
  white lily, narcissus, tulip) differ from the paper only by their outlines, and a hue guard
  that saves them leaves paper blobs on other plates. Scans with a printed frame keep the frame.
  Both are listed in a `SKIP` set in `scripts/flower-bouquet.mjs` rather than special-cased:
  43 clean cut-outs out of 61 is plenty.
- **Packing** (`pnpm flowers:bouquet`): keep a coverage grid at 1/8 scale; walk the catalogue in
  rounds of decreasing size (50%, 36%, 26%, 18% of the sheet height); for each flower try a
  coarse lattice of positions and keep the one that covers the most still-empty ground; stop at
  the target coverage. 63 flowers reach 93%, 31 flowers 73%. Starting too large (95%) filled the
  sheet with four flowers, so the scale ladder matters more than the placement rule.
- **Transparency in the shader:** mix cloth and print by the image's alpha, so the silk shows
  between the flowers. A straight `mix` leaves a pale halo around each cut-out's feathered edge;
  `smoothstep(0.2, 0.7, alpha)` tightens it. For a single flower, "contain" with a margin beats
  "cover", which crops the flower's head off screen.
- **Density has a cost, and the owner may still want it:** at 93% coverage the flowers hide the
  silk he had asked to see more of. Shown all three, he first picked the single large flower on
  bare silk, then came back to the dense bouquet. Build the cheap variants and let the person
  decide on their own device; do not reason the choice out for them.
- **Keep the intermediates out of the repo:** the 61 cut-outs are 11 MB and only feed the sheet,
  so they are written to a gitignored `.cache/` instead of the served `public/` folder. Only the
  1.1 MB sheet ships.
- **Lessons so far:**
  - React Bits' current backgrounds are raw WebGL2 with real safeguards (pause off-screen and
    in hidden tabs, pixel-ratio cap, reduced motion), checked in their source; but Aurora kept
    redrawing a frozen frame under reduced motion, so pass `paused` yourself.
  - Full-screen shaders cost every pixel every frame; image-based backgrounds (moving `<img>`
    tiles) are far cheaper. A GPU-less test browser makes this visible (4–5 fps vs ~60).
  - Read component props before trusting names: Drift Wall's `dim` is tile opacity, so
    `dim={0}` made it invisible.
  - Put a background layer in an `inert`, `aria-hidden` wrapper so nothing in it takes focus.
  - Show backgrounds with a "hide the sheet" toggle and check on the owner's real device size
    (tablet feedback changed the result three times).
  - Measure before offering layout options: outlining the sheet's columns in a screenshot turned
    "there is too much empty space" into two numbers, and the answer was "leave it as it is".
  - Generate image derivatives in a script (`pnpm flowers:cutout`, `pnpm flowers:bouquet`)
    instead of loading 16 MB of full plates.
  - A backtick inside a comment in a GLSL template literal ends the string; TypeScript then
    reports a syntax error on the next line of shader code.
  - `sharp` hands a blurred one-channel raw buffer back as three channels: read the returned
    `info.channels` as a stride instead of assuming one.
  - `sharp` resizes before it composites, so resize in a second pass or the composite is
    rejected as larger than the canvas; composite offsets must also be non-negative, so crop
    whatever hangs over an edge yourself.

### 9. Text animation

- **Chosen:** a soft word-by-word reveal (380 ms) for headings and body text, a left-to-right
  "being written" sweep for the handwritten Caveat lines, and a count-up for headline numbers.
  Plain CSS and one small component (`app/text-anim.css`, `components/count-up.tsx`); nothing
  was installed, so the Motion decision stays open.
- Rejected after seeing all of them live: no animation at all, letter by letter, blur in,
  typewriter, sheen, rotating word, and a pen that draws the glyph outlines.
- **A left-to-right wipe is not handwriting, and the owner saw that at once.** Real writing
  needs the glyph outlines: extracted at build time, split per contour, with a thick mask stroke
  travelling along each in turn. It worked, it only works for fixed lines, and he did not like
  it — so it went. Four traps were on the way there, each one silent, and they are worth knowing
  before anyone tries this again:
  - opentype.js reads a *variable* font's outlines as `.notdef` boxes. Use the static face.
  - Fontsource splits a face into subsets: basic Latin and the Turkish letters are in different
    files, so compose the line character by character from whichever subset has each one.
  - A dash pattern restarts at every `M`, so one path for a whole line cannot be drawn
    progressively; give each contour its own path and its own delay, shared out by length.
  - A round line cap paints a blob on a zero-length dash, which showed every dot and cedilla
    before the pen reached it. Butt caps, and start the offset just past the end of the dash.
- **Lessons:**
  - Build the effect the person described, not the effect that is easy to reach for. The cheap
    stand-in was spotted on first viewing.
  - Every effect should end on the plain, readable text. Then `prefers-reduced-motion` is not a
    separate design, it is just the end state, and a test can assert that nothing is running.
  - Keep each effect to a class the real screens can wear, so locking a decision is a matter of
    adding `anim-beliris` to a container rather than rewriting a component.

### 10. Motion

- **Chosen:** the browser's own View Transitions, through React 19.3's `<ViewTransition>`. No
  animation library. Page changes cross because the outlet is wrapped in root; a memory card
  opens into its detail because both sides share a transition name. Timing is one file,
  `app/view-transition.css`, on the same easing as the text reveal.
- **Rejected:** no movement at all, and the Motion library (compared live on the same two
  interactions, then removed). The Motion question is left to the special-components step: if a
  gallery or an upload widget genuinely needs it, it gets added then, on purpose.
- **How to compare an animation library fairly:** put the real interactions on the page, not a
  gallery of effects. Here it was a memory card opening into its detail and a list gaining and
  losing a row — the two movements the product actually needs. Import the candidate library from
  that route only: it lands in that route's chunk (140 kB raw, 47 kB gzipped here) and the cost
  is measured rather than argued about.
- **Notes for using it:**
  - React only runs a view transition for updates inside a Transition. React Router already
    wraps navigations, so page changes need nothing; your own `setState` needs `startTransition`.
  - A transition name must be unique on the page and a valid identifier, so slugify anything
    derived from text — Turkish letters are not valid.
  - React Router's own `viewTransition` prop and `useViewTransitionState` are deprecated in
    favour of React's component; enabling both interrupts the animation.
  - Support: Safari/iOS 18+, Chrome/Edge 111+, Firefox 144+. Elsewhere the page simply swaps,
    which is what makes this safe to ship for "it should work on every device".

## Still to decide

11. Special components
