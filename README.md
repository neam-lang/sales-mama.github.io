# Sales Mama · website

The GitHub Pages site for [Sales Mama](https://github.com/neam-lang/sales-mama.ai), the open-source sales harness
for Claude Code. Live at **https://neam-lang.github.io/sales-mama.github.io/**

| Page | What |
|---|---|
| `index.html` | Overview: hero with the YouTube starter, why, how it works, scenarios, approve-then-send, console gallery, a day, get started, films |
| `quickstart.html` | Install in five steps, connect Gmail and WhatsApp, rep / manager / runner / Codex, first prompts, health checks, troubleshooting |
| `scenarios.html` | Ten scenarios from the films: the words to type, what Sales Mama does, what you approve, with film chapters |
| `bench.html` | The Sales Mama score on the Sales Harness Bench: leaderboard, scoring, tracks, violations, how to run it, links to the 🤗 Space and dataset |
| `end-to-end.html` | The loop from a 2 am signal to a Friday review, roles, the repo, markets, guardrails, commands, quality, docs |
| `films.html` | The YouTube starter plus ten films with chapters, each linked to its file in the main repo |

Plain HTML, no build step. `site/site.css` carries the console's design tokens, `site/site.js` the behaviour
(live send windows, ⌘K jump palette, film player, YouTube click-to-play, copy buttons, tabs, zoom),
`site/icons.js` the Lucide icons (ISC). `assets/` holds copies of the screens and films from
`docs/assets/` in the main repo; refresh them from there when they change.

Preview: `python3 -m http.server 8000` (Python's server can't seek inside videos; GitHub Pages can).

Screens and films use fictional demo data, except public ACRA registry figures. Apache 2.0.
