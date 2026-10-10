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

## Still to decide

3. Typography
4. Shape and depth
5. Base components
6. Layout blocks
7. Icons
8. Animated background
9. Text animation
10. Motion
11. Special components
