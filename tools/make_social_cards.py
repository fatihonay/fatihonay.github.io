"""Makes the link-preview images (1200x630) and PNG icons for the website.

Run from the website folder (needs numpy, matplotlib, nibabel):
    python tools/make_social_cards.py
Writes assets/img/social/*.png and assets/img/icon-*.png
"""
import json
import textwrap
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import nibabel as nib
import numpy as np
from matplotlib.colors import LinearSegmentedColormap

SITE = Path(__file__).resolve().parent.parent
OUT = SITE / "assets/img/social"
OUT.mkdir(parents=True, exist_ok=True)

BANNER = LinearSegmentedColormap.from_list("banner", ["#2e1f74", "#6a35c9", "#d2557a"])
GLOW = LinearSegmentedColormap.from_list("glow", ["#120f22", "#6a35c9", "#ff7a8a", "#ffd678"])
NAME, ROLE = "Fatih Onay, Ph.D.", "Signal Processing · Biomedical Data · Computational Neuroscience"
plt.rcParams["font.family"] = "DejaVu Sans"


def background(fig):
    """The site banner: diagonal gradient with faint EEG-like waves."""
    ax = fig.add_axes([0, 0, 1, 1])
    grad = np.add.outer(np.linspace(0, 0.35, 63), np.linspace(0, 0.65, 120))
    ax.imshow(grad, cmap=BANNER, aspect="auto", extent=(0, 1200, 0, 630), vmin=0, vmax=1)
    x = np.linspace(0, 1200, 600)
    for i, (y, a, c) in enumerate([(120, 14, "#ffffff"), (520, 18, "#ffd1dc"), (330, 10, "#c9b8ff")]):
        t = 2 * np.pi * x / 600
        ax.plot(x, y + a * (np.sin(2 * t + i) + 0.5 * np.sin(5 * t + 2 * i) + 0.25 * np.sin(9 * t)),
                color=c, lw=1.4, alpha=0.3)
    ax.set_xlim(0, 1200); ax.set_ylim(0, 630); ax.axis("off")
    return ax


def card(filename, title, kicker, draw=None):
    fig = plt.figure(figsize=(12, 6.3), dpi=100)
    background(fig)
    text_w = 0.56 if draw else 0.9
    fig.text(0.055, 0.84, NAME, color="white", fontsize=26, fontweight="bold", family="DejaVu Serif")
    fig.text(0.055, 0.775, ROLE, color="white", alpha=0.85, fontsize=13.5)
    if kicker:
        fig.text(0.055, 0.60, kicker.upper(), color="#ffd1dc", fontsize=15, fontweight="bold")
    wrapped = textwrap.fill(title, 22 if draw else 40)
    fig.text(0.055, 0.56, wrapped, color="white", fontsize=34 if draw else 46, fontweight="bold",
             family="DejaVu Serif", va="top", linespacing=1.2)
    fig.text(0.055, 0.07, "fatihonay.github.io", color="white", alpha=0.8, fontsize=15)
    if draw:
        ax = fig.add_axes([text_w + 0.06, 0.12, 0.34, 0.76])
        ax.set_facecolor("#120f22")
        draw(ax)
        for s in ax.spines.values():
            s.set_visible(False)
        ax.set_xticks([]); ax.set_yticks([])
    fig.savefig(OUT / filename, dpi=100)
    plt.close(fig)


# ---------- Small visuals, one per topic ----------
def draw_synchrony(ax):
    rng = np.random.default_rng(1)
    th = rng.normal(0.6, 0.45, 80)
    r = rng.uniform(0.75, 0.95, 80)
    ax.add_patch(plt.Circle((0, 0), 1, fill=False, color="white", alpha=0.15))
    ax.scatter(r * np.cos(th), r * np.sin(th), s=90, c=th, cmap="plasma", alpha=0.9, edgecolors="none")
    ax.annotate("", xy=(0.75 * np.cos(0.6), 0.75 * np.sin(0.6)), xytext=(0, 0),
                arrowprops=dict(arrowstyle="-|>", color="#ff8fab", lw=3))
    ax.set_xlim(-1.2, 1.2); ax.set_ylim(-1.2, 1.2); ax.set_aspect("equal")


