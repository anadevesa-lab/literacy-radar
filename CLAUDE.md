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
- Direction: "Front page". White and editorial, lots of air; the lettering is the hero. The last CSS layer ("PaperMint v8: Front page") is the source of truth, on top of the light v2 design system (8px spacing, pill buttons in sentence case, radii 24/32).
- Palette: #8DE6D8 #5BC8B6 #3AA89C #1F7F7C #0F5854 #003C3B on white. Mint is an accent (the "Mint" lettering, the highlighter), never a background wash.
- Type: Manrope 800 for headings and UI, Instrument Serif italic for accents (the "Mint" in the logo, the second line of titles, footer headings).
- Logo: lettering only, "Paper" in Manrope 800 + "Mint" in Instrument Serif italic (mint). No symbol.
- Markets opens like a newspaper front page: giant "PaperMint" masthead, a dateline between rules (date · stories · sources · "Educational, never advice"), then the Brief's one-liner with a mint highlighter sweeping over its key phrase (`hlLead`) and a side column with the number of the day, the biggest move and the CTAs.
- The masthead lettering is liquid glass (`GLASS`, a small raw-WebGL shader over a texture of the real lettering): specular edges, a mint sheen sliding across, water ripples around the pointer and on scroll. The real <h1> stays; reduced motion or no WebGL shows the plain lettering.
- Other tabs open with a section head in the same voice (`.hero2.paperhead`): big two-line title, rule underneath.
- Chapter index (`CHAPTERS`): the page's sections in the left margin in the italic serif; the current one is marked, click to jump. Shown from 1100px, hidden over the opening and the footer.
- Menu bar solid white; dark news ticker under it.
- No small numbered/all-caps eyebrow labels; labels in sentence case.
- Rejected before (don't bring back): dark/black themes, 3D globes and wireframe planets, film grain and RGB-split effects, particle fields and particle wordmarks, glossy balls, coral wave, bubbles, light font weight, WebGL cube wall, orbiting gradient squares, HUD corner marks, graph-paper grids, numbered eyebrows, decorative wavy lines, connecting rails, reading-progress line under the menu, logo symbols, banknote guilloché and paper-stack heroes.

## Talk to Ana
Portuguese (pt-PT), concise, action first.
