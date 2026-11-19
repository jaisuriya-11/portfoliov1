/**
 * POST /api/online — live "people on the page right now" count.
 *
 * Each open tab posts { id } every ~20s (a random id, kept per tab), and
 * { id, leave: true } when it's closed or hidden. Tabs are kept in a Redis
 * sorted set scored by their last ping; anything silent for 45s drops out.
 * Responds { online: <count> }.
 *
 * Env (added automatically when an Upstash Redis store is connected in
 * Vercel → Storage; either naming works):
 *   KV_REST_API_URL / KV_REST_API_TOKEN, or
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "portfolio:online";
const WINDOW_MS = 45_000;
const ID = /^[a-z0-9]{8,40}$/i;

const safeJson = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!URL_ || !TOKEN) return res.status(503).json({ error: "Live count is not set up yet" });

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const id = String(body.id || "");
  if (!ID.test(id)) return res.status(400).json({ error: "Bad id" });

  const now = Date.now();
  const commands = [
    body.leave ? ["ZREM", KEY, id] : ["ZADD", KEY, String(now), id],
    ["ZREMRANGEBYSCORE", KEY, "0", String(now - WINDOW_MS)],
    ["ZCARD", KEY],
    // The whole set expires if the site goes quiet for an hour.
    ["PEXPIRE", KEY, "3600000"],
  ];
  const r = await fetch(`${URL_}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!r.ok) return res.status(502).json({ error: "Count unavailable" });
  const out = await r.json();
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ online: Number(out?.[2]?.result) || 0 });
}
