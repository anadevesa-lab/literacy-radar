"""Build index.html (the published site) from src/app.html + src/shim-gh.js.
Run from the repo root:  python tools/build.py"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src" / "app.html").read_text(encoding="utf-8")
shim = (root / "src" / "shim-gh.js").read_text(encoding="utf-8")
title = '<title>MINT · A fresh take on finance</title>'
src = re.sub(r'<title>.*?</title>', '', src, count=1)
links = re.findall(r'<link [^>]+>\n?', src)
body = src
for l in links: body = body.replace(l, '', 1)
body = body.replace('<script src="https://cdn.jsdelivr.net/npm/pptxgenjs', '<script>\n' + shim + '\n</script>\n<script src="https://cdn.jsdelivr.net/npm/pptxgenjs', 1)
html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="MINT, a fresh take on finance: financial news, official indicators and a financial-literacy content studio.">
{title}
{''.join(links)}<style>:root{{color-scheme:light}} body{{margin:0}} img{{max-width:100%}} [hidden]{{display:none!important}}</style>
</head>
<body>
{body}
</body>
</html>
'''
(root / "index.html").write_text(html, encoding="utf-8")
print("built index.html", len(html))
