#!/usr/bin/env python3
"""Tharavad Library: hunt for things worth reading, free APIs only.

Usage:  python3 -I tools/library/find.py <books|studies|podcasts|youtube|all> "<question or words>" [--n 5]

Prints JSON lines: {"kind","title","author","year","url","why"} so the Librarian can score them
and queue the best into library_sources. Exa / Nimble web search (connectors) cover everything else.
  books     Open Library (title, author, year, subjects; we read the author's talks, essays and interviews, never the book file)
  studies   OpenAlex (free, no key; sorted by citations) + arXiv
  podcasts  Apple Podcasts search (returns the RSS feed; fetch.py reads its free transcript or runs Whisper)
  youtube   yt-dlp search (free; prefers long talks and interviews)

Tested 22 Nov 2026 from a cloud session: podcasts and YouTube search worked; Open Library, OpenAlex
and arXiv refused the shared cloud IP (reset / 429 / timeout) and YouTube subtitles hit "confirm you're
not a bot" after one success. So on cloud runs: books and studies via the Exa connector
(web_search_exa, then web_fetch_exa), YouTube transcripts via vidIQ when fetch.py exits 3.
"""
import argparse, json, re, subprocess, sys, urllib.parse, urllib.request, xml.etree.ElementTree as ET

UA = {"User-Agent": "Mozilla/5.0 (library find)"}

def j(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.load(r)

def out(**k): print(json.dumps(k, ensure_ascii=False))

def books(q, n):
    d = j("https://openlibrary.org/search.json?" + urllib.parse.urlencode({"q": q, "limit": n * 2, "fields": "key,title,author_name,first_publish_year,edition_count,subject"}))
    docs = sorted(d.get("docs", []), key=lambda x: -(x.get("edition_count") or 0))[:n]
    for x in docs:
        out(kind="book", title=x.get("title"), author=", ".join(x.get("author_name", [])[:2]), year=x.get("first_publish_year"),
            url="https://openlibrary.org" + x["key"], why=f"{x.get('edition_count', 0)} editions; subjects: " + ", ".join((x.get("subject") or [])[:4]))

def studies(q, n):
    try:
        d = j("https://api.openalex.org/works?" + urllib.parse.urlencode({"search": q, "per-page": n, "sort": "cited_by_count:desc",
                                                                         "filter": "from_publication_date:2010-01-01"}))
        for w in d.get("results", []):
            url = (w.get("open_access") or {}).get("oa_url") or w.get("doi") or w.get("id")
            out(kind="study", title=w.get("display_name"), author=", ".join(a["author"]["display_name"] for a in w.get("authorships", [])[:2]),
                year=w.get("publication_year"), url=url, why=f"cited {w.get('cited_by_count', 0)} times; open access: {bool((w.get('open_access') or {}).get('is_oa'))}")
    except Exception as e:
        print(f"openalex failed: {e}", file=sys.stderr)
    try:
        with urllib.request.urlopen("http://export.arxiv.org/api/query?" + urllib.parse.urlencode({"search_query": "all:" + q, "max_results": max(2, n // 2)}), timeout=30) as r:
            root = ET.fromstring(r.read())
        ns = {"a": "http://www.w3.org/2005/Atom"}
        for e in root.findall("a:entry", ns):
            out(kind="study", title=re.sub(r"\s+", " ", e.findtext("a:title", "", ns)), author=", ".join(x.findtext("a:name", "", ns) for x in e.findall("a:author", ns)[:2]),
                year=(e.findtext("a:published", "", ns) or "")[:4], url=e.findtext("a:id", "", ns), why="arXiv preprint")
    except Exception as e:
        print(f"arxiv failed: {e}", file=sys.stderr)

def podcasts(q, n):
    d = j("https://itunes.apple.com/search?" + urllib.parse.urlencode({"term": q, "media": "podcast", "entity": "podcastEpisode", "limit": n}))
    for x in d.get("results", []):
        out(kind="podcast", title=x.get("trackName"), author=x.get("collectionName"), year=(x.get("releaseDate") or "")[:10],
            url=x.get("episodeUrl") or x.get("trackViewUrl"), feed=x.get("feedUrl"),
            minutes=round((x.get("trackTimeMillis") or 0) / 60000), why=(x.get("description") or "")[:160])

def youtube(q, n):
    r = subprocess.run(["yt-dlp", "--flat-playlist", "--print", "%(id)s\t%(title)s\t%(channel)s\t%(duration)s\t%(view_count)s",
                        f"ytsearch{n * 2}:{q}"], capture_output=True, text=True, timeout=120)
    rows = [l.split("\t") for l in r.stdout.splitlines() if l.count("\t") >= 4]
    rows = [x for x in rows if x[3] not in ("NA", "None", "") and float(x[3]) >= 600][:n]  # talks and interviews, not Shorts
    for vid, title, chan, dur, views in rows:
        out(kind="youtube", title=title, author=chan, url=f"https://youtu.be/{vid}", minutes=round(float(dur) / 60),
            why=f"{views} views")

def main():
    p = argparse.ArgumentParser(); p.add_argument("what"); p.add_argument("q"); p.add_argument("--n", type=int, default=5)
    a = p.parse_args()
    fns = {"books": books, "studies": studies, "podcasts": podcasts, "youtube": youtube}
    for name in (fns if a.what == "all" else [a.what]):
        try: fns[name](a.q, a.n)
        except Exception as e: print(f"{name} failed: {e}", file=sys.stderr)

if __name__ == "__main__":
    main()
