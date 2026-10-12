// One-off: puts the Brevo subscription emails (templates #1 to #4) in English, in the PaperMint look,
// all about the Monthly Brief. Run by .github/workflows/brevo-setup.yml (manual) with the repo secret BREVO_API_KEY.
// Any link placeholder Brevo had in a template (e.g. a resubscribe link) is kept, so nothing breaks.
import { SITE, F, HEAD, logo, footer } from "./email-kit.mts";
const key = process.env.BREVO_API_KEY!;
const H = { "api-key": key, "content-type": "application/json", accept: "application/json" };
const api = async (method: string, path: string, body?: any) => {
  const r = await fetch("https://api.brevo.com/v3" + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); console.log(method, path, r.status, method === "GET" ? "" : t.slice(0, 200)); return t ? JSON.parse(t) : {};
};
const button = (href: string, label: string) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr><td style="background:#003C3B;border-radius:999px"><a href="${href}" style="display:inline-block;color:#FFFFFF;font:700 15px ${F};padding:14px 28px;text-decoration:none">${label}</a></td></tr></table>`;
const para = (t: string) => `<p style="font:400 16px/1.6 ${F};color:#1F3F3E;margin:0 0 22px">${t}</p>`;
const small = (t: string) => `<p style="font:400 13px/1.6 ${F};color:#4D716E;margin:0">${t}</p>`;
const REASON = "You're receiving this email because this address was used to subscribe to the Monthly Brief on PaperMint.";
const page = (title: string, body: string, extra = "") => `<!doctype html><html lang="en"><head>${HEAD}</head><body style="margin:0;background:#EEF8F6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF8F6"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:18px">
<tr><td style="padding:34px 32px 6px">${logo()}
<div style="font:800 26px/1.25 ${F};color:#003C3B;letter-spacing:-.5px;margin:30px 0 14px">${title}</div>
${body}${extra}</td></tr>
${footer({ reason: REASON })}
</table></td></tr></table></body></html>`;
const WHAT = "the month in markets, the numbers that mattered and what to watch next, explained in plain English";

const T: Record<number, { name: string; subject: string; html: string }> = {
  1: { name: "PaperMint · confirm subscription (EN)", subject: "Confirm your subscription to the Monthly Brief",
    html: page("One click and you're in.", para(`Confirm your email and the <b>Monthly Brief</b> will arrive at the start of every month: ${WHAT}.`) + button("{{ doubleoptin }}", "Confirm my subscription") + small("Didn't sign up? Simply ignore this email and you won't hear from us.")) },
  2: { name: "PaperMint · subscribed (EN)", subject: "You're subscribed to the Monthly Brief",
    html: page("You're on the list.", para(`Thanks for subscribing. Your first <b>Monthly Brief</b> arrives at the start of next month: ${WHAT}.`) + button(SITE, "Explore PaperMint") + small("Changed your mind? Every Monthly Brief has a one-click unsubscribe link.")) },
  3: { name: "PaperMint · welcome (EN)", subject: "Welcome to the Monthly Brief",
    html: page("Welcome aboard.", para(`Your subscription is confirmed. At the start of every month you'll get the <b>Monthly Brief</b>: ${WHAT}.`) + para("Until then, the day's financial news is always free on the website.") + button(SITE, "Read today's news") + small("Changed your mind? Every Monthly Brief has a one-click unsubscribe link.")) },
  4: { name: "PaperMint · unsubscribed (EN)", subject: "You've unsubscribed from the Monthly Brief",
    html: page("You're unsubscribed.", para("You won't receive the Monthly Brief any more. The financial news stays free on the website whenever you need it.") + button(SITE, "Visit PaperMint") + small("Unsubscribed by mistake? You can sign up again on the website in a few seconds.")) },
};

for (const id of [1, 2, 3, 4]) {
  const t = await api("GET", `/smtp/templates/${id}`);
  if (!t?.id) { console.log(`template ${id}: not found, skipped`); continue; }
  console.log(`template ${id}:`, t.name, "| subject:", t.subject);
  // keep every link placeholder the original had and ours lacks
  const keep = [...new Set([...String(t.htmlContent || "").matchAll(/href="(\{\{\s*[\w.]+\s*\}\})"/g)].map((m) => m[1]))]
    .filter((ph) => !T[id].html.includes(ph));
  const extra = keep.map((ph) => `<p style="margin:12px 0 0"><a href="${ph}" style="font:700 13px ${F};color:#1F7F7C">${/unsub/i.test(ph) ? "Unsubscribe" : /resub|subscribe/i.test(ph) ? "Subscribe again" : "Manage my subscription"}</a></p>`).join("");
  if (keep.length) console.log(`template ${id}: keeping`, keep.join(", "));
  const html = extra ? T[id].html.replace("</td></tr>\n<tr><td style=\"padding:22px", `${extra}</td></tr>\n<tr><td style="padding:22px`) : T[id].html;
  await api("PUT", `/smtp/templates/${id}`, { subject: T[id].subject, htmlContent: html, sender: { name: "PaperMint", email: process.env.BREVO_SENDER_EMAIL }, templateName: T[id].name, isActive: true });
}
