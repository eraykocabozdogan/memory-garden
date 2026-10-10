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

## Still to decide

2. Colors, light and dark
3. Typography
4. Shape and depth
5. Base components
6. Layout blocks
7. Icons
8. Animated background
9. Text animation
10. Motion
11. Special components
