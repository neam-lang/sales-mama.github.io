/* Sales Mama site: small, dependency-free behaviour. Every feature degrades to plain links without JS. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  root.classList.add('js');
  var $ = function (s, el) { return (el || doc).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };
  var icon = function (n, cls) { return '<svg class="i ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ── Theme: follows the system unless the visitor picks one (same rule as the console). ── */
  function setTheme(t) { root.setAttribute('data-theme', t); try { localStorage.setItem('sm-theme', t); } catch (e) {} }
  $$('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      setTheme(cur === 'dark' ? 'light' : 'dark');
    });
  });

  /* ── Live send windows: knowledge/markets.yaml (SG live first; MY and IN next). ── */
  var MARKETS = [
    { code: 'SG', name: 'Singapore', tz: 'Asia/Singapore', days: [1, 2, 3, 4], open: 540, close: 690, label: '09:00–11:30 SGT · Mon–Thu',
      hol: ['2026-11-09', '2026-12-25', '2027-01-01', '2027-02-08', '2027-03-10', '2027-03-26', '2027-05-17', '2027-05-20', '2027-08-09', '2027-10-28', '2027-12-25'] },
    { code: 'MY', name: 'Malaysia', tz: 'Asia/Kuala_Lumpur', days: [1, 2, 3, 4], open: 570, close: 690, label: '09:30–11:30 MYT · Mon–Thu', hol: [] },
    { code: 'IN', name: 'India', tz: 'Asia/Kolkata', days: [1, 2, 3, 4, 5], open: 600, close: 750, label: '10:00–12:30 IST · Mon–Fri', hol: [] }
  ];
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function local(tz) {
    var p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var h = +p.hour % 24;
    return { y: +p.year, m: +p.month, d: +p.day, min: h * 60 + (+p.minute), hhmm: (h < 10 ? '0' : '') + h + ':' + p.minute };
  }
  function hm(m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + 'h ' + (r < 10 ? '0' : '') + r + 'm' : r + ' min'; }
  function clock(m) { var h = Math.floor(m / 60), r = m % 60; return (h < 10 ? '0' : '') + h + ':' + (r < 10 ? '0' : '') + r; }
  function windowState(mk) {
    var L = local(mk.tz);
    for (var i = 0; i < 15; i++) {
      var dt = new Date(Date.UTC(L.y, L.m - 1, L.d + i));
      var iso = dt.toISOString().slice(0, 10), wd = dt.getUTCDay();
      if (mk.days.indexOf(wd) < 0 || mk.hol.indexOf(iso) >= 0) continue;
      if (i === 0 && L.min >= mk.open && L.min < mk.close) return { open: true, now: L.hhmm, text: 'open · ' + hm(mk.close - L.min) + ' left' };
      if (i === 0 && L.min >= mk.close) continue;
      var wait = i * 1440 + mk.open - L.min;
      return { open: false, now: L.hhmm, text: wait < 1440 ? 'opens in ' + hm(wait) : 'opens ' + DAY[wd] + ' ' + clock(mk.open) };
    }
    return { open: false, now: L.hhmm, text: 'closed' };
  }
  function paintMarkets() {
    MARKETS.forEach(function (mk) {
      var s; try { s = windowState(mk); } catch (e) { return; }
      $$('[data-market="' + mk.code + '"]').forEach(function (el) {
        el.classList.toggle('open', s.open);
        var t = $('[data-now]', el), st = $('[data-st]', el);
        if (t) t.textContent = s.now;
        if (st) st.textContent = s.text;
        el.title = mk.name + ' send window ' + mk.label + ': ' + s.text;
      });
    });
  }
  paintMarkets();
  setInterval(paintMarkets, 30000);

  /* ── Films: docs/assets/video (720p copies kept in git). Chapters match the YouTube uploads. ── */
  var REPO = 'https://github.com/neam-lang/sales-mama.ai';
  var EP = function (a) { return [[0, 'The problem'], [27, 'How Sales Mama fixes it']].concat(a, [[253, 'Before and after'], [272, 'Recap']]); };
  var FILMS = {
    pitch: { t: 'Sales Mama in 2 minutes', s: 'The next-gen sales buddy. Music and on-screen words.', f: 'sales-mama-2min-720p.mp4', p: 'assets/video/thumbnail.jpg', d: '2:01', ch: [] },
    tour: { t: 'The full tour', s: 'Morning, ask, engage, schedule, lead and trust, in five minutes.', f: 'sales-mama-5min-720p.mp4', p: 'assets/film/v2/youtube/08-thumb-tour.jpg', d: '5:01',
      ch: [[0, 'The problem'], [13, 'Meet Sales Mama'], [25, 'Morning'], [48, 'Ask'], [94, 'Engage'], [124, 'Schedule'], [161, 'Lead'], [228, 'Trust'], [272, 'Everything in one place']] },
    install: { t: 'Install and set up', s: 'A real install recorded on a laptop: clone, 213 checks, set-up with Claude Code, first console.', f: 'install-setup-720p.mp4', p: 'assets/video/install-thumb.jpg', d: '4:33',
      ch: [[0, 'Day one'], [27, 'How Sales Mama fixes it'], [43, 'Step 1 · Check what you need'], [57, 'Step 2 · Get Sales Mama'], [73, 'Step 3 · Check it works'], [101, 'Step 4 · Set yourself up with Claude Code'], [184, 'Step 5 · Open the console'], [226, 'Before and after'], [244, 'Recap']] },
    ep1: { t: 'Ep 1 · Where do I start?', s: 'Plan the morning: Today, “run my day”, briefs, send in the window.', f: 'ep1-where-do-i-start-720p.mp4', p: 'assets/video/ep1-thumb.jpg', d: '5:01',
      ch: EP([[43, 'Step 1 · See your day'], [83, 'Step 2 · Let Mama do the legwork'], [131, 'Step 3 · Know who needs you'], [173, 'Step 4 · Walk in prepared'], [214, 'Step 5 · Send at the right time']]) },
    ep2: { t: 'Ep 2 · Chasing the wrong leads', s: 'Reasons to call, company checks, market sizing, claiming the right accounts.', f: 'ep2-chasing-the-wrong-leads-720p.mp4', p: 'assets/video/ep2-thumb.jpg', d: '5:01',
      ch: EP([[43, 'Step 1 · Wake up to reasons to call'], [87, 'Step 2 · See why a lead is hot'], [129, 'Step 3 · Check it’s a real business'], [175, 'Step 4 · Find more like your best customers'], [216, 'Step 5 · Claim the right ones']]) },
    ep3: { t: 'Ep 3 · Outreach that gets ignored', s: 'Research, the right offer, cited drafts, WhatsApp with consent, replies.', f: 'ep3-outreach-that-gets-ignored-720p.mp4', p: 'assets/video/ep3-thumb.jpg', d: '5:01',
      ch: EP([[43, 'Step 1 · Find the right person'], [90, 'Step 2 · Know what to offer'], [131, 'Step 3 · Write about them, not you'], [173, 'Step 4 · Right channel, right hour'], [214, 'Step 5 · Catch every reply']]) },
    ep4: { t: 'Ep 4 · Meetings that slip', s: 'Book from a reply, fix clashes, renewals, log the outcome.', f: 'ep4-meetings-that-slip-720p.mp4', p: 'assets/video/ep4-thumb.jpg', d: '5:01',
      ch: EP([[43, 'Step 1 · Turn a reply into a meeting'], [85, 'Step 2 · See your whole week'], [129, 'Step 3 · Fix clashes in one line'], [175, 'Step 4 · Never miss a renewal'], [210, 'Step 5 · Log it in one line']]) },
    ep5: { t: 'Ep 5 · Managing blind', s: 'Morning cockpit, fair allocation, team calendar, weekly review.', f: 'ep5-managing-blind-720p.mp4', p: 'assets/video/ep5-thumb.jpg', d: '5:01',
      ch: EP([[43, 'Step 1 · One view every morning'], [92, 'Step 2 · Hand out leads fairly'], [140, 'Step 3 · See the team’s week'], [177, 'Step 4 · Coach from what works'], [221, 'Step 5 · Share it in one click']]) },
    bench1: { t: 'Bench 1 · Can you trust an agent with your pipeline?', s: 'Why B2B sales needs a benchmark for harnesses, not just for models.', f: 'sales-harness-bench-1-why-720p.mp4', p: 'assets/video/bench1-thumb.jpg', d: '6:01',
      ch: [[0, 'A morning that shouldn’t happen'], [37, 'Q1 · What is a harness?'], [80, 'Q2 · Haven’t other benchmarks solved this?'], [137, 'Q3 · What must a sales harness get right?'], [182, 'Q4 · What must never happen?'], [267, 'Q5 · Can it be gamed?'], [292, 'Q6 · Why Singapore, Malaysia and India?'], [315, 'Before and after'], [330, 'Recap']] },
    bench2: { t: 'Bench 2 · How the leaderboard was built', s: 'Tasks, sandbox, grading, the first real runs, and how to benchmark your harness.', f: 'sales-harness-bench-2-how-720p.mp4', p: 'assets/video/bench2-thumb.jpg', d: '6:01',
      ch: [[0, 'How agents get judged today'], [37, 'Q1 · Where did the tasks come from?'], [75, 'Q2 · What does the agent see?'], [115, 'Q3 · How is a run scored?'], [137, 'Q4 · When is one harness really better?'], [172, 'Q5 · How was the board built?'], [225, 'Q6 · What did the first real runs show?'], [260, 'Q7 · How do I benchmark my own harness?'], [330, 'Recap']] }
  };
  var fmt = function (s) { return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); };

  var player = $('#player');
  function openFilm(id, t) {
    var f = FILMS[id]; if (!f || !player) return;
    var v = $('video', player);
    $('[data-pl-title]', player).textContent = f.t;
    $('[data-pl-sub]', player).textContent = f.s + ' · ' + f.d;
    $('[data-pl-gh]', player).href = REPO + '/blob/main/docs/assets/video/' + f.f;
    $('[data-pl-dl]', player).href = REPO + '/raw/main/docs/assets/video/' + f.f;
    var list = $('[data-pl-ch]', player);
    list.innerHTML = f.ch.map(function (c) { return '<li><button type="button" data-seek="' + c[0] + '"><time>' + fmt(c[0]) + '</time><span>' + esc(c[1]) + '</span></button></li>'; }).join('');
    $('[data-pl-chl]', player).hidden = !f.ch.length;
    v.poster = f.p;
    if (v.getAttribute('data-id') !== id) { v.preload = 'auto'; v.src = 'assets/video/' + f.f; v.setAttribute('data-id', id); v.load(); }
    var go = function () { if (t) { try { v.currentTime = t; } catch (e) {} } var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
    if (!player.open) player.showModal();
  }
  if (player) {
    var pv = $('video', player);
    player.addEventListener('click', function (e) {
      var s = e.target.closest('[data-seek]');
      if (s) { pv.currentTime = +s.getAttribute('data-seek'); pv.play(); return; }
      if (e.target === player || e.target.closest('[data-close]')) player.close();
    });
    player.addEventListener('close', function () { pv.pause(); });
    pv.addEventListener('timeupdate', function () {
      var on = null;
      $$('[data-seek]', player).forEach(function (b) { if (+b.getAttribute('data-seek') <= pv.currentTime + .25) on = b; });
      $$('[data-seek]', player).forEach(function (b) { b.classList.toggle('on', b === on); });
    });
  }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest('[data-film]');
    if (b && player) { e.preventDefault(); openFilm(b.getAttribute('data-film'), +(b.getAttribute('data-t') || 0)); }
  });
  var hashFilm = /^#play=(\w+)(?:&t=(\d+))?/.exec(location.hash);
  if (hashFilm) openFilm(hashFilm[1], +(hashFilm[2] || 0));

  /* ── YouTube: click-to-play, privacy-enhanced (no request to YouTube until clicked). ── */
  $$('[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-yt');
      var f = doc.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      f.title = b.getAttribute('aria-label') || 'YouTube video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      var box = doc.createElement('div'); box.className = 'yt'; box.style.cursor = 'auto'; box.appendChild(f);
      b.replaceWith(box);
      f.focus();
    });
  });

  /* ── Copy buttons: copy the commands without the trailing # comments. ── */
  $$('.code').forEach(function (c) {
    var pre = $('pre', c); if (!pre || c.hasAttribute('data-nocopy')) return;
    var btn = doc.createElement('button');
    btn.type = 'button'; btn.className = 'copy'; btn.innerHTML = icon('copy', 'i-sm') + '<span>Copy</span>';
    btn.setAttribute('aria-label', 'Copy to clipboard');
    (($('.code-head', c)) || c).appendChild(btn);
    btn.addEventListener('click', function () {
      var txt = c.getAttribute('data-copy') || pre.innerText.split('\n').map(function (l) { return l.replace(/\s+#\s.*$/, '').replace(/^\$ /, ''); })
        .filter(function (l) { return l.trim() && !/^\s*#/.test(l); }).join('\n');
      var done = function () { btn.classList.add('done'); btn.innerHTML = icon('check', 'i-sm') + '<span>Copied</span>'; setTimeout(function () { btn.classList.remove('done'); btn.innerHTML = icon('copy', 'i-sm') + '<span>Copy</span>'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {}); else done();
    });
  });

  /* ── Tabs ── */
  $$('[role="tablist"]').forEach(function (tl) {
    var tabs = $$('[role="tab"]', tl);
    function pick(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        var p = doc.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
      });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(t); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
  });

  /* ── Image zoom (gallery and scenario screens) ── */
  var zoom = $('#zoom'), group = [], gi = 0;
  function showZoom() {
    var it = group[gi]; if (!it) return;
    var img = $('img', zoom); img.src = it.src; img.alt = it.alt;
    $('[data-zoom-cap]', zoom).innerHTML = it.cap;
    $$('.nav-btn', zoom).forEach(function (b) { b.hidden = group.length < 2; });
  }
  if (zoom) {
    doc.addEventListener('click', function (e) {
      var b = e.target.closest('[data-zoom]'); if (!b) return;
      var g = b.getAttribute('data-zoom');
      var all = $$('[data-zoom="' + g + '"]');
      group = all.map(function (x) {
        var im = x.querySelector('img.on') || x.querySelector('img');
        var fc = x.closest('figure') && x.closest('figure').querySelector('figcaption');
        return { src: x.getAttribute('data-full') || (im && im.currentSrc) || (im && im.src), alt: im ? im.alt : '', cap: fc ? fc.innerHTML : esc(im ? im.alt : '') };
      });
      gi = all.indexOf(b); showZoom(); zoom.showModal();
    });
    zoom.addEventListener('click', function (e) {
      if (e.target === zoom || e.target.closest('[data-close]')) return zoom.close();
      var n = e.target.closest('[data-step]'); if (n) { gi = (gi + (+n.getAttribute('data-step')) + group.length) % group.length; showZoom(); }
    });
    zoom.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { gi = (gi + (e.key === 'ArrowRight' ? 1 : -1) + group.length) % group.length; showZoom(); }
    });
  }

  /* ── Jump palette (⌘K), like the console's. ── */
  var PAGES = [
    ['Overview', 'index.html', 'sun', 'Signal to send. You approve each one.'],
    ['Quickstart', 'quickstart.html', 'rocket', 'Install, set up, connect Gmail and WhatsApp'],
    ['Scenarios', 'scenarios.html', 'clapperboard', 'Ten real scenarios, step by step'],
    ['End to end', 'end-to-end.html', 'workflow', 'From a signal at 2 am to a reply at 10'],
    ['Films', 'films.html', 'film', 'Eleven films: pitch, tour, install, five episodes, benchmark']
  ];
  var IDX = PAGES.map(function (p) { return { t: p[0], s: p[3], u: p[1], i: p[2], k: 'Page' }; }).concat([
    ['Why Sales Mama', 'index.html#why', 'target'], ['How it works', 'index.html#how', 'layers'], ['Approve, then send', 'index.html#send', 'shield-check'],
    ['The console', 'index.html#console', 'monitor-smartphone'], ['A day with Sales Mama', 'index.html#day', 'clock'],
    ['Install in five steps', 'quickstart.html#steps', 'square-terminal'], ['Connect Gmail and WhatsApp', 'quickstart.html#connect', 'plug'],
    ['Set up as the manager', 'quickstart.html#roles', 'users'], ['Nightly runner', 'quickstart.html#roles', 'moon-star'], ['Using Codex', 'quickstart.html#roles', 'terminal'],
    ['Your first five prompts', 'quickstart.html#first', 'message-square'], ['Health checks', 'quickstart.html#health', 'gauge'], ['Troubleshooting', 'quickstart.html#trouble', 'info'],
    ['Day one: install and set up', 'scenarios.html#day-one', 'rocket'], ['Plan the morning', 'scenarios.html#morning', 'sun'],
    ['Find the right leads', 'scenarios.html#leads', 'radar'], ['Outreach that gets replies', 'scenarios.html#outreach', 'pen-line'],
    ['Meetings that never slip', 'scenarios.html#meetings', 'calendar-clock'], ['Lead the team', 'scenarios.html#manager', 'users'],
    ['Is this company real? (company check)', 'scenarios.html#company-check', 'badge-check'], ['Size a market (company insights)', 'scenarios.html#insights', 'chart-column'],
    ['Approve, then send (mama-send)', 'scenarios.html#send', 'send'], ['While you sleep: the nightly run', 'scenarios.html#overnight', 'moon-star'],
    ['The loop, stage by stage', 'end-to-end.html#loop', 'route'], ['Who does what', 'end-to-end.html#roles', 'users'], ['The repo is the system', 'end-to-end.html#repo', 'folder-git-2'],
    ['Markets: SG · MY · IN', 'end-to-end.html#markets', 'globe'], ['Guardrails', 'end-to-end.html#guardrails', 'shield'], ['All commands', 'end-to-end.html#commands', 'command'],
    ['Quality and the Sales Harness Bench', 'end-to-end.html#quality', 'trophy'], ['Docs and ADRs', 'end-to-end.html#docs', 'book-open']
  ].map(function (x) { return { t: x[0], u: x[1], i: x[2], k: 'Section' }; })).concat([
    ['/mama-day', 'Run my whole morning'], ['/mama-book', 'Show my book'], ['/mama-target', 'My allocated queue, claim tier C'], ['/mama-research', 'Cited research on one account'],
    ['/mama-recommend', 'What to pitch, with the chain'], ['/mama-draft', 'Email or WhatsApp draft'], ['/mama-send', 'Review and send what I approve'], ['/mama-replies', 'Handle replies'],
    ['/mama-schedule', 'Book, move, cancel meetings'], ['/mama-brief', 'Call or event prep'], ['/mama-handover', 'Log a meeting'], ['/mama-setup', 'Set me up, health check'],
    ['/mama-manager', 'Morning cockpit'], ['/mama-allocate', 'Split the pool, explained'], ['/mama-scan', 'Scan signals'], ['/mama-vam', 'Refresh a book'],
    ['/mama-nightly', 'Run tonight’s job'], ['/mama-ingest', 'Import CRM'], ['/mama-weekly', 'Weekly review'], ['/company-check', 'Is this company real?'], ['/company-insights', 'Stats, charts, tables']
  ].map(function (x) { return { t: x[0], s: x[1], u: 'end-to-end.html#commands', i: 'command', k: 'Command' }; })).concat(
    Object.keys(FILMS).map(function (id) { return { t: FILMS[id].t, s: 'Film · ' + FILMS[id].d, film: id, i: 'circle-play', k: 'Film' }; })
  ).concat([{ t: 'Watch on YouTube: I turned Claude Code into an AI sales team', u: 'https://youtu.be/tv8dHNzE3ks', i: 'youtube', k: 'Video' },
    { t: 'GitHub repository', s: 'neam-lang/sales-mama.ai', u: REPO, i: 'github', k: 'Link' },
    { t: 'Sales Harness Leaderboard', s: 'Hugging Face Space', u: 'https://huggingface.co/spaces/praveengovi/Sales-Harness-Leaderboard', i: 'trophy', k: 'Link' }]);

  var pal = $('#palette'), sel = 0, shown = [];
  function renderPal(q) {
    q = (q || '').toLowerCase().trim();
    shown = IDX.filter(function (x) { return !q || (x.t + ' ' + (x.s || '') + ' ' + x.k).toLowerCase().indexOf(q) >= 0; }).slice(0, 40);
    sel = 0;
    $('.pal-list', pal).innerHTML = shown.length ? shown.map(function (x, i) {
      return '<li role="option" id="pal-' + i + '" aria-selected="' + (i === 0) + '" data-i="' + i + '"><span class="sq a-mama">' + icon(x.i) + '</span><div><b>' + esc(x.t) + '</b>' + (x.s ? '<span>' + esc(x.s) + '</span>' : '') + '</div><span class="kind">' + x.k + '</span></li>';
    }).join('') : '<li class="empty">Nothing matches. Try “send”, “install” or “calendar”.</li>';
  }
  function moveSel(d) {
    if (!shown.length) return;
    sel = (sel + d + shown.length) % shown.length;
    $$('.pal-list li', pal).forEach(function (li, i) { li.setAttribute('aria-selected', i === sel); if (i === sel) li.scrollIntoView({ block: 'nearest' }); });
  }
  function choose(i) {
    var x = shown[i]; if (!x) return;
    pal.close();
    if (x.film) return openFilm(x.film, 0);
    if (/^https?:/.test(x.u)) window.open(x.u, '_blank', 'noopener'); else location.href = x.u;
  }
  function openPal() { if (!pal || pal.open) return; var inp = $('input', pal); inp.value = ''; renderPal(''); pal.showModal(); inp.focus(); }
  if (pal) {
    var inp = $('input', pal);
    inp.addEventListener('input', function () { renderPal(inp.value); });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(sel); }
    });
    pal.addEventListener('click', function (e) {
      if (e.target === pal) return pal.close();
      var li = e.target.closest('li[data-i]'); if (li) choose(+li.getAttribute('data-i'));
    });
    $$('[data-jump]').forEach(function (b) { b.addEventListener('click', openPal); });
    doc.addEventListener('keydown', function (e) {
      var typing = /input|textarea|select/i.test((e.target.tagName || '')) || e.target.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); openPal(); }
      else if (e.key === '/' && !typing && !doc.querySelector('dialog[open]')) { e.preventDefault(); openPal(); }
    });
  }

  /* ── Reveal on scroll ── */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ── Scenario steps drive the sticky screen; the side index follows the scroll. ── */
  if ('IntersectionObserver' in window) {
    $$('.scn').forEach(function (sc) {
      var stage = $('.stage', sc); if (!stage) return;
      var imgs = $$('.frame img', stage), cap = $('figcaption', stage);
      var steps = $$('.step', sc);
      var activate = function (st) {
        steps.forEach(function (x) { x.classList.toggle('on', x === st); });
        var key = st.getAttribute('data-shot');
        if (!key) return;
        imgs.forEach(function (im) { im.classList.toggle('on', im.getAttribute('data-key') === key); });
        if (cap) cap.innerHTML = st.getAttribute('data-cap') || '';
      };
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) activate(en.target); });
      }, { rootMargin: '-38% 0px -52% 0px' });
      steps.forEach(function (st) { so.observe(st); st.addEventListener('mouseenter', function () { activate(st); }); });
    });
    var links = $$('[data-spy] a');
    if (links.length) {
      var map = {};
      links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
      var spy = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (a) { a.classList.remove('on'); });
          var a = map[en.target.id]; if (a) { a.classList.add('on'); if (a.parentNode.scrollWidth > a.parentNode.clientWidth) a.scrollIntoView({ block: 'nearest', inline: 'center' }); }
        });
      }, { rootMargin: '-30% 0px -65% 0px' });
      Object.keys(map).forEach(function (id) { var el = doc.getElementById(id); if (el) spy.observe(el); });
    }
  }
})();
