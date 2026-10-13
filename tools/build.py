"""Build index.html (the published site) from src/app.html + src/shim-gh.js.
Run from the repo root:  python tools/build.py"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src" / "app.html").read_text(encoding="utf-8")
shim = (root / "src" / "shim-gh.js").read_text(encoding="utf-8")
title = '<title>PaperMint · Finance news, freshly minted</title>'
src = re.sub(r'<title>.*?</title>', '', src, count=1)
links = re.findall(r'<link [^>]+>\n?', src)
body = src
for l in links: body = body.replace(l, '', 1)
# the GitHub Pages runtime goes where app.html marks it (before the app script)
assert '<!--runtime-->' in body, "src/app.html lost its <!--runtime--> marker"
body = body.replace('<!--runtime-->', '<script>\n' + shim + '\n</script>', 1)
SITE = "https://anadevesa-lab.github.io/literacy-radar/"
DESC = "PaperMint, finance news freshly minted: financial news, official indicators and a financial-literacy content studio."
# sharing cards (WhatsApp, LinkedIn, X...), icons and structured data
share = f'''<link rel="canonical" href="{SITE}">
<meta name="theme-color" content="#003C3B">
<link rel="icon" type="image/png" sizes="32x32" href="assets/icon-32.png">
<link rel="apple-touch-icon" href="assets/icon-180.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="PaperMint">
<meta property="og:title" content="PaperMint · Market insights, freshly minted.">
<meta property="og:description" content="{DESC}">
<meta property="og:url" content="{SITE}">
<meta property="og:image" content="{SITE}assets/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="PaperMint: Market insights, freshly minted.">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"WebSite","name":"PaperMint","url":"{SITE}","description":"{DESC}","inLanguage":"en"}}</script>
'''
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="{DESC}">
{title}
{share}<link rel="preload" as="image" href="assets/news-hero.webp" fetchpriority="high">
{''.join(links)}<style>:root{{color-scheme:light}} body{{margin:0}} img{{max-width:100%}} [hidden]{{display:none!important}}</style>
</head>
<body>
{body}
</body>
</html>
'''
(root / "index.html").write_text(html, encoding="utf-8")
print("built index.html", len(html))
