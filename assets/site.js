// Shared header, navigation and footer.
// Edit your name, title and menu here once — every page picks it up.
const SITE = {
  name: "Fatih Onay, Ph.D.",
  role: "Signal Processing · Biomedical Data · Computational Neuroscience",
  pages: [
    { href: "index.html", label: "Home" },
    { href: "bio.html", label: "Bio" },
    { href: "research.html", label: "Research" },
    { href: "publications.html", label: "Publications" },
    { href: "notes.html", label: "Lab Notes" },
    { href: "teaching.html", label: "Teaching" },
    { href: "gallery.html", label: "Gallery" },
    { href: "contact.html", label: "Contact" },
  ],
};

// Lab Notes: add one entry per post, newest first.
// The post file goes in the notes/ folder (copy notes/_template.html to start).
const NOTES = [
  {
    href: "notes/2026-10-15-synchrony.html",
    date: "15 Oct 2026",
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

  document.getElementById("site-header").innerHTML = `
    <header class="banner">
      ${wavesSVG()}
      <div class="container">
        <p class="name"><a href="${ROOT}index.html">${SITE.name}</a></p>
        <p class="role">${SITE.role}</p>
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
  renderNotes();
  setupLightbox();
});
