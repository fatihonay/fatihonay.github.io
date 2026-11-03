// Shared header, navigation and footer.
// Edit your name, title and menu here once — every page picks it up.
const SITE = {
  name: "Fatih Onay, Ph.D.",
  role: "Signal Processing · Biomedical Data · Computational Neuroscience",
  tagline: "Exploring how brains compute through signals, models and interactive Lab Notes.",
  pages: [
    { href: "index.html", label: "Home" },
    { href: "bio.html", label: "Bio" },
    { href: "research.html", label: "Research" },
    { href: "publications.html", label: "Publications" },
    { href: "notes.html", label: "Lab Notes" },
    { href: "atlas.html", label: "Brain Atlas" },
    { href: "teaching.html", label: "Teaching" },
    { href: "gallery.html", label: "Gallery" },
    { href: "contact.html", label: "Contact" },
  ],
};

// Lab Notes: add one entry per post, newest first.
// The post file goes in the notes/ folder (copy notes/_template.html to start).
const NOTES = [
  {
    href: "notes/2026-10-29-rsa.html",
    thumb: "assets/img/thumbs/rsa.jpg",
    date: "29 Oct 2026",
    title: "Representational similarity analysis: comparing brains and models",
    summary: "Turn activity patterns into a dissimilarity matrix, then test which model best explains a brain region: the method that links brains, models and EEG.",
    tags: ["Simulation", "Methods"],
  },
  {
    href: "notes/2026-10-28-receptive-fields.html",
    thumb: "assets/img/thumbs/receptive-fields.jpg",
    date: "22 Oct 2026",
    title: "Receptive fields: how to read an image from the brain",
    summary: "Steer a model neuron's receptive field, then play the 'pick a card' game: guess which image a model brain saw from its activity alone.",
    tags: ["Simulation", "Vision"],
  },
  {
    href: "notes/2026-10-27-linear-nonlinear.html",
    thumb: "assets/img/thumbs/linear-nonlinear.jpg",
    date: "15 Oct 2026",
    title: "Linear or nonlinear? Solving equations in the brain",
    summary: "Why EEG signals add up but neurons don't, and how a computer finds answers algebra can't — with a self-exciting neuron population you can steer.",
    tags: ["Simulation", "Modelling"],
  },
  {
    href: "notes/2026-10-26-visual-hierarchy.html",
    thumb: "assets/img/thumbs/visual-hierarchy.jpg",
    date: "8 Oct 2026",
    title: "From edges to objects: how the brain sees",
    summary: "Draw a shape and watch it climb a tiny brain-like hierarchy: edges, pooled edges, corners — the idea behind CNNs.",
    tags: ["Simulation", "Vision"],
  },
  {
    href: "notes/2026-10-15-synchrony.html",
    thumb: "assets/img/thumbs/synchrony.jpg",
    date: "1 Oct 2026",
    title: "How do neurons fall into rhythm?",
    summary: "Play with 80 coupled oscillators and watch a brain-like rhythm appear out of noise.",
    tags: ["Simulation", "Oscillations"],
  },
];

// Pages inside a subfolder (like notes/) set data-root="../" on the script tag.
const ROOT = document.currentScript.dataset.root || "";

// Drifting EEG-like lines for the banner. Periods divide 600 so the loop is seamless.
function wavesSVG() {
  const lines = [
    { y: 50, amp: 14, k: [2, 5, 9], color: "#ffffff" },
    { y: 85, amp: 18, k: [1, 4, 7], color: "#ffd1dc" },
    { y: 120, amp: 10, k: [3, 6, 12], color: "#c9b8ff" },
  ];
  const paths = lines.map((l, i) => {
    let d = "";
    for (let x = 0; x <= 1200; x += 4) {
      const t = (2 * Math.PI * x) / 600;
      const y = l.y + l.amp * (Math.sin(l.k[0] * t + i) + 0.5 * Math.sin(l.k[1] * t + 2 * i) + 0.25 * Math.sin(l.k[2] * t));
      d += (x ? "L" : "M") + x + " " + y.toFixed(1);
    }
    return `<path d="${d}" fill="none" stroke="${l.color}" stroke-width="1.5"/>`;
  });
  return `<svg class="waves" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">${paths.join("")}</svg>`;
}

