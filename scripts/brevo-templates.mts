// One-off: puts the Brevo subscription emails (templates #1 to #4) in English, in the PaperMint look.
// Run by .github/workflows/brevo-setup.yml (manual) with the repo secret BREVO_API_KEY.
// Any link placeholder Brevo had in a template (e.g. a resubscribe link) is kept, so nothing breaks.
const key = process.env.BREVO_API_KEY!;
const H = { "api-key": key, "content-type": "application/json", accept: "application/json" };
const api = async (method: string, path: string, body?: any) => {
  const r = await fetch("https://api.brevo.com/v3" + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); console.log(method, path, r.status, method === "GET" ? "" : t.slice(0, 200)); return t ? JSON.parse(t) : {};
};
const SITE = "https://anadevesa-lab.github.io/literacy-radar/";
const F = "Manrope,Helvetica,Arial,sans-serif";
const button = (href: string, label: string) => `<p style="margin:0 0 24px"><a href="${href}" style="display:inline-block;background:#003C3B;color:#FFFFFF;font:700 15px ${F};padding:14px 28px;border-radius:999px;text-decoration:none">${label}</a></p>`;
const page = (title: string, body: string, extra = "") => `<!doctype html><html><body style="margin:0;background:#EEF8F6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF8F6"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:18px"><tr><td style="padding:36px 32px">
<div style="font:800 22px/1 ${F};color:#003C3B">Paper<i style="font-family:Georgia,serif;font-weight:400;color:#1F7F7C">Mint</i></div>
<div style="font:800 26px/1.25 ${F};color:#003C3B;margin:28px 0 12px">${title}</div>
${body}${extra}
<p style="font:400 11px/1.5 ${F};color:#5E8583;margin:28px 0 0">PaperMint, a Nova SBE student project. Educational content only, not investment advice.</p>
</td></tr></table></td></tr></table></body></html>`;
const para = (t: string) => `<p style="font:400 16px/1.6 ${F};color:#1F3F3E;margin:0 0 24px">${t}</p>`;
const small = (t: string) => `<p style="font:400 13px/1.6 ${F};color:#5E8583;margin:0">${t}</p>`;
const WHAT = "<b>The Brief</b> every weekday morning, and the <b>monthly factsheet</b> at the start of each month: what money is doing and why it matters, in plain English.";

const T: Record<number, { name: string; subject: string; html: string }> = {
  1: { name: "PaperMint double opt-in (EN)", subject: "Confirm your subscription to PaperMint",
    html: page("One click and you're in.", para(`Please confirm your email to get ${WHAT}`) + button("{{ doubleoptin }}", "Confirm my email") + small("Didn't ask for this? Just ignore this email and you won't hear from us.")) },
  2: { name: "PaperMint confirmation (EN)", subject: "Welcome to PaperMint",
    html: page("You're subscribed.", para(`Thanks for joining. You'll get ${WHAT}`) + button(SITE, "Open PaperMint") + small("You can unsubscribe at any time from the link at the end of every email.")) },
  3: { name: "PaperMint final confirmation (EN)", subject: "You're in: welcome to PaperMint",
    html: page("Welcome aboard.", para(`Your email is confirmed. From now on you'll get ${WHAT}`) + button(SITE, "Read today's news") + small("You can unsubscribe at any time from the link at the end of every email.")) },
  4: { name: "PaperMint unsubscribe (EN)", subject: "You've been unsubscribed from PaperMint",
    html: page("You're unsubscribed.", para("You won't receive The Brief or the monthly factsheet any more. The news stays free on the website whenever you want it.") + button(SITE, "Visit PaperMint") + small("Unsubscribed by mistake? You can sign up again on the website.")) },
};

for (const id of [1, 2, 3, 4]) {
  const t = await api("GET", `/smtp/templates/${id}`);
  if (!t?.id) { console.log(`template ${id}: not found, skipped`); continue; }
  console.log(`template ${id}:`, t.name, "| subject:", t.subject);
  // keep every link placeholder the original had and ours lacks
  const keep = [...new Set([...String(t.htmlContent || "").matchAll(/href="(\{\{\s*[\w.]+\s*\}\})"/g)].map((m) => m[1]))]
    .filter((ph) => !T[id].html.includes(ph.replace(/\s+/g, " ")) && !T[id].html.includes(ph));
  const extra = keep.map((ph) => `<p style="margin:12px 0 0"><a href="${ph}" style="font:700 13px ${F};color:#1F7F7C">${/unsub/i.test(ph) ? "Unsubscribe" : /resub|subscribe/i.test(ph) ? "Subscribe again" : "Manage my subscription"}</a></p>`).join("");
  if (keep.length) console.log(`template ${id}: keeping`, keep.join(", "));
  const html = extra ? T[id].html.replace("</td></tr></table></td></tr></table></body>", `${extra}</td></tr></table></td></tr></table></body>`) : T[id].html;
  await api("PUT", `/smtp/templates/${id}`, { subject: T[id].subject, htmlContent: html, sender: { name: "PaperMint", email: process.env.BREVO_SENDER_EMAIL }, templateName: T[id].name, isActive: true });
}
