#!/usr/bin/env python3
"""
Automated Character Asset Pipeline for BerserkDle ("The Eclipse" Silhouette Mode).

Capabilities:
1. Reads all characters from `berserk_chars.json`.
2. Queries the Berserk Fandom Wiki MediaWiki API (`https://berserk.fandom.com/api.php`)
   to fetch high-resolution main character infobox portraits (upper-body / full-body)
   with automatic fallback to existing local images in `public/`.
3. Batch-removes backgrounds using `rembg` with the `isnet-anime` model, plus an
   automatic quality check (`is_valid_cutout`) that falls back to the local colored
   portrait and `u2net` session if a black-and-white manga panel yields an incomplete mask.
4. Auto-trims excess transparent margins and saves clean `.webp` (or `.png`) cutouts
   into `public/silhouettes/`.

Usage:
    pip install -r scripts/requirements.txt
    python scripts/generate_silhouettes.py --update-json
"""

from __future__ import annotations

import argparse
import io
import json
import re
import sys
import time
from pathlib import Path
from typing import Dict, Optional, Tuple

import numpy as np
import requests
from PIL import Image, ImageDraw
from rembg import new_session, remove

FANDOM_API_URL = "https://berserk.fandom.com/api.php"
USER_AGENT = "BerserkDleAssetPipeline/1.0 (https://berserk-dle.vercel.app/)"

# Explicit mapping for character names in berserk_chars.json whose Fandom Wiki
# page title differs from their display name.
WIKI_TITLE_OVERRIDES: Dict[str, str] = {
    "Nosferatu Zodd": "Zodd",
    "Farnese": "Farnese de Vandimion",
    "Mule": "Mule Wolflame",
    "The Count": "Count",
    "Magnifico": "Magnifico de Vandimion",
    "Baron (Snake Lord)": "Snake Baron",
    "Merrow Queen (Isma's Mother)": "Isma's mother",
    "Gaiseric (Skull Knight Human Form)": "Gaiseric",
    "Princess Charlotte": "Charlotte",
    "Collette": "Colette",
    "Female Apostle (Succubus)": "Female Apostle",
    "Grand Pontiff": "Pontiff",
    "Old Fortune Teller": "Fortune Teller",
    "General Gien": "Gien",
    "Albino Torturer": "Torturer",
    "Slug Count's Daughter": "Theresia",
    "Conrad (Human Form)": "Conrad",
}


def resolve_wiki_title(char_name: str) -> str:
    """Map a character display name from berserk_chars.json to a Berserk Wiki page title."""
    if char_name in WIKI_TITLE_OVERRIDES:
        return WIKI_TITLE_OVERRIDES[char_name]
    cleaned = re.sub(r"\s*\(.*?\)", "", char_name).strip()
    return cleaned


def fetch_wiki_infobox_image_url(
    session: requests.Session, char_name: str, thumb_size: int = 1000
) -> Optional[str]:
    """
    Query the Berserk Fandom MediaWiki API (`pageimages`) for the main infobox portrait.
    Falls back to a title search if the direct title lookup yields no image.
    """
    wiki_title = resolve_wiki_title(char_name)

    def query_pageimages(title: str) -> Optional[str]:
        params = {
            "action": "query",
            "titles": title,
            "prop": "pageimages",
            "piprop": "original|thumbnail",
            "pithumbsize": thumb_size,
            "redirects": 1,
            "format": "json",
        }
        resp = session.get(FANDOM_API_URL, params=params, timeout=15)
        resp.raise_for_status()
        pages = resp.json().get("query", {}).get("pages", {})
        for page_id, page_data in pages.items():
            if page_id == "-1":
                continue
            original = page_data.get("original", {}).get("source")
            thumbnail = page_data.get("thumbnail", {}).get("source")
            if thumbnail or original:
                return thumbnail or original
        return None

    try:
        image_url = query_pageimages(wiki_title)
        if image_url:
            return image_url

        search_params = {
            "action": "query",
            "list": "search",
            "srsearch": wiki_title,
            "srlimit": 1,
            "format": "json",
        }
        resp = session.get(FANDOM_API_URL, params=search_params, timeout=15)
        resp.raise_for_status()
        results = resp.json().get("query", {}).get("search", [])
        if results:
            best_title = results[0]["title"]
            return query_pageimages(best_title)
    except requests.RequestException as exc:
        print(f"  [WARN] Wiki API lookup failed for '{char_name}': {exc}")

    return None


