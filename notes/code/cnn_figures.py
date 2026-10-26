"""Figures for the Lab Note "From edges to objects: how the brain sees".

Looks inside a trained CNN (ResNet-18, ImageNet) in three figures:
  1. the learned first-layer filters (compare with V1 edge cells),
  2. one photo passing through the network, from edges to object-level maps,
  3. the network's top-5 guesses for that photo.

Requirements:  pip install torch torchvision scikit-image matplotlib
Run:           python cnn_figures.py  (writes PNGs next to this script, or to --out)
"""
import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import torch
from matplotlib.colors import LinearSegmentedColormap
from skimage import data
from torchvision.models import ResNet18_Weights, resnet18
from torchvision.transforms.functional import center_crop, resize

# Colours that match the website's demo.
INK, MUTED, PAPER = "#2b2735", "#6c6578", "#fdfaf5"
GLOW = LinearSegmentedColormap.from_list("glow", ["#120f22", "#6a35c9", "#ff7a8a", "#ffd678"])
plt.rcParams.update({"font.family": "sans-serif", "font.size": 11, "text.color": INK,
                     "axes.labelcolor": INK, "xtick.color": MUTED, "ytick.color": MUTED,
                     "figure.facecolor": PAPER, "savefig.facecolor": PAPER})


def load_model():
    weights = ResNet18_Weights.IMAGENET1K_V1
    model = resnet18(weights=weights).eval()
    return model, weights


def figure_filters(model, out):
    """The 64 first-layer filters, each scaled on its own so its pattern is visible."""
    w = model.conv1.weight.detach()                      # 64 x 3 x 7 x 7
    fig, axes = plt.subplots(8, 8, figsize=(6.4, 6.4))
    for ax, f in zip(axes.flat, w):
        f = (f - f.min()) / (f.max() - f.min())
        ax.imshow(f.permute(1, 2, 0).numpy(), interpolation="nearest")
        ax.axis("off")
    fig.suptitle("Layer 1 of a trained CNN: 64 learned filters", fontsize=13, fontweight="bold")
    fig.text(0.5, 0.015, "Many are oriented edge detectors (like V1), others respond to colour contrast.",
             ha="center", color=MUTED, fontsize=10)
    fig.tight_layout(rect=(0, 0.03, 1, 0.97))
    fig.savefig(out / "cnn-layer1-filters.png", dpi=150)
    plt.close(fig)


def run_with_taps(model, x):
    """Forward pass that keeps the output of each stage."""
    taps = {}
    stages = {"Stage 1": model.relu, "Stage 2": model.layer1, "Stage 3": model.layer2,
              "Stage 4": model.layer3, "Stage 5": model.layer4}
    hooks = [m.register_forward_hook(lambda _m, _i, o, name=name: taps.__setitem__(name, o.detach()[0]))
             for name, m in stages.items()]
    with torch.no_grad():
        logits = model(x)
    for h in hooks:
        h.remove()
    return logits[0], taps


def figure_feature_maps(image, taps, cam, answer, out):
    """One photo through the network: one unit per stage, then where the 'cat' evidence comes from."""
    captions = {"Stage 1": "edges", "Stage 2": "textures", "Stage 3": "patterns",
                "Stage 4": "object parts", "Stage 5": "whole object"}
    fig, axes = plt.subplots(2, 4, figsize=(9.6, 5.4))
    axes = axes.flat
    ax = next(axes)
    ax.imshow(image)
    ax.set_title("Input photo\n224×224 pixels", fontsize=10, fontweight="bold")
    for name, maps in taps.items():
        ch = maps.flatten(1).std(1).argmax()               # the unit with the most spatial structure
        h, w = maps.shape[1:]
        ax = next(axes)
        ax.imshow(maps[ch].numpy(), cmap=GLOW, interpolation="nearest")
        ax.set_title(f"{name}: {captions[name]}\n{h}×{w} units", fontsize=10, fontweight="bold")
    ax = next(axes)
    ax.imshow(image.mean(2), cmap="gray", vmin=0, vmax=400)
    ax.imshow(cam, cmap=GLOW, alpha=0.65, extent=(0, image.shape[1], image.shape[0], 0), interpolation="bilinear")
    ax.set_title("Where the 'cat'\nevidence comes from", fontsize=10, fontweight="bold")
    ax = next(axes)
    ax.text(0.5, 0.5, f"Network's answer:\n\n{answer}", ha="center", va="center", fontsize=12,
            fontweight="bold", color="#e5604a", transform=ax.transAxes)
    for ax in fig.axes:
        ax.axis("off")
    fig.tight_layout()
    fig.savefig(out / "cnn-feature-maps.png", dpi=150)
    plt.close(fig)


def class_activation_map(model, last_maps, class_idx):
    """CAM (Zhou et al. 2016): weight the last stage's maps by the output layer's weights for one class."""
    w = model.fc.weight.detach()[class_idx]             # 512 weights
    cam = torch.einsum("c,chw->hw", w, last_maps).clamp(min=0)
    return (cam / cam.max()).numpy()


def figure_predictions(logits, categories, out):
    p = logits.softmax(0)
    top = p.argsort(descending=True)[:5]
    labels = [categories[i] for i in top][::-1]
    values = [p[i].item() * 100 for i in top][::-1]
    fig, ax = plt.subplots(figsize=(6.4, 2.6))
    bars = ax.barh(labels, values, color=["#c9b8ff"] * 4 + ["#e5604a"], height=0.6)
    for b, v in zip(bars, values):
        text = f"{v:.0f}%" if v >= 1 else f"{v:.1f}%"
        ax.text(b.get_width() + 1, b.get_y() + b.get_height() / 2, text, va="center", fontsize=10)
    ax.set_facecolor(PAPER)
    ax.set_xlim(0, max(values) * 1.18)
    ax.set_xlabel("probability (%)")
    ax.set_title("Last layer: the network's top-5 guesses", fontweight="bold", loc="left")
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    fig.tight_layout()
    fig.savefig(out / "cnn-predictions.png", dpi=150)
    plt.close(fig)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=Path(__file__).parent)
    out = parser.parse_args().out
    out.mkdir(parents=True, exist_ok=True)

    model, weights = load_model()
    photo = torch.from_numpy(data.chelsea()).permute(2, 0, 1)   # scikit-image sample photo (CC0)
    x = weights.transforms()(photo).unsqueeze(0)
    # The same resize + centre crop as the network's input, for display.
    seen = center_crop(resize(photo, 256, antialias=True), 224).permute(1, 2, 0).numpy()
    logits, taps = run_with_taps(model, x)
    cam = class_activation_map(model, taps["Stage 5"], logits.argmax().item())

    figure_filters(model, out)
    p = logits.softmax(0)
    answer = f"{weights.meta['categories'][p.argmax()]}\n({p.max().item() * 100:.0f}%)"
    figure_feature_maps(seen, taps, cam, answer, out)
    figure_predictions(logits, weights.meta["categories"], out)
    top = logits.softmax(0).topk(5)
    for p, i in zip(top.values, top.indices):
        print(f"{weights.meta['categories'][i]:25s} {p.item() * 100:5.1f}%")


if __name__ == "__main__":
    main()
