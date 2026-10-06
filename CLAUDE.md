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
- Direction: futuristic white. Graph-paper grid, HUD corner marks, mono labels for data/metadata (JetBrains Mono), one live pulse. Design system is the "MINT v2" + "PaperMint v3" CSS layers at the end of the style block (8px spacing, radii 24/32, pill buttons in sentence case).
- Palette: #8DE6D8 #5BC8B6 #3AA89C #1F7F7C #0F5854 #003C3B. White background always. Manrope 800 headings.
- Menu bar solid white with the PaperMint wordmark; dark news ticker under it with a LIVE tag (keep it).
- Hero of every tab: rounded mint card (`.hero2`). Markets hero is a bento with Number of the day and today's news mix.
- Hero art: mint particle field (`PFIELD`, canvas 2D) that assembles into the stepped mark, then re-forms on scroll (Markets: bars of the real indicators; Studio/Library: a stack of posts; Ask: a "?"). Fewer points on phones/weak devices, still frame with reduced motion, paused off-screen.
- Logo: stepped blocks SVG (own design). Indicators: big-number grid with drawn rules.
- Rejected before (don't bring back): 3D globes, glossy balls, coral wave, bubbles, light font weight, WebGL cube wall, orbiting gradient squares.

## Talk to Ana
Portuguese (pt-PT), concise, action first.
