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
    { href: "teaching.html", label: "Teaching" },
    { href: "gallery.html", label: "Gallery" },
    { href: "contact.html", label: "Contact" },
  ],
};

function renderHeader() {
  const current = location.pathname.split("/").pop() || "index.html";
  const links = SITE.pages
    .map((p) => {
      const active = p.href === current ? ' class="active" aria-current="page"' : "";
      return `<li><a href="${p.href}"${active}>${p.label}</a></li>`;
    })
    .join("");

  document.getElementById("site-header").innerHTML = `
    <header class="banner">
      <div class="container">
        <p class="name"><a href="index.html">${SITE.name}</a></p>
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
  setupLightbox();
});
