// The Monthly Brief (the monthly factsheet by email, Brevo): sent once, when the robot writes a month's final
// version in the first days of the next month. Repo secrets: BREVO_API_KEY, BREVO_LIST_ID, BREVO_SENDER_EMAIL.
// The email mirrors factsheetEmail() in src/app.html: keep the two in step.
import { SITE, HEAD, logo, footer } from "./email-kit.mts";
const MOODS: Record<string, string> = {
  "risk-on": "Investors felt confident and bought riskier assets such as shares.", "risk-off": "Investors moved away from risk towards safer assets such as bonds and gold.",
  "cautious": "Investors held back, waiting for clearer signals before making big moves.", "confident": "Markets were calm and steady, with prices broadly moving up.",
  "nervous": "Prices swung sharply as investors reacted to every headline.", "relief rally": "Markets bounced back after a scare turned out less bad than feared.",
};
const esc = (x: any) => String(x ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const fmtNum = (v: number, d: number) => Number(v).toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
const monthName = (ym: string) => { const [y, m] = ym.split("-"); return new Date(+y, +m - 1, 15).toLocaleDateString("en-GB", { month: "long", year: "numeric" }); };

export function factsheetHTML(ym: string, sum: any) {
  const INK = "#003C3B", MINT = "#8DE6D8", TEAL = "#1F7F7C", TINT = "#F4FAF8", LINE = "#D7ECE7", BODY = "#2E5A57", MUTED = "#4D716E", AMBER = "#B26B00";
  const F = "Manrope,'Helvetica Neue',Helvetica,Arial,sans-serif", SERIF = "'Instrument Serif',Georgia,'Times New Roman',serif";
  const site = SITE + "#month";
  const mdE = (t: any) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const line = sum.sumup?.frase || sum.titulo || "", mood = sum.sumup?.palavra || "", why = sum.sumup?.porque || MOODS[(mood || "").toLowerCase()] || "";
  const mk = (sum.mercados || []).filter((x: any) => x.chg != null).map((x: any) => ({ ...x, score: Math.abs(x.unit === "bp" ? x.chg / 10 : x.chg) })).sort((a: any, b: any) => b.score - a.score);
  const seen = new Set(), top: any[] = []; for (const x of mk) { const f = x.k.replace(/\d+$/, ""); if (seen.has(f)) continue; seen.add(f); top.push(x); if (top.length === 3) break; }
  const chg = (v: any, u: string) => v == null ? "–" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${u === "bp" ? Math.abs(Math.round(v)) + " bp" : fmtNum(Math.abs(v), 1) + "%"}`;
  const col = (v: any) => v > 0 ? TEAL : v < 0 ? AMBER : MUTED;
  const h5 = (t: string) => `<div style="font:800 12px/1 ${F};letter-spacing:1.5px;text-transform:uppercase;color:${INK};margin:0 0 12px">${t}</div>`;
  const block = (inner: string, bg = TINT) => `<tr><td style="padding:0 32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-radius:14px"><tr><td style="padding:20px 22px">${inner}</td></tr></table></td></tr>`;
  const EFF: Record<string, [string, string]> = { positive: ["▲ Positive", TEAL], negative: ["▼ Negative", AMBER], mixed: ["◆ Mixed", MUTED], neutral: ["■ Neutral", MUTED] };
  const drivers = (sum.drivers || []).length ? sum.drivers : (sum.themes || []).map((t: any) => ({ factor: t.titulo, efeito: "mixed", texto: t.texto }));
  const month = monthName(ym);
  return `<!doctype html><html lang="en"><head>${HEAD}<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&display=swap" rel="stylesheet"><title>The Monthly Brief · ${esc(month)}</title></head>
<body style="margin:0;padding:0;background:${TINT}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${TINT}"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:640px;background:#FFFFFF;border-radius:18px;overflow:hidden">
<tr><td style="background:${INK};padding:20px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
  <td>${logo(true, 22)}</td>
  <td align="right" style="font:700 11px/1 ${F};letter-spacing:1.5px;text-transform:uppercase;color:${MINT}">The Monthly Brief · ${esc(month)}</td></tr></table></td></tr>
<tr><td style="background:${INK};padding:8px 32px 30px">
  <div style="font:800 11px/1 ${F};letter-spacing:2px;text-transform:uppercase;color:${MINT};margin:0 0 12px">The month in one line</div>
  <div style="font:italic 400 32px/1.15 ${SERIF};color:#FFFFFF;margin:0 0 18px">${esc(line).replace(/\*\*(.+?)\*\*/g, `<span style="color:${MINT}">$1</span>`)}</div>
  ${mood ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="font:800 10px/1 ${F};letter-spacing:1.5px;text-transform:uppercase;color:#A9CFC9;padding-right:10px">Market mood</td><td style="background:${MINT};border-radius:999px;padding:6px 14px;font:800 18px/1 ${F};color:${INK}">${esc(mood)}</td></tr></table>${why ? `<div style="font:400 14px/1.5 ${F};color:#CFE9E4;margin:10px 0 0">${esc(why)}</div>` : ""}` : ""}
  ${top.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid #1F5C59"><tr>${top.map((x, i) => `<td valign="top" width="33%" style="padding:16px ${i < 2 ? "12px" : "0"} 0 0"><div style="font:800 ${[34, 28, 24][i]}px/1 ${F};color:${x.chg > 0 ? MINT : "#F4B860"}">${chg(x.chg, x.unit)}</div><div style="font:700 13px/1.3 ${F};color:#FFFFFF;margin-top:6px">${esc(x.name)}</div><div style="font:400 10px/1.3 ${F};color:#8FB8B2">this month · ${esc(x.source)}</div></td>`).join("")}</tr></table>` : ""}
</td></tr>
<tr><td style="padding:28px 32px 16px"><div style="font:800 22px/1.25 ${F};color:${INK};margin:0 0 10px">${esc(sum.titulo || month)}</div><div style="font:400 15px/1.6 ${F};color:${BODY}">${mdE(sum.resumo)}</div></td></tr>
${(sum.mercados || []).length ? block(h5("Market performance") + `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:400 13px/1.4 ${F};color:${INK}"><tr><td style="font:800 10px ${F};color:${MUTED};padding:0 0 6px;border-bottom:2px solid ${INK}">MARKET</td><td align="right" style="font:800 10px ${F};color:${MUTED};padding:0 0 6px;border-bottom:2px solid ${INK}">MONTH END</td><td align="right" style="font:800 10px ${F};color:${MUTED};padding:0 0 6px;border-bottom:2px solid ${INK}">MONTH</td><td align="right" style="font:800 10px ${F};color:${MUTED};padding:0 0 6px;border-bottom:2px solid ${INK}">YEAR</td></tr>${sum.mercados.map((x: any) => `<tr><td style="padding:8px 0;border-bottom:1px solid ${LINE}"><b>${esc(x.name)}</b><br><span style="font-size:10px;color:${MUTED}">${esc(x.source)}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid ${LINE}">${x.kind === "yield" ? fmtNum(x.value, 2) + "%" : x.kind === "fx" ? fmtNum(x.value, 4) : fmtNum(x.value, x.value > 100 ? 0 : 2)}</td><td align="right" style="padding:8px 0 8px 8px;border-bottom:1px solid ${LINE};font-weight:800;color:${col(x.chg)}">${chg(x.chg, x.unit)}</td><td align="right" style="padding:8px 0 8px 8px;border-bottom:1px solid ${LINE};font-weight:800;color:${col(x.ytd)}">${chg(x.ytd, x.unit)}</td></tr>`).join("")}</table>`) : ""}
${drivers.length ? block(h5("Factors that moved the market") + drivers.map((d: any) => { const e = EFF[d.efeito] || EFF.mixed; return `<div style="margin:0 0 14px"><div style="font:800 15px/1.3 ${F};color:${INK}">${esc(d.factor)} <span style="font:800 11px ${F};color:${e[1]}">&nbsp;${e[0]}</span></div><div style="font:400 14px/1.55 ${F};color:${BODY};margin-top:4px">${mdE(d.texto)}</div></div>`; }).join("")) : ""}
${(sum.themes || []).length && (sum.drivers || []).length ? block(h5("Key themes") + sum.themes.map((t: any) => `<div style="margin:0 0 14px"><div style="font:800 15px/1.3 ${F};color:${INK}">${esc(t.titulo)}</div><div style="font:400 14px/1.55 ${F};color:${BODY};margin-top:4px">${mdE(t.texto)}</div></div>`).join("")) : ""}
${(sum.questoes || []).length ? block(h5("Questions the market is asking") + sum.questoes.map((q: any, i: number) => `<div style="margin:0 0 14px"><div style="font:800 15px/1.35 ${F};color:${INK}"><span style="color:${TEAL}">Q${i + 1}</span>&nbsp; ${esc(q.q)}</div><div style="font:400 14px/1.55 ${F};color:${BODY};margin-top:4px">${mdE(q.porque)}</div>${q.sinais ? `<div style="font:400 13px/1.5 ${F};color:${MUTED};margin-top:4px"><b>What would answer it:</b> ${esc(q.sinais)}</div>` : ""}</div>`).join("")) : ""}
${(sum.vigiar || []).length ? block(`<div style="font:800 12px/1 ${F};letter-spacing:1.5px;text-transform:uppercase;color:${MINT};margin:0 0 12px">What to watch next month</div>` + sum.vigiar.map((v: any) => `<div style="font:400 14px/1.55 ${F};color:#E6F7F4;margin:0 0 8px">→ ${esc(v)}</div>`).join(""), INK) : ""}
<tr><td align="left" style="padding:8px 32px 28px"><a href="${esc(site)}" style="display:inline-block;background:${MINT};color:${INK};font:800 15px/1 ${F};text-decoration:none;padding:15px 24px;border-radius:10px">Read the full factsheet &rarr;</a></td></tr>
${footer({ unsub: true, reason: "You're receiving the Monthly Brief because you subscribed on PaperMint. One email at the start of each month.",
  sources: "Sources: market data from S&amp;P Dow Jones Indices, Nasdaq, Cboe, the US Treasury, the US Energy Information Administration and ICE BofA (published by the Federal Reserve) and the European Central Bank; official indicators from the ECB, Eurostat and Bank of Portugal; analysis of public financial news. Written with the help of AI and checked against official data." })}
</table></td></tr></table></body></html>`;
}

// sends the month's factsheet to the Brevo list as a campaign; returns the campaign id, or null when Brevo is not configured
export async function mailFactsheet(ym: string, sum: any) {
  const key = process.env.BREVO_API_KEY, list = Number(process.env.BREVO_LIST_ID), from = process.env.BREVO_SENDER_EMAIL;
  if (!key || !list || !from) { console.log("factsheet email: Brevo not configured"); return null; }
  const api = async (path: string, body: any) => {
    const r = await fetch("https://api.brevo.com/v3" + path, { method: "POST", headers: { "api-key": key, "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
    const t = await r.text(); if (!r.ok) throw new Error(`Brevo ${path} ${r.status}: ${t.slice(0, 200)}`); return t ? JSON.parse(t) : {};
  };
  const month = monthName(ym);
  const c = await api("/emailCampaigns", { name: `Monthly Brief ${ym}`, subject: `The Monthly Brief · ${month}: ${String(sum.titulo || "the month in markets").slice(0, 70)}`,
    previewText: String(sum.sumup?.frase || sum.resumo || "").replace(/\*\*/g, "").slice(0, 140),
    sender: { name: process.env.BREVO_SENDER_NAME || "PaperMint", email: from }, htmlContent: factsheetHTML(ym, sum), recipients: { listIds: [list] } });
  await api(`/emailCampaigns/${c.id}/sendNow`, {});
  console.log("email: Monthly Brief sent,", ym, "campaign", c.id);
  return c.id;
}
