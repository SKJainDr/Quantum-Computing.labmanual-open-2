/* Quantum Computing Lab Manual II — reader app
   Handles: theme toggle, chapter loading/rendering, sidebar + on-page TOC,
   read-aloud (Web Speech API, start-from-any-point) with sentence
   highlighting, deep-linking. */

(function () {
  "use strict";

  const els = {
    root: document.body,
    chapterNav: document.getElementById("chapterNav"),
    chapterFilter: document.getElementById("chapterFilter"),
    chapterContent: document.getElementById("chapterContent"),
    chapterLabel: document.getElementById("chapterLabel"),
    chapterPager: document.getElementById("chapterPager"),
    pageTocList: document.getElementById("pageTocList"),
    progressBar: document.getElementById("progressBar"),
    themeToggle: document.getElementById("themeToggle"),
    iconSun: document.getElementById("iconSun"),
    iconMoon: document.getElementById("iconMoon"),
    sidebar: document.getElementById("sidebar"),
    sidebarToggle: document.getElementById("sidebarToggle"),
    playBtn: document.getElementById("playBtn"),
    stopBtn: document.getElementById("stopBtn"),
    rateSelect: document.getElementById("rateSelect"),
    iconPlay: document.getElementById("iconPlay"),
    iconPause: document.getElementById("iconPause"),
    main: document.getElementById("main"),
  };

  let manifest = [];
  let currentIndex = 0;
  const mdCache = new Map();

  /* ---------------- THEME ---------------- */
  function applyTheme(theme) {
    els.root.setAttribute("data-theme", theme);
    localStorage.setItem("qc-theme", theme);
    const isDark = theme === "dark";
    els.iconSun.style.display = isDark ? "none" : "block";
    els.iconMoon.style.display = isDark ? "block" : "none";
  }
  (function initTheme() {
    const saved = localStorage.getItem("qc-theme");
    // Light is the default: it's the book's actual appearance (white page, black text).
    // Dark is available via the toggle for low-light reading.
    applyTheme(saved || "light");
  })();
  els.themeToggle.addEventListener("click", () => {
    const next = els.root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  /* ---------------- SIDEBAR (mobile) ---------------- */
  els.sidebarToggle.addEventListener("click", () => {
    const open = els.sidebar.classList.toggle("open");
    els.sidebarToggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 880) return;
    if (!els.sidebar.contains(e.target) && !els.sidebarToggle.contains(e.target)) {
      els.sidebar.classList.remove("open");
    }
  });

  /* ---------------- MANIFEST + NAV ---------------- */
  async function loadManifest() {
    const res = await fetch("content/manifest.json");
    manifest = await res.json();
    els.chapterNav.innerHTML = manifest
      .map((ch, i) => {
        const num = ch.file.split("-")[0];
        return `<a href="#/${ch.file}" data-index="${i}"><span class="num">${num === "00" ? "Front" : num === "11" ? "Back" : "Ch. " + parseInt(num, 10)}</span>${ch.title.replace(/^Chapter \d+ — /, "")}</a>`;
      })
      .join("");
  }

  els.chapterFilter.addEventListener("input", () => {
    const q = els.chapterFilter.value.trim().toLowerCase();
    [...els.chapterNav.children].forEach((a) => {
      a.classList.toggle("hidden", q && !a.textContent.toLowerCase().includes(q));
    });
  });

  /* ---------------- MARKDOWN LOAD + RENDER ---------------- */
  async function fetchMarkdown(file) {
    if (mdCache.has(file)) return mdCache.get(file);
    const res = await fetch(`content/${file}`);
    if (!res.ok) throw new Error("Could not load " + file);
    const text = await res.text();
    mdCache.set(file, text);
    return text;
  }

  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 64);
  }

  async function renderChapter(index, opts = {}) {
    if (index < 0 || index >= manifest.length) return;
    currentIndex = index;
    stopReading();

    const ch = manifest[index];
    els.chapterContent.innerHTML = `<p class="loading-msg">Loading ${ch.title}…</p>`;
    els.chapterLabel.textContent = ch.title;

    let md;
    try {
      md = await fetchMarkdown(ch.file);
    } catch (err) {
      els.chapterContent.innerHTML = `<p class="loading-msg">Could not load this chapter (${err.message}). If you're viewing this from disk, serve the folder with a local server — see README.</p>`;
      return;
    }

    const html = marked.parse(md, { headerIds: false, mangle: false });
    els.chapterContent.innerHTML = html;

    // assign ids to headings for TOC + deep links
    const headings = els.chapterContent.querySelectorAll("h1, h2, h3, h4");
    const tocEntries = [];
    headings.forEach((h) => {
      const id = slugify(h.textContent) || Math.random().toString(36).slice(2, 8);
      let uid = id, n = 1;
      while (document.getElementById(uid)) uid = id + "-" + n++;
      h.id = uid;
      tocEntries.push({ id: uid, text: h.textContent, level: h.tagName.slice(1) });
    });
    buildPageToc(tocEntries);
    buildPager(index);
    highlightActiveNav(index);

    if (!opts.skipScroll) {
      els.main.scrollTo({ top: 0 });
      if (opts.hash) {
        const target = document.getElementById(opts.hash);
        if (target) target.scrollIntoView({ block: "start" });
      }
    }
    document.title = `${ch.title} — Quantum Computing Lab Manual II | Dr. S. K. Jain`;
  }

  function buildPageToc(entries) {
    if (!entries.length) {
      els.pageTocList.innerHTML = `<p style="color:var(--text-faint);font-size:12px;">No subsections</p>`;
      return;
    }
    els.pageTocList.innerHTML = entries
      .filter((e) => e.level !== "1")
      .map((e) => `<a href="#${e.id}" data-level="${e.level}">${e.text}</a>`)
      .join("");
  }

  function buildPager(index) {
    const prev = manifest[index - 1];
    const next = manifest[index + 1];
    els.chapterPager.innerHTML = `
      ${prev ? `<a class="pager-link prev" href="#/${prev.file}"><span class="pager-dir">← Previous</span>${prev.title}</a>` : "<span></span>"}
      ${next ? `<a class="pager-link next" href="#/${next.file}"><span class="pager-dir">Next →</span>${next.title}</a>` : "<span></span>"}
    `;
  }

  function highlightActiveNav(index) {
    [...els.chapterNav.children].forEach((a, i) => a.classList.toggle("active", i === index));
  }

  /* ---------------- ROUTING ---------------- */
  function parseHash() {
    const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [file, hash] = raw.split("#");
    return { file: file || manifest[0]?.file, hash };
  }

  async function route() {
    if (!manifest.length) return;
    const { file, hash } = parseHash();
    const index = Math.max(0, manifest.findIndex((c) => c.file === file));
    await renderChapter(index === -1 ? 0 : index, { hash });
  }

  window.addEventListener("hashchange", route);

  els.chapterNav.addEventListener("click", () => {
    if (window.innerWidth <= 880) els.sidebar.classList.remove("open");
  });

  /* ---------------- SCROLL PROGRESS + ON-PAGE TOC ACTIVE STATE ---------------- */
  els.main.addEventListener("scroll", () => {
    const el = els.main;
    const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight || 1)) * 100;
    els.progressBar.style.width = Math.min(100, Math.max(0, pct)) + "%";

    const headings = [...els.chapterContent.querySelectorAll("h2, h3, h4")];
    let activeId = null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top - els.main.getBoundingClientRect().top < 90) activeId = h.id;
    }
    [...els.pageTocList.children].forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === "#" + activeId);
    });
  });

  /* ---------------- READ ALOUD ---------------- */
  const synth = window.speechSynthesis;
  let utterQueue = [];
  let utterIndex = 0;
  let speaking = false;
  let paused = false;
  let currentMark = null;

  function getReadableChunks() {
    // split the current chapter into paragraph-level chunks for natural pacing + highlighting
    const blocks = els.chapterContent.querySelectorAll(
      "h1, h2, h3, h4, p, li, blockquote, .box .box-title, .box p, figcaption"
    );
    return [...blocks].filter((b) => b.textContent.trim().length > 0);
  }

  function clearHighlight() {
    if (currentMark) {
      currentMark.classList.remove("reading-word");
      currentMark = null;
    }
  }

  function speakFrom(startIdx) {
    if (!synth) return;
    const chunks = getReadableChunks();
    if (!chunks.length) return;
    utterIndex = startIdx;

    function speakNext() {
      clearHighlight();
      if (utterIndex >= chunks.length) {
        stopReading();
        // auto-advance to next chapter
        const next = manifest[currentIndex + 1];
        if (next) location.hash = "#/" + next.file;
        return;
      }
      const block = chunks[utterIndex];
      block.scrollIntoView({ block: "center", behavior: "smooth" });
      block.classList.add("reading-word");
      currentMark = block;

      const utter = new SpeechSynthesisUtterance(block.textContent);
      utter.rate = parseFloat(els.rateSelect.value || "1");
      utter.onend = () => {
        if (!speaking || paused) return;
        utterIndex++;
        speakNext();
      };
      utter.onerror = () => {};
      synth.speak(utter);
    }
    speakNext();
  }

  function startReadingFrom(idx) {
    if (!synth) {
      alert("Your browser does not support the Web Speech API for read-aloud.");
      return;
    }
    synth.cancel();
    speaking = true;
    paused = false;
    els.playBtn.classList.add("speaking");
    els.iconPlay.style.display = "none";
    els.iconPause.style.display = "block";
    speakFrom(idx);
  }

  function startReading() {
    startReadingFrom(0);
  }

  function togglePause() {
    if (!speaking) return startReading();
    if (paused) {
      paused = false;
      synth.resume();
      els.iconPlay.style.display = "none";
      els.iconPause.style.display = "block";
    } else {
      paused = true;
      synth.pause();
      els.iconPlay.style.display = "block";
      els.iconPause.style.display = "none";
    }
  }

  function stopReading() {
    speaking = false;
    paused = false;
    if (synth) synth.cancel();
    clearHighlight();
    els.playBtn.classList.remove("speaking");
    els.iconPlay.style.display = "block";
    els.iconPause.style.display = "none";
  }

  els.playBtn.addEventListener("click", togglePause);
  els.stopBtn.addEventListener("click", stopReading);
  window.addEventListener("hashchange", stopReading);

  /* ---------------- READ ALOUD: START FROM ANY POINT ----------------
     Click any paragraph, heading, list item, or box text in the reading
     pane to begin (or jump) narration from that exact spot, instead of
     always starting at the top of the chapter. A text-selection drag is
     treated as "select text", not "jump here", so copying still works
     normally on the plain site. */
  if (synth) document.body.classList.add("tts-ready");

  const READABLE_SELECTOR = "h1, h2, h3, h4, p, li, blockquote, .box .box-title, .box p, figcaption";
  els.chapterContent.addEventListener("click", (e) => {
    if (!synth) return;
    if (e.target.closest("a, button, input, select, textarea")) return;
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) return; // was selecting text, not jumping
    const block = e.target.closest(READABLE_SELECTOR);
    if (!block || !els.chapterContent.contains(block)) return;
    const chunks = getReadableChunks();
    const idx = chunks.indexOf(block);
    if (idx === -1) return;
    startReadingFrom(idx);
  });

  /* ---------------- SERIES CROSS-LINKS ----------------
     Each site in the series links to its sibling volume(s) here. This site
     doesn't know the sibling's deployed URL automatically — fill in the
     real GitHub Pages URL(s) below once every volume is live. Until then,
     the link is inert (points to "#") rather than guessing a URL. */
    const SERIES_LINKS = [
    { label: "Volume I — Quantum Computers (Textbook)", url: "https://skjaindr.github.io/Quantum-Computing.book-open-1/" },
    { label: "Volume II — Quantum Algorithms & Complexity (Textbook)", url: "https://skjaindr.github.io/Quantum-Computing.book-open-2/" },
    { label: "Volume III — Quantum Hardware, Error Correction & Applications", url: "https://skjaindr.github.io/Quantum-Computing.book-open-3" },
    { label: "Laboratory Manual I — Hands-on Qiskit Experiments", url: "https://skjaindr.github.io/Quantum-Computing.labmanual-open-1/" },
    { label: "Laboratory Manual II — Advanced Experiments - Security, Hardware Platforms and Applications", url: "https://skjaindr.github.io/Quantum-Computing.labmanual-open-2/" },
  ];

  function initSeriesLinks() {
    const container = document.getElementById("seriesLinks");
    if (!container || !SERIES_LINKS.length) return;
    const items = SERIES_LINKS.map(
      (l) =>
        `<a href="${l.url}"><svg class="vol-icon" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17z" stroke="currentColor" stroke-width="1.5"/><path d="M4 19V4.5" stroke="currentColor" stroke-width="1.5"/></svg><span>${l.label}</span></a>`
    ).join("");
    container.innerHTML = `<p class="series-links-title">More in this series</p>${items}`;
  }

  /* ---------------- VISITOR COUNTER + LIKE BUTTON ----------------
     Backed by Abacus (abacus.jasoncameron.dev), a free, no-signup counting
     API — increments/reads are simple GET requests, no key required. The
     namespace should stay unique to this book to avoid collisions with
     other sites using the same free service; change it if you fork this. */
  const COUNTER_NAMESPACE = "qc-lab-manual-2-skjain";
  const ABACUS_BASE = "https://abacus.jasoncameron.dev";

  const likeBtn = document.getElementById("likeBtn");
  const likeCountEl = document.getElementById("likeCount");
  const visitorCountEl = document.getElementById("visitorCount");
  const LIKE_STORAGE_KEY = "qc-liked-" + COUNTER_NAMESPACE + "@" + location.pathname.replace(/index\.html$/, ""); // per site: every book/manual, plain or protected, remembers its own like

  async function initVisitorCounter() {
    if (!visitorCountEl) return;
    try {
      const res = await fetch(`${ABACUS_BASE}/hit/${COUNTER_NAMESPACE}/pageviews`);
      const data = await res.json();
      visitorCountEl.textContent = data.value.toLocaleString();
    } catch (err) {
      visitorCountEl.textContent = "—";
    }
  }

  async function initLikeButton() {
    if (!likeBtn) return;
    const likeTitle = likeBtn.title || "";
    // Saved-data access is guarded: some browsers / app modes can block it, and a like must still register.
    let likedInMemory = false;
    const isLiked = () => { try { return localStorage.getItem(LIKE_STORAGE_KEY) === "1"; } catch (e) { return likedInMemory; } };
    const setLiked = (on) => {
      likedInMemory = on;
      try { on ? localStorage.setItem(LIKE_STORAGE_KEY, "1") : localStorage.removeItem(LIKE_STORAGE_KEY); } catch (e) { /* ignore */ }
    };
    if (isLiked()) {
      likeBtn.classList.add("liked");
      likeBtn.title = "You have already liked this \u2014 thank you!";
    }

    let likeSent = false; // true once this visitor's like has been sent, so a late count-load can't overwrite it

    // Attach the click handler first, so a like is never ignored while the count is still loading.
    likeBtn.addEventListener("click", async () => {
      if (isLiked()) {
        // Already counted on this device: acknowledge the click visibly (replay the heart animation).
        likeBtn.classList.remove("liked");
        void likeBtn.offsetWidth;
        likeBtn.classList.add("liked");
        return;
      }
      const prevText = likeCountEl.textContent;
      const prev = parseInt(prevText.replace(/,/g, ""), 10);
      likeSent = true;
      likeBtn.classList.add("liked");
      setLiked(true);
      if (!isNaN(prev)) likeCountEl.textContent = (prev + 1).toLocaleString(); // optimistic update
      try {
        const res = await fetch(`${ABACUS_BASE}/hit/${COUNTER_NAMESPACE}/likes`);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        likeCountEl.textContent = data.value.toLocaleString();
        likeBtn.title = "You have already liked this \u2014 thank you!";
      } catch (err) {
        // The like was NOT recorded on the server: undo, so the visitor can simply click again.
        likeSent = false;
        likeBtn.classList.remove("liked");
        setLiked(false);
        likeBtn.title = likeTitle;
        likeCountEl.textContent = prevText;
      }
    });

    // Read the shared like count from the server on every visit.
    try {
      const res = await fetch(`${ABACUS_BASE}/get/${COUNTER_NAMESPACE}/likes`);
      if (likeSent) return; // the visitor already liked while this was loading; keep the fresher value
      if (res.ok) {
        const data = await res.json();
        likeCountEl.textContent = data.value.toLocaleString();
      } else {
        likeCountEl.textContent = "0"; // counter not created yet: the first like will create it
      }
    } catch (err) {
      if (!likeSent) likeCountEl.textContent = "—";
    }
  }

  /* ---------------- INIT ---------------- */
  // Visitor counter, like button, and series links are independent of
  // chapter loading, so a manifest/content failure never prevents them.
  initVisitorCounter();
  initLikeButton();
  initSeriesLinks();

  (async function init() {
    await loadManifest();
    if (!location.hash) location.hash = "#/" + manifest[0].file;
    await route();
  })();
})();
