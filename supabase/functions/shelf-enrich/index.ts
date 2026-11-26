// shelf-enrich: reads the page behind each new Later-shelf link and stores what it is about
// (title, description, author, site, duration, a text excerpt) so it can be found by content.
// Called by the app after a save and on load for anything not yet read. Runs as the signed-in user.
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const MAX_BYTES = 2_000_000;

const ent = (s: string) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&nbsp;/g, " ");
const clean = (s?: string | null) => s ? ent(s).replace(/\s+/g, " ").trim() : "";

function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (!/^https?:$/.test(u.protocol)) return null;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || /^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(":")) return null;
    return u;
  } catch { return null; }
}

async function get(url: string, ms = 9000): Promise<{ html: string; final: string } | null> {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en", Accept: "text/html,application/xhtml+xml,application/json" }, redirect: "follow", signal: ctl.signal });
    if (!r.ok || !r.body) return null;
    const final = r.url || url; if (!safeUrl(final)) return null;
    const reader = r.body.getReader(); const chunks: Uint8Array[] = []; let n = 0;
    while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); n += value.length; if (n > MAX_BYTES) { await reader.cancel(); break; } }
    const buf = new Uint8Array(n); let o = 0; for (const c of chunks) { buf.set(c.subarray(0, Math.min(c.length, n - o)), o); o += c.length; if (o >= n) break; }
    return { html: new TextDecoder().decode(buf), final };
  } catch { return null; } finally { clearTimeout(t); }
}

function meta(html: string, keys: string[]): string {
  for (const k of keys) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${k}["'][^>]*content=["']([^"']*)["']`, "i");
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name|itemprop)=["']${k}["']`, "i");
    const m = html.match(re1) || html.match(re2); if (m && clean(m[1])) return clean(m[1]);
  }
  return "";
}

function pageText(html: string): string {
  let h = html.replace(/<(script|style|noscript|svg|nav|header|footer|form|aside|iframe)[\s\S]*?<\/\1>/gi, " ");
  const art = h.match(/<article[\s\S]*?<\/article>/i) || h.match(/<main[\s\S]*?<\/main>/i);
  if (art) h = art[0];
  return clean(h.replace(/<br\s*\/?>|<\/(p|div|li|h\d)>/gi, "\n").replace(/<[^>]+>/g, " "));
}

const ytId = (u: URL) => u.hostname.endsWith("youtu.be") ? u.pathname.slice(1).split("/")[0] : u.searchParams.get("v") || (u.pathname.match(/\/(shorts|embed|live)\/([\w-]{6,})/)?.[2] ?? null);

type Info = { title?: string; summary?: string; author?: string; site?: string; content?: string; minutes?: number | null; format?: string };

// official oEmbed endpoints: no scraping, and they work where a site blocks page reads from servers
const OEMBED: [RegExp, (u: string) => string, string][] = [
  [/(^|\.)(youtube\.com|youtu\.be)$/, (u) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(u)}`, "YouTube"],
  [/(^|\.)spotify\.com$/, (u) => `https://open.spotify.com/oembed?url=${encodeURIComponent(u)}`, "Spotify"],
  [/(^|\.)vimeo\.com$/, (u) => `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(u)}`, "Vimeo"],
  [/(^|\.)soundcloud\.com$/, (u) => `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(u)}`, "SoundCloud"],
  [/(^|\.)tiktok\.com$/, (u) => `https://www.tiktok.com/oembed?url=${encodeURIComponent(u)}`, "TikTok"],
];
async function oembed(u: URL): Promise<Info | null> {
  const hit = OEMBED.find(([re]) => re.test(u.hostname)); if (!hit) return null;
  const href = /youtu/.test(u.hostname) && ytId(u) ? `https://www.youtube.com/watch?v=${ytId(u)}` : u.href;
  const o = await get(hit[1](href)); if (!o) return null;
  try {
    const j = JSON.parse(o.html);
    const info: Info = { site: hit[2], title: clean(j.title), author: clean(j.author_name), summary: clean(j.description).slice(0, 1200) };
    if (j.duration) info.minutes = Math.max(1, Math.round(+j.duration / 60));
    return info.title ? info : null;
  } catch { return null; }
}

