# VRoid character spec: Shikhar (walkthrough guide)

Reference: `design/refs/face.jpg` (local only, git-ignored) + the Snapchat Bitmoji (`public/img/avatar-front.webp`).
Target file: `public/avatar/shikhar.vrm` (VRM 1.0). The site picks it up at build time; no code change needed.

## Face
- Shape: oval, defined jaw, slightly narrow chin. Face width a notch below default.
- Skin: warm medium brown, base `#B8887A`, shadow `#A77669`.
- Eyes: dark brown `#47383D`, almond, relaxed (not the large anime default; shrink ~15%, lower the top lid a touch).
- Eyebrows: thick, dark `#2A2426`, fairly straight with a slight arch, close to the eyes.
- Nose: medium, rounded tip.
- Mouth: medium width, calm closed smile; lips `#8A504D`.
- Beard: short trimmed stubble on jaw, chin and moustache, `#3A2F2C` at ~60% opacity (Face paint layer).

## Hair
- Near-black `#1E1C1E`, highlight `#3B3A3F`.
- Thick, messy, textured top, swept up and slightly to his left; shorter on the sides, ears showing.

## Accessories
- Aviator-style glasses: large teardrop lenses, thin silver/gunmetal metal frame with a double bridge, clear lenses.

## Outfit (from the Bitmoji)
- Peach polo `#F4C9B4` (collar, short sleeves), grey joggers `#C9CCD2` with cuffs, white sneakers `#F5F5F5`.

## Body
- Height ~ 175 cm feel, slim-average build, default male proportions.

## Export
- VRM 1.0, reduce polygons ~30,000, texture atlas 2048, title "Shikhar", then save to `public/avatar/shikhar.vrm`.
