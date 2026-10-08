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
- Owner sign-in: email+password checked against `OWNER_HASH` (salted SHA-256) in `src/shim-gh.js`; `ENC_KEY` is the owner's Gemini key encrypted with her password (AES-GCM/PBKDF2). Menu: News, Markets, Ask, Studio. News is the front page; the PaperMint logo links to ./ (reloads onto News, at the top). Visitors see News, Markets and Ask; the Studio tab opens the sign-in (Sign out sits in the Studio head, not the footer). The Library has no tab: it lives inside the Studio ("Your library" button), owner only. The News tab is read-only (stories open at the source); picking stories to make content exists only in the Studio. Studio brand kits (palette, type, logo, kept in localStorage `mint-brands`) style the carousel, the .pptx deck and the newsletter, which is built as email-ready HTML (tables, inline styles).
- Respect `prefers-reduced-motion`; check desktop (1366px) and phone (390px).

## Design
- Palette: #8DE6D8 #5BC8B6 #3AA89C #1F7F7C #0F5854 #003C3B. White background always. Manrope, bold headings.
- Menu bar solid white; dark news ticker under it (keep it).
- Markets hero (`heroHTML`, `.pmhero`, `WAVE`): a white card on a full-bleed mint band, from the "Animated Text on Path" template. Wide photo with a mint ribbon whose words ("What money is doing. Why it matters.") travel along a wave; title "Finance news, *freshly minted.*", intro, "Read today's Brief", a dark stat card with the day's sources. Photos go in `assets/hero.jpg` and `assets/hero-thumb.jpg`, then set `HERO_PHOTOS=true`.
- Other page heads: white page with the pixel mosaic (`PIXELS`, `.mpix`): soft rectangles from white to mint and teal, breathing in slow waves.
- Motion: one easing `--ease: cubic-bezier(.3,0,0,1)`; split-wordmark intro (Paper / Mint) that lifts like a curtain; buttons fill with a left-to-right wipe; footer grows from a card into a dark full-bleed band, with the wordmark huge at the bottom. Footer line: "What money is doing. Why it matters."
- Logo: wordmark Paper + *Mint* (Instrument Serif italic). Indicators: big-number grid with drawn rules.
- Rejected before (don't bring back): 3D globes, glossy balls, coral wave, bubbles, light font weight, WebGL cube wall, rainbow/iridescent chrome, the chrome capsule mark, the 3D chrome ropes/ribbons and the satin swirl.

## Talk to Ana
Portuguese (pt-PT), concise, action first.