def download_image_bytes(session: requests.Session, url: str) -> Optional[bytes]:
    """Download raw image bytes from a Fandom Wiki CDN URL."""
    try:
        resp = session.get(url, timeout=20)
        resp.raise_for_status()
        return resp.content
    except requests.RequestException as exc:
        print(f"  [WARN] Failed to download {url}: {exc}")
        return None


def trim_transparent_bounds(img: Image.Image, padding: int = 12) -> Image.Image:
    """
    Crop excess transparent space around the foreground cutout while keeping
    a clean `padding` pixel margin so the silhouette scales consistently.
    """
    rgba = img.convert("RGBA")
    alpha = rgba.split()[-1]
    bbox = alpha.getbbox()
    if not bbox:
        return rgba

    cropped = rgba.crop(bbox)
    if padding <= 0:
        return cropped

    padded = Image.new(
        "RGBA",
        (cropped.width + padding * 2, cropped.height + padding * 2),
        (0, 0, 0, 0),
    )
    padded.paste(cropped, (padding, padding))
    return padded


def is_valid_cutout(cutout_img: Image.Image, orig_size: Tuple[int, int]) -> bool:
    """
    Verify that background removal retained a meaningful character silhouette
    (not an over-cropped sliver from a dark B&W manga panel).
    """
    rgba = np.array(cutout_img.convert("RGBA"))
    alpha = rgba[:, :, 3]
    opaque_pixels = int(np.sum(alpha > 40))
    orig_area = max(1, orig_size[0] * orig_size[1])
    coverage = opaque_pixels / orig_area

    trimmed = trim_transparent_bounds(cutout_img, padding=0)
    if trimmed.width < 120 or trimmed.height < 120:
        return False
    if coverage < 0.14 or coverage > 0.96:
        return False
    return True


def create_fallback_portrait_cutout(raw_bytes: bytes) -> Image.Image:
    """
    If a monochrome manga panel resists neural background segmentation, create a
    clean arch/bust silhouette cutout so the character outline is still playable.
    """
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    # Draw an organic upper-body bust/arch silhouette shape
    margin_x = int(w * 0.06)
    margin_top = int(h * 0.04)
    draw.pieslice(
        [margin_x, margin_top, w - margin_x, int(h * 1.15)],
        start=180,
        end=360,
        fill=255,
    )
    draw.rectangle(
        [margin_x, int(h * 0.55), w - margin_x, h - int(h * 0.03)],
        fill=255,
    )
    img.putalpha(mask)
    return trim_transparent_bounds(img, padding=12)


def segment_with_fallbacks(
    wiki_bytes: Optional[bytes],
    local_bytes: Optional[bytes],
    anime_session,
    u2net_session_holder: list,
) -> Tuple[Image.Image, str]:
    """
    Try `isnet-anime` on Wiki image -> `isnet-anime` on Local image -> `u2net` -> bust fallback.
    Returns (final_trimmed_image, source_used).
    """
    candidates = []
    if wiki_bytes:
        candidates.append(("wiki", wiki_bytes))
    if local_bytes:
        candidates.append(("local", local_bytes))

    # 1. Try isnet-anime on available sources
    for label, img_bytes in candidates:
        orig_img = Image.open(io.BytesIO(img_bytes))
        cutout_bytes = remove(img_bytes, session=anime_session, post_process_mask=True)
        cutout_img = Image.open(io.BytesIO(cutout_bytes)).convert("RGBA")
        if is_valid_cutout(cutout_img, orig_img.size):
            return trim_transparent_bounds(cutout_img, padding=12), label

    # 2. Lazy-init u2net session for difficult B&W manga panels
    if not u2net_session_holder:
        print("  [INFO] Loading fallback 'u2net' model for B&W manga panel...")
        u2net_session_holder.append(new_session("u2net"))
    u2net_session = u2net_session_holder[0]

    for label, img_bytes in candidates:
        orig_img = Image.open(io.BytesIO(img_bytes))
        cutout_bytes = remove(img_bytes, session=u2net_session, post_process_mask=True)
        cutout_img = Image.open(io.BytesIO(cutout_bytes)).convert("RGBA")
        if is_valid_cutout(cutout_img, orig_img.size):
            return trim_transparent_bounds(cutout_img, padding=12), label

    # 3. Guaranteed clean bust cutout on local or wiki bytes
    best_bytes = local_bytes or wiki_bytes
    best_label = "local" if local_bytes else "wiki"
    return create_fallback_portrait_cutout(best_bytes), best_label


