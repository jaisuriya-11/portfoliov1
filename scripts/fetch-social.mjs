/**
 * Fetches live profile numbers at build/dev start and writes public/social.json,
 * which the social hover cards read first (same origin, no CORS, no rate limit).
 *
 *  - LeetCode: its own GraphQL API (blocked for browsers by CORS, fine from Node).
 *  - GitHub: the public REST API.
 * Instagram and LinkedIn have no public API without signing in, so their cards
 * keep the snapshot in src/data/profile.ts.
 *
 * Never fails the build: on any error the previous file (or none) is kept.
 */
import { readFile, writeFile } from "node:fs/promises";

const OUT = new URL("../public/social.json", import.meta.url);
const LEETCODE = "jai_sa";
const GITHUB = "jaisuriya-11";

const withTimeout = (p, ms = 8000) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

async function leetcode() {
  const query = `query($u: String!) {
    matchedUser(username: $u) { profile { ranking userAvatar realName } submitStatsGlobal { acSubmissionNum { difficulty count } } }
    userContestRanking(username: $u) { rating }
  }`;
  const r = await withTimeout(
    fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "content-type": "application/json", referer: "https://leetcode.com" },
      body: JSON.stringify({ query, variables: { u: LEETCODE } }),
    }),
  );
  if (!r.ok) throw new Error(`leetcode ${r.status}`);
  const { data } = await r.json();
  const u = data?.matchedUser;
  if (!u) throw new Error("leetcode: no user");
  const by = Object.fromEntries(u.submitStatsGlobal.acSubmissionNum.map((x) => [x.difficulty, x.count]));
  return {
    name: u.profile.realName || undefined,
    avatar: u.profile.userAvatar || undefined,
    rank: u.profile.ranking,
    rating: data.userContestRanking?.rating ?? undefined,
    all: by.All,
    easy: by.Easy,
    medium: by.Medium,
    hard: by.Hard,
  };
}

async function github() {
  const r = await withTimeout(fetch(`https://api.github.com/users/${GITHUB}`, { headers: { accept: "application/vnd.github+json" } }));
  if (!r.ok) throw new Error(`github ${r.status}`);
  const u = await r.json();
  return { name: u.name ?? undefined, avatar: u.avatar_url, location: u.location ?? undefined, followers: u.followers, following: u.following, repos: u.public_repos };
}

let prev = {};
try {
  prev = JSON.parse(await readFile(OUT, "utf8"));
} catch {
  /* first run */
}

const [lc, gh] = await Promise.allSettled([leetcode(), github()]);
const next = {
  fetchedAt: new Date().toISOString(),
  leetcode: lc.status === "fulfilled" ? lc.value : prev.leetcode,
  github: gh.status === "fulfilled" ? gh.value : prev.github,
};
for (const [k, v] of [["leetcode", lc], ["github", gh]]) if (v.status === "rejected") console.warn(`[social] ${k}: ${v.reason?.message ?? v.reason} (kept previous)`);
await writeFile(OUT, JSON.stringify(next, null, 2) + "\n");
console.log(`[social] wrote public/social.json (leetcode ${next.leetcode ? "ok" : "none"}, github ${next.github ? "ok" : "none"})`);
