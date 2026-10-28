"""Adds the browser-tab icon and link-preview tags (Open Graph / Twitter) to every page.

Run from the website folder after adding a page or note:
    python3 tools/add_head_tags.py
Each page gets (or has replaced) a block between <!-- head-tags --> and <!-- /head-tags -->.
For a new Lab Note, add one line to PAGES below and make its image with tools/make_social_cards.py.
"""
import html
import re
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
BASE = "https://fatihonay.github.io/"
NAME = "Fatih Onay, Ph.D."

# page: (preview image in assets/img/social/, type, description used when the page has none)
PAGES = {
    "index.html": ("home.png", "website", None),
    "bio.html": ("bio.png", "profile",
                 "Biography, education, positions and awards of Fatih Onay, signal processing researcher "
                 "at Bursa Technical University."),
    "research.html": ("research.png", "website",
                      "Research of Fatih Onay: EEG biomarkers, brain connectivity, Riemannian EEG methods, "
                      "MEG and signal decomposition."),
    "publications.html": ("publications.png", "website",
                          "Journal articles, conference papers and theses by Fatih Onay, with DOI links."),
    "teaching.html": ("teaching.png", "website",
                      "Courses taught by Fatih Onay at Bursa Technical University, and student supervision."),
    "notes.html": ("notes.png", "website", None),
    "atlas.html": ("atlas.png", "website", None),
    "gallery.html": ("gallery.png", "website", "Photos from the lab, conferences and science-art projects."),
    "contact.html": ("contact.png", "website", "How to contact Fatih Onay at Bursa Technical University."),
    "notes/2026-10-15-synchrony.html": ("note-synchrony.png", "article", None),
    "notes/2026-10-26-visual-hierarchy.html": ("note-visual-hierarchy.png", "article", None),
    "notes/2026-10-27-linear-nonlinear.html": ("note-linear-nonlinear.png", "article", None),
    "notes/2026-10-28-receptive-fields.html": ("note-receptive-fields.png", "article", None),
}

BLOCK = re.compile(r"\n?  <!-- head-tags -->.*?<!-- /head-tags -->", re.S)


def tags(page, title, description, image, kind):
    root = "../" * page.count("/")
    url = BASE + ("" if page == "index.html" else page)
    t, d = html.escape(title, quote=True), html.escape(description, quote=True)
    img = BASE + "assets/img/social/" + image
    return f"""
  <!-- head-tags -->
  <link rel="icon" href="{root}assets/img/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="{root}assets/img/icon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="{root}assets/img/icon-180.png">
  <link rel="canonical" href="{url}">
  <meta property="og:site_name" content="{NAME}">
  <meta property="og:type" content="{kind}">
  <meta property="og:title" content="{t}">
  <meta property="og:description" content="{d}">
  <meta property="og:url" content="{url}">
  <meta property="og:image" content="{img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{t}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{t}">
  <meta name="twitter:description" content="{d}">
  <meta name="twitter:image" content="{img}">
  <!-- /head-tags -->"""


def main():
    for page, (image, kind, fallback) in PAGES.items():
        path = SITE / page
        s = BLOCK.sub("", path.read_text())
        title = html.unescape(re.search(r"<title>(.*?)</title>", s, re.S).group(1).strip())
        m = re.search(r'<meta name="description" content="(.*?)">', s, re.S)
        if m:
            description = html.unescape(m.group(1))
        else:
            description = fallback
            s = s.replace("</title>", f'</title>\n  <meta name="description" content="{html.escape(fallback, quote=True)}">', 1)
        assert description, page
        assert (SITE / "assets/img/social" / image).exists(), image
        s = s.replace("\n</head>", tags(page, title, description, image, kind) + "\n</head>", 1)
        path.write_text(s)
        print(f"{page:42s} {image}")


if __name__ == "__main__":
    main()