async function youtube(u: URL): Promise<Info | null> {
  const id = ytId(u); if (!id) return null;
  const info: Info = { site: "YouTube", format: "watch" };
  // the watch page has the description and length, but YouTube often blocks server reads; oEmbed fills the gaps
  const pg = await get(`https://www.youtube.com/watch?v=${id}&hl=en`);
  if (pg) {
    const m = pg.html.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\})\s*;\s*(?:var\s|<\/script>)/);
    if (m) { try { const d = JSON.parse(m[1]).videoDetails || {};
      info.title = clean(d.title); info.author = clean(d.author); info.summary = clean(d.shortDescription).slice(0, 1200);
      if (d.lengthSeconds) info.minutes = Math.max(1, Math.round(+d.lengthSeconds / 60));
      if (Array.isArray(d.keywords)) info.content = d.keywords.join(", ");
    } catch { /* fall through */ } }
  }
  if (!info.title) { const o = await oembed(u); if (o) { info.title = o.title; info.author = o.author; } }
  return info.title ? info : null;
}

async function page(u: URL): Promise<Info | null> {
  const pg = await get(u.href); if (!pg) return null;
  const h = pg.html, info: Info = {};
  info.title = meta(h, ["og:title", "twitter:title"]) || clean(h.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  info.summary = meta(h, ["og:description", "description", "twitter:description"]).slice(0, 1200);
  info.author = meta(h, ["author", "article:author", "parsely-author", "og:audio:artist", "music:musician"]);
  info.site = meta(h, ["og:site_name", "application-name"]) || new URL(pg.final).hostname.replace(/^www\./, "");
  const dur = meta(h, ["music:duration", "video:duration", "og:video:duration", "duration"]);
  const iso = dur.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (iso) info.minutes = Math.max(1, (+(iso[1] || 0)) * 60 + (+(iso[2] || 0)) + Math.round(+(iso[3] || 0) / 60));
  else if (/^\d+$/.test(dur)) info.minutes = Math.max(1, Math.round(+dur / 60));
  const text = pageText(h);
  if (!info.minutes && !/spotify|podcasts\.apple|overcast|soundcloud|vimeo/.test(u.hostname)) {
    const words = text.split(/\s+/).filter(Boolean).length;
    if (words > 150) info.minutes = Math.max(1, Math.round(words / 230));
  }
  info.content = text.slice(0, 4000);
  return info.title || info.summary ? info : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const auth = req.headers.get("Authorization") || "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  let body: { id?: string; force?: boolean } = {};
  try { body = await req.json(); } catch { /* empty body */ }
  let q = sb.from("shelf").select("id,url,title,minutes,format,summary").not("url", "is", null).neq("status", "dropped").limit(6);
  q = body.id ? q.eq("id", body.id) : q.is("enriched_at", null);
  if (body.id && !body.force) q = q.is("enriched_at", null);
  const { data: rows, error } = await q;
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 401, headers: { ...CORS, "Content-Type": "application/json" } });
  const out: { id: string; ok: boolean }[] = [];
  await Promise.all((rows || []).map(async (r) => {
    const u = safeUrl(r.url);
    let info: Info | null = null;
    if (u) {
      if (/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(u.hostname)) info = await youtube(u);
      else {
        const [o, p] = await Promise.all([oembed(u), page(u)]);
        // a provider's oEmbed title beats an app-shell page title ("Spotify – Web Player")
        info = o || p ? { ...(p || {}), ...Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v)) } : null;
      }
    }
    const patch: Record<string, unknown> = { enriched_at: new Date().toISOString() };
    if (info) {
      if (info.summary && !r.summary) patch.summary = info.summary; // keep a summary a chat wrote
      if (info.author) patch.author = info.author.slice(0, 200);
      if (info.site) patch.site = info.site.slice(0, 120);
      if (info.content) patch.content = info.content;
      if (!r.minutes && info.minutes && info.minutes < 1000) patch.minutes = info.minutes;
      // replace a title that is only the link (what Capture uses when nothing was typed)
      const host = u!.hostname.replace(/^www\./, "");
      if (info.title && (!r.title || r.title.startsWith(host) || /^https?:/.test(r.title))) patch.title = info.title.slice(0, 300);
      patch.enrich_error = null;
    } else patch.enrich_error = u ? "Couldn't read the page" : "Not a public web link";
    const { error: e } = await sb.from("shelf").update(patch).eq("id", r.id);
    out.push({ id: r.id, ok: !e && !!info });
  }));
  return new Response(JSON.stringify({ done: out }), { headers: { ...CORS, "Content-Type": "application/json" } });
});
