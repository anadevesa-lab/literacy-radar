# Literacy Radar — site público (GitHub Pages, 100% grátis)

Projeto final Nova SBE · *Boosting productivity with AI*.

## Como funciona
- **Site**: `index.html` servido pelo GitHub Pages (sem limites de publicações).
- **Notícias, mapa do dia e The Brief**: o GitHub Actions corre `scripts/collect.mts` nos dias úteis às 07:47 e 16:47 (Lisboa), lê os feeds RSS em inglês (Bloomberg, FT, WSJ, The Economist, CNBC, MarketWatch, BBC, The Guardian, NYT, Fortune, Investing.com, Seeking Alpha, BCE, Fed), escreve os ficheiros em `data/` e faz commit.
- **IA**: Gemini da Google, plano gratuito.
  - Na recolha automática usa o secret `GEMINI_API_KEY` do repositório.
  - No Estúdio / Ask, cada pessoa cola a sua chave (botão **AI key**); fica só no browser.
- **Indicadores**: `data/indicators.json` (editar à mão quando saem valores novos).

## Configurar (uma vez)
1. Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
2. Settings → Secrets and variables → Actions → *New repository secret* → `GEMINI_API_KEY` = chave de https://aistudio.google.com/apikey
3. Actions → *Collect news* → *Run workflow* para a primeira recolha.

Conteúdo educativo. Não é recomendação de investimento.
