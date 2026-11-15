# Navya cartoon

- `body.webp` / `head.webp` — transparent cut-outs, same 1073x1500 canvas, stacked in `components/character/NavyaCharacter.tsx`.
- `char_full.webp` — single flat image, used when the visitor prefers reduced motion.

## Adding real facial expressions
1. Make extra heads on the SAME 1073x1500 canvas and crop (head layer only, transparent background).
2. Save as `head_<mood>.webp` here (moods: curious, giggle, wow, tech, bio, ops, dizzy, sleepy).
3. Register them in `EXPRESSION_SPRITES` at the top of `NavyaCharacter.tsx`:
   `{ wow: "/character/head_wow.webp", sleepy: "/character/head_sleepy.webp" }`