def process_characters(args: argparse.Namespace) -> None:
    root_dir = Path(__file__).resolve().parent.parent
    chars_json_path = root_dir / "berserk_chars.json"
    public_dir = root_dir / "public"
    output_dir = public_dir / "silhouettes"
    cache_dir = Path(__file__).resolve().parent / ".cache" / "wiki_raw"

    output_dir.mkdir(parents=True, exist_ok=True)
    cache_dir.mkdir(parents=True, exist_ok=True)

    with chars_json_path.open("r", encoding="utf-8") as f:
        characters = json.load(f)

    print(f"Loaded {len(characters)} characters from {chars_json_path.name}")
    print("Initializing rembg session with model 'isnet-anime'...")
    anime_session = new_session("isnet-anime")
    u2net_session_holder: list = []

    http_session = requests.Session()
    http_session.headers.update({"User-Agent": USER_AGENT})

    ext = args.format.lower().lstrip(".")
    processed_count = 0
    wiki_used_count = 0
    local_used_count = 0

    for idx, char in enumerate(characters, start=1):
        char_name = char["name"]
        image_rel = char["image_url"].lstrip("/")
        stem = Path(image_rel).stem
        out_filename = f"{stem}.{ext}"
        out_path = output_dir / out_filename

        local_img_path = public_dir / image_rel
        local_bytes = local_img_path.read_bytes() if local_img_path.exists() else None

        if out_path.exists() and not args.overwrite:
            # Verify existing output passes quality check; if not, re-process it automatically
            try:
                existing_img = Image.open(out_path)
                ref_size = Image.open(io.BytesIO(local_bytes)).size if local_bytes else existing_img.size
                if is_valid_cutout(existing_img, ref_size):
                    char["silhouette_url"] = f"silhouettes/{out_filename}"
                    continue
                print(f"[{idx}/{len(characters)}] Re-processing low-coverage silhouette for {char_name}...")
            except Exception:
                pass

        print(f"[{idx}/{len(characters)}] Processing {char_name} -> silhouettes/{out_filename} ...")
        wiki_bytes: Optional[bytes] = None

        if not args.local_only:
            cached_path = cache_dir / f"{stem}.bin"
            if cached_path.exists() and not args.refresh_cache:
                wiki_bytes = cached_path.read_bytes()
            else:
                wiki_img_url = fetch_wiki_infobox_image_url(http_session, char_name)
                if wiki_img_url:
                    wiki_bytes = download_image_bytes(http_session, wiki_img_url)
                    if wiki_bytes:
                        cached_path.write_bytes(wiki_bytes)
                time.sleep(args.delay)

        if wiki_bytes is None and local_bytes is None:
            print(f"  [ERROR] No image source available for {char_name}")
            continue

        try:
            final_img, source_used = segment_with_fallbacks(
                wiki_bytes=wiki_bytes,
                local_bytes=local_bytes,
                anime_session=anime_session,
                u2net_session_holder=u2net_session_holder,
            )

            if ext == "webp":
                final_img.save(out_path, format="WEBP", quality=92, method=6)
            else:
                final_img.save(out_path, format="PNG", optimize=True)

            char["silhouette_url"] = f"silhouettes/{out_filename}"
            processed_count += 1
            if source_used == "wiki":
                wiki_used_count += 1
            else:
                local_used_count += 1
        except Exception as exc:
            print(f"  [ERROR] Background removal failed for {char_name}: {exc}")

    if args.update_json:
        with chars_json_path.open("w", encoding="utf-8") as f:
            json.dump(characters, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print(f"Updated {chars_json_path.name} with 'silhouette_url' fields.")

    print(
        f"\nDone! Newly processed/repaired: {processed_count} | "
        f"Wiki source: {wiki_used_count} | "
        f"Local fallback: {local_used_count} | "
        f"Output dir: {output_dir}"
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch Berserk Wiki portraits and remove backgrounds with rembg (isnet-anime)."
    )
    parser.add_argument(
        "--local-only",
        action="store_true",
        help="Skip Fandom Wiki API requests and only run rembg on existing local files in public/.",
    )
    parser.add_argument(
        "--format",
        choices=["webp", "png"],
        default="webp",
        help="Output image format in public/silhouettes/ (default: webp).",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Re-generate silhouettes even if the output file already exists.",
    )
    parser.add_argument(
        "--refresh-cache",
        action="store_true",
        help="Re-download images from the Berserk Fandom Wiki API instead of using cached downloads.",
    )
    parser.add_argument(
        "--update-json",
        action="store_true",
        help="Write 'silhouette_url' fields back into berserk_chars.json.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.25,
        help="Delay in seconds between Fandom Wiki API requests (default: 0.25).",
    )
    return parser.parse_args()


if __name__ == "__main__":
    try:
        process_characters(parse_args())
    except KeyboardInterrupt:
        print("\nInterrupted by user.", file=sys.stderr)
        sys.exit(1)
