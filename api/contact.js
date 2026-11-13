/**
 * POST /api/contact — sends a message from the site's email form through Resend.
 *
 * Env (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY  required. From resend.com → API Keys.
 *   CONTACT_TO      optional. Inbox that receives messages (defaults to the portfolio address).
 *   CONTACT_FROM    optional. A sender on a domain verified in Resend. Until one is set,
 *                   Resend's shared test sender is used, which only delivers to the
 *                   Resend account owner's own address.
 */
const TO = process.env.CONTACT_TO || "jaisuriya200297@gmail.com";
const FROM = process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: "Email is not set up yet" });

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  // Honeypot: real people never fill the hidden "website" field.
  if (body.website) return res.status(200).json({ ok: true });

  const name = String(body.name || "").trim().slice(0, 100);
  const email = String(body.email || "").trim().slice(0, 200);
  const message = String(body.message || "").trim().slice(0, 5000);
  if (!name || !EMAIL.test(email) || message.length < 2) return res.status(400).json({ error: "Please fill in your name, a valid email and a message" });

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `Portfolio: message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
      html: `<p style="white-space:pre-wrap">${escape(message)}</p><p>— ${escape(name)} &lt;${escape(email)}&gt;</p>`,
    }),
  });
  if (!r.ok) return res.status(502).json({ error: "Could not send right now" });
  return res.status(200).json({ ok: true });
}

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
