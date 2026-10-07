# Space Attack sprite assets

Generated with the built-in `image_gen` tool on October 7, 2026. Exact prompts and source provenance are in [generation.json](generation.json). The seven RGBA source sheets in this folder are retained for future art revisions; they are not shipped to players.

The runtime asset is `public/assets/sprites/space-attack-atlas.png`: 1024 × 512, 28 frames in 128px cells, with at least 8px transparent gutters. `public/assets/sprites/atlas.json` records frame rectangles, animation counts and rates.

| Clip | Frames | Animation |
| --- | --- | --- |
| Player | 0–3 | Ivory/cyan ship, flickering orange thrusters, 10 FPS |
| Yellow Enemy A | 4–7 | Scarab claws and core, 6 FPS |
| Purple Enemy B | 8–11 | Moth wings and core, 7 FPS |
| Red Enemy C | 12–15 | Crab legs and eyes, 8 FPS |
| Explosion | 16–19 | Ignition, fireball, ring, embers; one shot |
| Laser cancellation | 20–23 | Cyan/amber flash, ring, sparks; one shot |
| Player laser | 24–25 | Cyan beam flicker, 12 FPS |
| Enemy laser | 26–27 | Amber beam flicker, 8 FPS |

Repack with Python and Pillow: `python scripts/pack-sprites.py`. Packing crops transparent bounds, applies one nearest-neighbor scale per source sheet, centers frames and preserves generated alpha. The script validates transparent gutters; tests verify manifest/runtime agreement and PNG dimensions/alpha format.

`rendering/sprites/` owns atlas UVs, sampling, animation and shared material. Ships, lasers and effects are textured planes using one texture/material. Nearest filtering, disabled mipmaps and half-texel UV insets keep retro edges crisp. Simulation time drives loops; effect lifetimes drive one-shot clips. Both freeze during gameplay pauses; the decorative starfield retains its ambient twinkle. Enemy identities survive reserve row reassignment. Rapier colliders and all scoring rules are unchanged.

The lives HUD samples the player frame from the same atlas. Gameplay and effects screenshots are under `screenshots/`. The illustrations are original generated designs rather than copies of a specific arcade game's sprites.
