# PaperMint — "Finance news, freshly minted"

Financial-literacy site (Nova SBE project, "Boosting productivity with AI"). Public site: https://anadevesa-lab.github.io/literacy-radar/ (GitHub Pages, branch `main`, root). Everything is free: no paid APIs, no servers.

## How it is built
- `src/app.html` — the whole app (HTML + CSS + JS in one file). **Edit this.** Internal data keys are Portuguese (resumo, classes, tendencia…); all UI text is English.
- `src/shim-gh.js` — the runtime for GitHub Pages: reads `data/*.json`, keeps personal data in localStorage, calls Gemini from the browser, owner sign-in.
- `index.html` — generated. After editing, run `python tools/build.py`, then commit `src/` and `index.html`. Never hand-edit `index.html`.
- `data/` — written by the robot, do not edit by hand (except `indicators.json` if an API fails).
- `scripts/collect.mts` + `.github/workflows/collect.yml` — the robot: weekdays 06:47 and 15:47 UTC it reads RSS feeds (Bloomberg, FT, WSJ, Economist, CNBC, MarketWatch, BBC, Guardian, NYT, Fortune, Investing.com, Seeking Alpha, ECB, Fed), refreshes indicators from the ECB and Eurostat APIs, and with the repo secret `GEMINI_API_KEY` writes the daily map, The Brief and the ready-to-post pack (carousel, LinkedIn post, reel, 5 FAQs). Run locally with `node scripts/collect.mts` (Node 24).

## Rules
- English everywhere; only credible English sources (no Portuguese outlets, no idealista).
- Educational only: no buy/sell calls, no products, no promised returns (CMVM).
- Never put an API key in code. Visitors need no key: news, Brief, pack and FAQ are pre-generated.
- Owner sign-in: email+password checked against `OWNER_HASH` (salted SHA-256) in `src/shim-gh.js`; `ENC_KEY` is the owner's Gemini key encrypted with her password (AES-GCM/PBKDF2). Visitors see Markets and Ask MINT; the Studio tab opens the sign-in; Library and Studio only after sign-in.
- Respect `prefers-reduced-motion`; check desktop (1366px) and phone (390px).

## Design
- Direction: dark cinematic (inspired by immersive sites like Jeff Koons Moon Phases, read as a chart). Background #050606 (near black), white type, mint accents. The last CSS layer ("PaperMint v4: dark cinematic") is the source of truth; earlier layers stay underneath.
- Palette: #8DE6D8 #5BC8B6 #3AA89C #1F7F7C #0F5854 #003C3B, plus the deep background #011A19. Manrope 800 headings.
- Markets opens with "PaperMint World" (`WORLD`, Three.js r128 via `loadThree`), inspired by unseen.co/world: a white wireframe planet on black with a red/cyan chromatic split and film grain. Its relief comes from the daily map (rising classes lift into mountains, falling ones sink into craters, mixed ones ripple); the market line orbits as a ring of light drawn from the eight indicators; the day's stories glow on the surface, the four Brief stories brightest. The day's mood (calm / changeable / stormy, `WORLD_SKY`) sets the glow and how hard it glitches. Scroll flies the camera: overview → biggest move → the indicator ring → the Brief. Copy is real HTML in `.phase` blocks. Lite on phones/weak devices, still frame with reduced motion, static SVG line if WebGL fails.
- Type: Manrope 800 plus Instrument Serif italic accents (headline second line, the "Mint" in the wordmark).
- Every other tab opens the same way (harmony): full-bleed black hero with film grain, a static wireframe globe SVG with the RGB split (`tilesHTML` → `.hglobe`), and a two-line title whose second line is the italic serif.
- Logo: lettering only, "Paper" in Manrope 800 + "Mint" in Instrument Serif italic (mint). No symbol, no squares.
- Footer: dark CTA card, then the link columns. Labels are sentence case everywhere.
- Chapter index (`CHAPTERS`): the page's sections listed in the left margin in the italic serif; the current one lights up (no connecting line), click to jump. Shown from 1100px (content column narrows to make room), hidden over the opening and the footer.
- Menu bar solid dark; dark ticker with a LIVE tag under it.
- No small numbered/all-caps eyebrow labels ("03 / …"): titles stand on their own.
- Rejected before (don't bring back): glossy balls, coral wave, bubbles, light font weight, WebGL cube wall, orbiting gradient squares, blocky particle logos, particle wordmarks, HUD corner marks, graph-paper grids, numbered eyebrows, indicator spires on the globe, decorative wavy lines inside hero cards or down the margin, connecting rails, a reading-progress line under the menu, logo symbols.

## Talk to Ana
Portuguese (pt-PT), concise, action first.