def gabor(lam, deg, n=41):
    y, x = np.mgrid[-n // 2:n // 2 + 1, -n // 2:n // 2 + 1]
    t = np.deg2rad(deg)
    return np.exp(-(x**2 + y**2) / (2 * (lam / 2) ** 2)) * np.cos(2 * np.pi * (x * np.cos(t) + y * np.sin(t)) / lam)


def draw_hierarchy(ax):
    tiles = [gabor(10, d) for d in (0, 45, 90, 135)]
    grid = np.block([[tiles[0], tiles[1]], [tiles[2], tiles[3]]])
    ax.imshow(grid, cmap=GLOW)


def draw_linear(ax):
    r = np.linspace(0, 1, 300)
    F = 1 / (1 + np.exp(-(8 * r - 3)))
    ax.plot(r, r, color="#5ee6c8", lw=3)
    ax.plot(r, F, color="#ff7a8a", lw=4)
    for x0, filled in [(0.0991, True), (0.2075, False), (0.9929, True)]:
        ax.scatter([x0], [x0], s=160, color="#ffd678" if filled else "#120f22", edgecolors="#ffd678",
                   linewidths=3, zorder=3)
    ax.set_xlim(-0.03, 1.03); ax.set_ylim(-0.03, 1.03)


def draw_rf(ax):
    ax.imshow(gabor(9, 45, 81), cmap="gray", extent=(-40, 40, -40, 40))
    ax.add_patch(plt.Circle((0, 0), 18, fill=False, color="#ff7a8a", lw=3, ls="--"))


def draw_atlas(ax):
    atlas = json.loads((SITE / "assets/atlas/atlas.json").read_text())
    brain = np.asarray(nib.load(SITE / "assets/atlas/brain.nii.gz").dataobj)[:, :, 105].T[::-1]
    labels = np.asarray(nib.load(SITE / "assets/atlas/labels.nii.gz").dataobj)[:, :, 105].T[::-1]
    rgb = np.zeros(labels.shape + (3,))
    for lid, reg in atlas["regions"].items():
        rgb[labels == int(lid)] = np.array(reg["rgb"]) / 255
    base = np.dstack([brain / 255.0] * 3)
    mask = (labels > 0)[..., None]
    ax.imshow(np.where(mask, 0.45 * base + 0.55 * rgb, base))
    ax.set_xlim(15, 178); ax.set_ylim(215, 15)


def draw_portrait(ax):
    img = plt.imread(SITE / "assets/img/profile.jpg")
    h, w = img.shape[:2]
    s = min(h, w)
    ax.imshow(img[(h - s) // 2:(h - s) // 2 + s, (w - s) // 2:(w - s) // 2 + s])


def icons():
    """PNG versions of favicon.svg for devices that don't use SVG icons."""
    for size, name in [(180, "icon-180.png"), (32, "icon-32.png")]:
        fig = plt.figure(figsize=(1, 1), dpi=size)
        ax = fig.add_axes([0, 0, 1, 1]); ax.axis("off")
        grad = np.add.outer(np.linspace(0.5, 0, 64), np.linspace(0, 0.5, 64))
        im = ax.imshow(grad, cmap=BANNER, extent=(0, 64, 0, 64), vmin=0, vmax=1)
        corner = matplotlib.patches.FancyBboxPatch((0, 0), 64, 64, boxstyle="round,pad=0,rounding_size=14",
                                                   transform=ax.transData, facecolor="none", edgecolor="none")
        ax.add_patch(corner)
        im.set_clip_path(corner)
        xs = [8, 18, 22, 27, 32, 37, 41, 45, 56]
        ys = [34, 34, 26, 44, 16, 46, 30, 34, 34]
        # Line width in points: the SVG's 4.5 units out of 64, on a 1-inch (72 pt) figure.
        ax.plot(xs, [64 - y for y in ys], color="white", lw=4.5 / 64 * 72, solid_capstyle="round",
                solid_joinstyle="round")
        ax.set_xlim(0, 64); ax.set_ylim(0, 64)
        fig.savefig(SITE / "assets/img" / name, dpi=size, transparent=True)
        plt.close(fig)


if __name__ == "__main__":
    card("home.png", "Academic homepage", "", draw_portrait)
    card("bio.png", "Bio", "About", draw_portrait)
    card("research.png", "Research", "EEG · Signal processing · Neuroscience", draw_linear)
    card("publications.png", "Publications", "Papers & talks", None)
    card("teaching.png", "Teaching", "Courses & supervision", draw_hierarchy)
    card("notes.png", "Lab Notes", "Weekly ideas & simulations", draw_synchrony)
    card("gallery.png", "Gallery", "", None)
    card("contact.png", "Contact", "Get in touch", None)
    card("atlas.png", "Interactive Brain Atlas", "3D brain · 10-20 EEG electrodes", draw_atlas)
    card("note-synchrony.png", "How do neurons fall into rhythm?", "Lab Note", draw_synchrony)
    card("note-visual-hierarchy.png", "From edges to objects: how the brain sees", "Lab Note", draw_hierarchy)
    card("note-linear-nonlinear.png", "Linear or nonlinear? Solving equations in the brain", "Lab Note", draw_linear)
    card("note-receptive-fields.png", "Receptive fields: reading an image from the brain", "Lab Note", draw_rf)
    icons()
    for f in sorted(OUT.iterdir()):
        print(f"{f.name:30s} {f.stat().st_size / 1e3:.0f} kB")