function renderHeader() {
  const current = location.pathname.split("/").pop() || "index.html";
  const inNotes = location.pathname.includes("/notes/");
  const links = SITE.pages
    .map((p) => {
      const isActive = p.href === current || (inNotes && p.href === "notes.html");
      const active = isActive ? ' class="active" aria-current="page"' : "";
      return `<li><a href="${ROOT}${p.href}"${active}>${p.label}</a></li>`;
    })
    .join("");

  const isHome = current === "index.html" && !inNotes;
  document.getElementById("site-header").innerHTML = `
    <header class="banner${isHome ? " hero" : ""}">
      ${isHome ? '<canvas class="neurons" aria-hidden="true"></canvas>' : wavesSVG()}
      <div class="container">
        <p class="name"><a href="${ROOT}index.html">${SITE.name}</a></p>
        <p class="role">${SITE.role}</p>
        ${isHome ? `<p class="tagline">${SITE.tagline}</p>` : ""}
      </div>
    </header>
    <nav class="nav" aria-label="Main">
      <div class="container">
        <button class="nav-toggle" aria-expanded="false" aria-controls="nav-list">☰ Menu</button>
        <ul id="nav-list">${links}</ul>
      </div>
    </nav>`;

  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-list");
  toggle.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  if (isHome) startNeurons(document.querySelector(".banner canvas.neurons"));
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Home hero: a field of model neurons that drift, connect and fire. Spikes travel along
// the connections and can trigger the neighbours; the pointer acts as an extra neuron.
function startNeurons(canvas) {
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, nodes = [], pulses = [], pointer = null, running = true, last = performance.now();
  const COLORS = ["#ffffff", "#ffd1dc", "#c9b8ff", "#ffd678"];
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, Math.max(28, (W * H) / 6500)));
    while (nodes.length < n) nodes.push({ x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.5) * 12, r: 1.4 + Math.random() * 1.8,
      c: COLORS[Math.floor(Math.random() * COLORS.length)], glow: 0, refractory: 0 });
    nodes.length = n;
  }
  const LINK = () => Math.min(140, Math.max(90, W / 9));
  function fire(i, depth) {
    const a = nodes[i];
    if (a.refractory > 0) return;
    a.glow = 1; a.refractory = 1.2;
    nodes.forEach((b, j) => {
      if (j !== i && Math.hypot(a.x - b.x, a.y - b.y) < LINK() && Math.random() < 0.55)
        pulses.push({ from: i, to: j, t: 0, depth });
    });
  }
  function step(dt) {
    nodes.forEach((n) => {
      if (pointer) {                                          // gentle pull towards the pointer
        const dx = pointer.x - n.x, dy = pointer.y - n.y, d = Math.hypot(dx, dy);
        if (d < 160 && d > 1) { n.vx += (dx / d) * 14 * dt; n.vy += (dy / d) * 14 * dt; }
      }
      n.vx *= 0.995; n.vy *= 0.995;
      const sp = Math.hypot(n.vx, n.vy); if (sp > 22) { n.vx *= 22 / sp; n.vy *= 22 / sp; }
      n.x += n.vx * dt; n.y += n.vy * dt;
      if (n.x < -10) n.x = W + 10; if (n.x > W + 10) n.x = -10;
      if (n.y < -10) n.y = H + 10; if (n.y > H + 10) n.y = -10;
      n.glow = Math.max(0, n.glow - dt * 1.4); n.refractory = Math.max(0, n.refractory - dt);
    });
    if (Math.random() < dt * 1.6) fire(Math.floor(Math.random() * nodes.length), 0);
    pulses.forEach((p) => { p.t += dt * 1.8; });
    pulses.filter((p) => p.t >= 1).forEach((p) => { if (p.depth < 3 && Math.random() < 0.45) fire(p.to, p.depth + 1); });
    pulses = pulses.filter((p) => p.t < 1);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const L = LINK(), all = pointer ? nodes.concat([{ x: pointer.x, y: pointer.y, r: 2.5, c: "#fff", glow: 0.6 }]) : nodes;
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
      const a = all[i], b = all[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < L) {
        ctx.strokeStyle = `rgba(230, 220, 255, ${0.22 * (1 - d / L) + 0.25 * Math.max(a.glow, b.glow) * (1 - d / L)})`;
        ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    pulses.forEach((p) => {
      const a = nodes[p.from], b = nodes[p.to]; if (!a || !b) return;
      const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
      ctx.fillStyle = "rgba(255, 214, 120, 0.95)"; ctx.shadowColor = "#ffd678"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 2 * Math.PI); ctx.fill(); ctx.shadowBlur = 0;
    });
    all.forEach((n) => {
      if (n.glow > 0.02) {
        ctx.fillStyle = `rgba(255, 180, 200, ${0.35 * n.glow})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 10 * n.glow, 0, 2 * Math.PI); ctx.fill();
      }
      ctx.fillStyle = n.c; ctx.globalAlpha = 0.55 + 0.45 * n.glow;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 2 * Math.PI); ctx.fill(); ctx.globalAlpha = 1;
    });
  }
  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
    step(dt); draw();
    if (running) requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener("resize", resize);
  const banner = canvas.parentElement;
  banner.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); pointer = { x: e.clientX - r.left, y: e.clientY - r.top }; });
  banner.addEventListener("pointerleave", () => { pointer = null; });
  if (reducedMotion) { for (let k = 0; k < 40; k++) step(0.05); draw(); return; }   // a still picture
  // Pause when the hero is off screen or the tab is hidden.
  new IntersectionObserver(([e]) => { const was = running; running = e.isIntersecting && !document.hidden;
    if (running && !was) { last = performance.now(); requestAnimationFrame(frame); } }).observe(canvas);
  document.addEventListener("visibilitychange", () => { const was = running; running = !document.hidden;
    if (running && !was) { last = performance.now(); requestAnimationFrame(frame); } });
  requestAnimationFrame(frame);
}

function renderFooter() {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML = `
    <footer>
      <div class="container">
        © ${new Date().getFullYear()} ${SITE.name}
      </div>
    </footer>`;
}

// Fills any <div class="note-cards"> with picture cards for all NOTES.
function renderNoteCards() {
  document.querySelectorAll(".note-cards").forEach((el) => {
    el.innerHTML = NOTES.map((n) => `
      <a class="note-card" href="${ROOT}${n.href}">
        <img src="${ROOT}${n.thumb}" alt="" loading="lazy" width="800" height="450">
        <div class="note-card-body">
          <span class="date">${n.date}</span>
          <h3>${n.title}</h3>
          <p>${n.summary}</p>
          ${(n.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}
        </div>
      </a>`).join("");
  });
}

// Fills <div class="featured"> on the Home page: the Brain Atlas and the latest Lab Note.
function renderFeatured() {
  const el = document.querySelector(".featured");
  if (!el) return;
  const n = NOTES[0];
  const item = (href, img, kicker, title, text) => `
    <a class="feature" href="${ROOT}${href}">
      <img src="${ROOT}${img}" alt="" width="800" height="450">
      <div class="feature-body"><span class="kicker">${kicker}</span><h3>${title}</h3><p>${text}</p>
        <span class="go">Open →</span></div>
    </a>`;
  el.innerHTML =
    item("atlas.html", "assets/img/thumbs/atlas.jpg", "Interactive", "Brain Atlas",
         "Explore the brain in 3D and see which regions lie beneath each 10-20 EEG electrode.") +
    item(n.href, n.thumb, "Latest Lab Note · " + n.date, n.title, n.summary);
}

// Fills any <ul class="note-list" data-limit="N"> with the NOTES above.
function renderNotes() {
  document.querySelectorAll(".note-list").forEach((ul) => {
    const limit = Number(ul.dataset.limit) || NOTES.length;
    ul.innerHTML = NOTES.slice(0, limit)
      .map(
        (n) => `
        <li>
          <span class="date">${n.date}</span>
          <div>
            <h3><a href="${ROOT}${n.href}">${n.title}</a></h3>
            <p>${n.summary}</p>
            ${(n.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}
          </div>
        </li>`
      )
      .join("");
  });
}

// Lab Note pages: reading progress bar, reading time, and previous/next links.
function enhanceNote() {
  const article = document.querySelector("article.post");
  if (!article) return;
  const bar = document.createElement("div");
  bar.className = "read-progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  const update = () => {
    const r = article.getBoundingClientRect(), total = r.height - window.innerHeight;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, -r.top / Math.max(1, total)))})`;
  };
  window.addEventListener("scroll", update, { passive: true }); update();

  const meta = article.querySelector(".post-meta");
  const words = article.innerText.split(/\s+/).length;
  if (meta) meta.textContent += ` · ${Math.max(1, Math.round(words / 200))} min read`;

  const here = location.pathname.split("/").slice(-2).join("/");
  const i = NOTES.findIndex((n) => n.href === here);
  if (i < 0) return;
  const newer = NOTES[i - 1], older = NOTES[i + 1];
  const link = (n, dir) => n ? `<a class="${dir}" href="${ROOT}${n.href}"><span>${dir === "prev" ? "← Previous note" : "Next note →"}</span>${n.title}</a>` : "<span></span>";
  const nav = document.createElement("nav");
  nav.className = "note-nav"; nav.setAttribute("aria-label", "More Lab Notes");
  nav.innerHTML = link(older, "prev") + link(newer, "next");
  article.appendChild(nav);
}

// Sections and cards fade in gently as they scroll into view.
function setupReveal() {
  if (reducedMotion || !("IntersectionObserver" in window)) return;
  const targets = document.querySelectorAll(
    "main h2, main .card, main .sim, main .callout, main .post-figure, main .note-card, main .feature, main .news li, main .compare");
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  targets.forEach((t) => {
    if (t.getBoundingClientRect().top < window.innerHeight) return;   // already visible: leave as is
    t.classList.add("reveal"); io.observe(t);
  });
}

// Click a gallery photo to enlarge it.
function setupLightbox() {
  const images = document.querySelectorAll(".gallery img");
  if (!images.length) return;
  const box = document.createElement("div");
  box.className = "lightbox";
  box.innerHTML = "<img alt=''>";
  document.body.appendChild(box);
  images.forEach((img) =>
    img.addEventListener("click", () => {
      box.querySelector("img").src = img.src;
      box.querySelector("img").alt = img.alt;
      box.classList.add("open");
    })
  );
  box.addEventListener("click", () => box.classList.remove("open"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") box.classList.remove("open");
  });
}

renderHeader();
document.addEventListener("DOMContentLoaded", () => {
  renderFooter();
  renderFeatured();
  renderNoteCards();
  renderNotes();
  enhanceNote();
  setupLightbox();
  setupReveal();
});
