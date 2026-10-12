// One-off: puts the Brevo double opt-in email (template #1) in English, in the PaperMint look.
// Run by .github/workflows/brevo-setup.yml (manual) with the repo secret BREVO_API_KEY.
const key = process.env.BREVO_API_KEY!;
const H = { "api-key": key, "content-type": "application/json", accept: "application/json" };
const api = async (method: string, path: string, body?: any) => {
  const r = await fetch("https://api.brevo.com/v3" + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); console.log(method, path, r.status, method === "GET" ? "" : t.slice(0, 200)); return t ? JSON.parse(t) : {};
};
const F = "Manrope,Helvetica,Arial,sans-serif";
const html = `<!doctype html><html><body style="margin:0;background:#EEF8F6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF8F6"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:18px"><tr><td style="padding:36px 32px">
<div style="font:800 22px/1 ${F};color:#003C3B">Paper<i style="font-family:Georgia,serif;font-weight:400;color:#1F7F7C">Mint</i></div>
<div style="font:800 26px/1.25 ${F};color:#003C3B;margin:28px 0 12px">One click and you're in.</div>
<p style="font:400 16px/1.6 ${F};color:#1F3F3E;margin:0 0 24px">Please confirm your email to get <b>The Brief</b>: what money is doing and why it matters, in plain English, every weekday morning.</p>
<p style="margin:0 0 24px"><a href="{{ doubleoptin }}" style="display:inline-block;background:#003C3B;color:#FFFFFF;font:700 15px ${F};padding:14px 28px;border-radius:999px;text-decoration:none">Confirm my email</a></p>
<p style="font:400 13px/1.6 ${F};color:#5E8583;margin:0">Didn't ask for this? Just ignore this email and you won't hear from us.</p>
<p style="font:400 11px/1.5 ${F};color:#5E8583;margin:28px 0 0">PaperMint, a Nova SBE student project. Educational content only, not investment advice.</p>
</td></tr></table></td></tr></table></body></html>`;
const t = await api("GET", "/smtp/templates/1");
console.log("template 1:", t.name, "| subject:", t.subject, "| tag:", t.tag);
await api("PUT", "/smtp/templates/1", { subject: "Confirm your subscription to The Brief", htmlContent: html, sender: { name: "PaperMint", email: process.env.BREVO_SENDER_EMAIL }, templateName: "PaperMint double opt-in (EN)", isActive: true });
