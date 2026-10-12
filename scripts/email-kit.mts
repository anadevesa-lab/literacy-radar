// Shared pieces of every PaperMint email (Brevo templates and the Monthly Brief):
// the wordmark as an image (email apps don't load the site's fonts, so the logo would fall back to Arial)
// and the footer with the legal notice. assets/email-logo*.png are drawn from Manrope 800 + Instrument Serif italic.
export const SITE = "https://anadevesa-lab.github.io/literacy-radar/";
export const F = "Manrope,'Helvetica Neue',Helvetica,Arial,sans-serif";
export const HEAD = `<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap" rel="stylesheet">`;

// dark wordmark for white backgrounds, light one for the dark green
export const logo = (light = false, h = 24) =>
  `<img src="${SITE}assets/email-logo${light ? "-light" : ""}.png" width="${Math.round(h * 396 / 90)}" height="${h}" alt="PaperMint" style="display:block;border:0;outline:none;width:${Math.round(h * 396 / 90)}px;height:${h}px">`;

// the footer: why you get this, who sends it, the legal notice, links. `unsub` adds Brevo's unsubscribe link (campaigns only)
export function footer(opts: { reason: string; unsub?: boolean; sources?: string }) {
  const s = (t: string, extra = "") => `<p style="font:400 11px/1.6 ${F};color:#5E8583;margin:0 0 10px${extra}">${t}</p>`;
  return `<tr><td style="padding:22px 32px 30px;border-top:1px solid #D7ECE7">
${logo(false, 16)}
<div style="height:12px;line-height:12px">&nbsp;</div>
${s(opts.reason)}
${opts.sources ? s(opts.sources) : ""}
${s("<b>Important:</b> PaperMint is a student project for the Nova SBE course “Boosting productivity with AI”. Everything we send is for financial education only. It is not investment, tax or legal advice, nor a recommendation to buy or sell any financial product. The value of investments can fall as well as rise, and past performance is not a guide to future returns.")}
${s(`<a href="${SITE}" style="color:#1F7F7C;font-weight:700;text-decoration:none">Visit PaperMint</a>${opts.unsub ? ` &nbsp;·&nbsp; <a href="{{ unsubscribe }}" style="color:#1F7F7C;font-weight:700;text-decoration:none">Unsubscribe</a>` : ""}`)}
${s(`© ${new Date().getFullYear()} PaperMint. All rights reserved.`, ";margin:0")}
</td></tr>`;
}
