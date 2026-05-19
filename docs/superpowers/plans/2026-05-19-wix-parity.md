# Wix-Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Hugo + GitHub Pages site visually and interactively identical to the live Wix site at https://www.dannixu.com/, with image layouts as the #1 priority.

**Architecture:** Reproduce Wix's behaviors in Hugo templates + custom CSS/JS. Use front-matter-driven group definitions on the homepage so groups can match Wix's variable sizes. Switch sub-page galleries to a justified-row layout (matching Wix's "Pro Gallery" output). Replace PhotoSwipe's dark lightbox with a white-bg, side-caption variant. Fix nav active-state logic and a broken background-image path. No new dependencies.

**Tech Stack:** Hugo extended v0.160+, hugo-theme-gallery, vanilla JS, CSS Grid + Flexbox.

---

## Reference: observed Wix homepage groupings @ 1440×900 viewport

Six gallery regions on the homepage, sequentially:

| Group | Imgs | Layout pattern | Approx. dimensions per image (w×h) |
|------:|-----:|----------------|------------------------------------|
| 0 | 4 | A: 2-top + 1-bottom-left + 1-right-tall | 170×136, 170×136, 345×277, 626×418 |
| 1 | 4 | A (taller smalls) | 161×207, 160×207, 326×218, 644×430 |
| 2 | 4 | A (asymmetric top) | 222×178, 143×178, 370×297, 599×480 |
| 3 | 5 | B: 2-stacked-left + (small+medium top right) + wide-bottom-right | 451×301, 451×301, 158×237, 356×237, 519×365 |
| 4 | 5 | C: 2-top + 1-large-bottom (left col span) + 2-stacked (right) | 285×190, 264×190, 554×370, 420×280, 420×280 |
| 5 | 4 | A | 266×177, 145×177, 416×278, 689×460 |

Total = 26 images (matches our `01.jpg`–`26.jpg`). Mapping (sequence-based): 01–04, 05–08, 09–12, 13–17, 18–22, 23–26.

---

## Reference: observed Wix sub-page layouts @ 1440×900 viewport

- **Paper Jewelry** (`/paper-jewelry`): 3-col, 6 images, all square cells, `object-fit: cover`-ish. Cells ≈ 224×224.
- **GEM Series** (`/gem-series`): 3-col justified row — variable widths per row, common row-height. 1 row: 111, 250, 252 (h=166).
- **Lillstreet** (`/current-work`): 3-col justified — 3 rows of (111+250+252)=row1 then 2 rows of pairs (315+316) at h=210.
- **Undergrad** (`/undergrad`): 4-col grid — cells 131×208 (portrait), `object-fit: contain` to preserve white-bg photos.
- **Undergrad Thesis** (`/undergrad-thesis`): horizontal carousel — 3 images visible, partial 4th peeking on right, prev/next arrows.
- **Production Line** (`/production-line`): 3-col justified — 5 images.

---

## Reference: observed Wix interactions

- **Hover**: image LIGHTENS (looks like `filter: brightness(1.05) saturate(0.9)` or `opacity: 0.7`), NOT darkens.
- **Lightbox**: WHITE background; image on left ~60% width; caption on RIGHT ~25% width with title (larger) + materials/dimension/date stack; `< >` thin arrows mid-height; `X` top-right; expand+heart icons top-left.
- **Dropdown** ("Past Work"): opens on hover, no `▼` indicator on the trigger. Light shadow, no border.
- **Nav active state**: parent menu item gets `#4a90d9` blue when on the page (or any child page). Currently broken — `:first-child` is always blue.
- **Footer**: empty (no "Danni Xu Studio" text).
- **Carousel**: arrows are thin `< >`, sit outside the visible images; partial 4th image visible on right.

---

## File Structure

Files to modify:

- `content/_index.md` — switch from flat `resources` to grouped `groups` front-matter; preserve metadata.
- `layouts/partials/gallery.html` — rewrite to iterate `groups` and emit `image-group` containers tagged with layout type.
- `layouts/partials/gallery-simple.html` — switch grid mode to justified-row layout; keep square + carousel modes as opt-ins.
- `assets/css/custom.css` — add layout-A/B/C CSS for the 3 group types; rewrite hover; rewrite past-work justified styles; rewrite lightbox CSS; fix nav active rules; fix bio-bg URL using Hugo's `{{ "images/..." | relURL }}`.
- `assets/js/custom.js` — extend carousel behavior; no change otherwise.
- `assets/js/lightbox.js` (NEW) — initialise PhotoSwipe with white-bg theme + caption-on-right plugin OR replace with a small custom lightbox.
- `layouts/partials/head-custom.html` — inject the lightbox CSS theme override.
- `layouts/partials/header.html` — remove `▼` from the dropdown toggle; replace social-icon SVGs with filled versions matching Wix.
- `layouts/partials/footer.html` (NEW override) — empty or minimal.
- `content/cv.md` — expand to match Wix CV content + reformat with tabular layout.
- `content/contact.md` — restructure so info sits near the top with link-style colors.
- `content/bio.md` — keep content, only style changes are in CSS.
- `content/<each subpage>/index.md` — add `layout: justified` (or `square` for paper-jewelry, `portrait-cover` for undergrad) front-matter.

Files to read (no changes):

- `hugo.toml` — already has correct menu structure; confirm `baseURL` strategy.
- `themes/gallery/...` — confirm what defaults we are overriding.

---

## Pre-flight (one-time)

- [ ] **Restart Hugo with clean cache** (read CLAUDE.md guidance)

```bash
pkill -f "hugo server"; sleep 1
rm -rf /Users/bookeryu/WorkSpace/danni-web/resources /Users/bookeryu/WorkSpace/danni-web/public
cd /Users/bookeryu/WorkSpace/danni-web
hugo server --bind 0.0.0.0 -p 1313 --noHTTPCache --disableFastRender &
sleep 5
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:1313/danni-web/
```
Expected: `200`.

---

## PHASE 1 — Homepage gallery groups (HIGHEST PRIORITY)

User's wife flagged "image layouts are different." This phase fixes the homepage.

### Task 1.1: Restructure `_index.md` into 6 named groups

**Files:**
- Modify: `content/_index.md` (entire file)

- [ ] **Step 1: Rewrite `_index.md` front matter** to define 6 groups (A/B/C layouts) with image references and metadata. Keep existing titles/descriptions per image.

```yaml
---
title: "Security Blanket"
description: ""
params:
  groups:
    - layout: "A"
      images:
        - src: "01.jpg"
          title: "Security Blanket I"
          description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021"
        - src: "02.jpg"
          title: "Security Blanket II"
          description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021"
        - src: "03.jpg"
          title: "Security Blanket III"
          description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021"
        - src: "04.jpg"
          title: "베개 [begae] (Pillow)"
          description: "Materials: 3d printed resin, copper, powder coating, stainless steel, linen<br>Dimension: 3\"x2\" x1\"<br>Date: 2021"
    - layout: "A"
      images:
        - { src: "05.jpg", title: "Security Blanket V",    description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "06.jpg", title: "Security Blanket VI",   description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "07.jpg", title: "Security Blanket VII",  description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "08.jpg", title: "Security Blanket VIII", description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
    - layout: "A"
      images:
        - { src: "09.jpg", title: "Security Blanket IX",   description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "10.jpg", title: "Security Blanket X",    description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "11.jpg", title: "Security Blanket XI",   description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "12.jpg", title: "Security Blanket XII",  description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
    - layout: "B"
      images:
        - { src: "13.jpg", title: "Security Blanket XIII", description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "14.jpg", title: "Security Blanket XIV",  description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "15.jpg", title: "Security Blanket XV",   description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "16.jpg", title: "Security Blanket XVI",  description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "17.jpg", title: "Security Blanket XVII", description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
    - layout: "C"
      images:
        - { src: "18.jpg", title: "Security Blanket XVIII", description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "19.jpg", title: "Security Blanket XIX",   description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "20.jpg", title: "Security Blanket XX",    description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "21.jpg", title: "Security Blanket XXI",   description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "22.jpg", title: "Security Blanket XXII",  description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
    - layout: "A"
      images:
        - { src: "23.jpg", title: "Security Blanket XXIII", description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "24.jpg", title: "Security Blanket XXIV",  description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "25.jpg", title: "Security Blanket XXV",   description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
        - { src: "26.jpg", title: "Security Blanket XXVI",  description: "Materials: TBD<br>Dimension: TBD<br>Date: 2021" }
resources:
  - src: "*.jpg"
---
```

The `resources` glob keeps Hugo's image processing pipeline available for all `*.jpg` files in this section.

- [ ] **Step 2: Verify front matter parses**

```bash
hugo --quiet --renderToMemory 2>&1 | head -20
```
Expected: no parse errors.

- [ ] **Step 3: Commit**

```bash
git add content/_index.md
git commit -m "Restructure homepage into 6 Wix-matching groups (4-4-4-5-5-4)"
```

### Task 1.2: Rewrite homepage gallery partial to render groups

**Files:**
- Rewrite: `layouts/partials/gallery.html` (entire file)

- [ ] **Step 1: Replace the entire `gallery.html`** with a version that iterates `Params.groups` and emits a `.image-group.layout-X` container per group.

```html
{{/* Homepage gallery: iterate `groups` from front-matter; each group emits a .image-group.layout-A|B|C. */}}
<section class="gallery home-gallery">
  <div id="gallery">
    {{ $publishResources := default true .Params.build.publishResources }}

    {{ range $g, $group := .Params.groups }}
      {{ $layout := default "A" $group.layout }}
      <div class="image-group layout-{{ $layout }}">
        {{ range $i, $item := $group.images }}
          {{ $image := $.Resources.GetMatch $item.src }}
          {{ if $image }}
            {{ $thumb := $image.Filter (slice images.AutoOrient (images.Process "fit 2000x2000")) }}
            {{ $full  := $image.Filter (slice images.AutoOrient (images.Process "fit 2000x2000")) }}
            <a class="gallery-item grid-img grid-img-{{ add $i 1 }}"
               href="{{ if $publishResources }}{{ $image.RelPermalink }}{{ else }}{{ $full.RelPermalink }}{{ end }}"
               data-pswp-src="{{ $full.RelPermalink }}"
               data-pswp-width="{{ $full.Width }}"
               data-pswp-height="{{ $full.Height }}"
               data-pswp-target="{{ $image.Name | urlize }}"
               title="{{ $item.title }}"
               itemscope itemtype="https://schema.org/ImageObject">
              <img class="lazyload"
                   width="{{ $thumb.Width }}"
                   height="{{ $thumb.Height }}"
                   data-src="{{ $thumb.RelPermalink }}"
                   alt="{{ $item.title }}" />
              {{ with $item.title }}
                <span class="pswp-caption-content">
                  <strong>{{ . }}</strong>
                  {{ with $item.description }}<br>{{ . | safeHTML }}{{ end }}
                </span>
              {{ end }}
              <meta itemprop="contentUrl" content="{{ if $publishResources }}{{ $image.RelPermalink }}{{ else }}{{ $full.RelPermalink }}{{ end }}" />
            </a>
          {{ end }}
        {{ end }}
      </div>
    {{ end }}
  </div>
</section>
```

- [ ] **Step 2: Verify it builds**

```bash
curl -s http://localhost:1313/danni-web/ | grep -c 'image-group'
```
Expected: `6`.

```bash
curl -s http://localhost:1313/danni-web/ | grep -c 'gallery-item'
```
Expected: `26`.

- [ ] **Step 3: Commit**

```bash
git add layouts/partials/gallery.html
git commit -m "Homepage gallery: iterate groups + per-group layout classes"
```

### Task 1.3: Add CSS for Layout A (4-image, the "standard" Wix pattern)

**Files:**
- Modify: `assets/css/custom.css` — REPLACE the existing "HOMEPAGE: 4-image grid groups" section (the block starting `.image-group {` through `.image-group:has(.grid-img-3):not(:has(.grid-img-4)) {`).

- [ ] **Step 1: Replace homepage grid CSS**

```css
/* ======================================
   HOMEPAGE: variable-sized image groups
   Wix reproduces 3 layouts (A/B/C).
   Target width ≈ 976px (matches Wix at 1440 viewport).
   ====================================== */

.home-gallery { padding-left: 230px; padding-right: 230px; }

.image-group {
  display: grid;
  gap: 4px;
  margin-bottom: 80px;
  max-width: 976px;
}

/* Layout A: 4 imgs — 2 smalls top-left, medium bottom-left (spans cols 1-2), large right (spans rows 1-2) */
.image-group.layout-A {
  grid-template-columns: 175fr 175fr 626fr;
  grid-template-rows: auto auto;
  /* heights are derived from images' aspect ratios via object-fit:cover */
  min-height: 420px;
}
.image-group.layout-A > .grid-img-1 { grid-column: 1; grid-row: 1; }
.image-group.layout-A > .grid-img-2 { grid-column: 2; grid-row: 1; }
.image-group.layout-A > .grid-img-3 { grid-column: 1 / 3; grid-row: 2; }
.image-group.layout-A > .grid-img-4 { grid-column: 3; grid-row: 1 / 3; }

/* Layout B: 5 imgs — 2 stacked large left, then top-right (small+medium), then wide-right-bottom */
.image-group.layout-B {
  grid-template-columns: 451fr 158fr 356fr;
  grid-template-rows: auto auto;
  min-height: 605px;
}
.image-group.layout-B > .grid-img-1 { grid-column: 1; grid-row: 1; }
.image-group.layout-B > .grid-img-2 { grid-column: 1; grid-row: 2; }
.image-group.layout-B > .grid-img-3 { grid-column: 2; grid-row: 1; }
.image-group.layout-B > .grid-img-4 { grid-column: 3; grid-row: 1; }
.image-group.layout-B > .grid-img-5 { grid-column: 2 / 4; grid-row: 2; }

/* Layout C: 5 imgs — 2 smalls top, 1 wide left bottom (cols 1-2), 2 stacked on right */
.image-group.layout-C {
  grid-template-columns: 285fr 264fr 420fr;
  grid-template-rows: auto auto;
  min-height: 565px;
}
.image-group.layout-C > .grid-img-1 { grid-column: 1; grid-row: 1; }
.image-group.layout-C > .grid-img-2 { grid-column: 2; grid-row: 1; }
.image-group.layout-C > .grid-img-3 { grid-column: 1 / 3; grid-row: 2; }
.image-group.layout-C > .grid-img-4 { grid-column: 3; grid-row: 1; }
.image-group.layout-C > .grid-img-5 { grid-column: 3; grid-row: 2; }

.grid-img {
  overflow: hidden;
  cursor: zoom-in;
  position: relative !important;
  width: auto !important;
  height: auto !important;
  top: auto !important;
  left: auto !important;
}

.grid-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.25s ease, filter 0.25s ease;
}
```

Remove the now-obsolete `.image-group:has(...)` fallback rules.

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:1313/danni-web/` in Playwright. Run:
```js
() => {
  const groups = document.querySelectorAll('.image-group');
  return Array.from(groups).map((g,i) => ({
    i,
    layout: g.className.match(/layout-(\w)/)[1],
    rect: (() => { const r = g.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
    children: Array.from(g.children).map(c => { const r = c.getBoundingClientRect(); return { cls: c.className, w: Math.round(r.width), h: Math.round(r.height) }; })
  }));
}
```
Expected: 6 groups in order A,A,A,B,C,A. Group widths ≈ 976px. Compare each child's `w` against the Wix reference table (Section above).

- [ ] **Step 3: Side-by-side screenshot comparison**

Take `local-home-full-loaded.png` (after triggering lazy-load) and compare to `wix-home-full.png` already in repo root. Eyeball alignment of groups 1-6.

- [ ] **Step 4: Commit**

```bash
git add assets/css/custom.css
git commit -m "Homepage CSS: 3 layout variants (A/B/C) matching Wix groupings"
```

### Task 1.4: Fix hover effect (darken → lighten)

**Files:**
- Modify: `assets/css/custom.css` — replace existing `.grid-img:hover img` rule.

- [ ] **Step 1: Replace hover effect rule**

Find:
```css
.grid-img:hover img {
  filter: brightness(0.7);
}
```

Replace with:
```css
.grid-img:hover img,
.simple-grid-item:hover img,
.carousel-item:hover img {
  opacity: 0.55;
}
```

- [ ] **Step 2: Verify in browser**

Hover over a homepage image; image should fade lighter, not darken.

- [ ] **Step 3: Commit**

```bash
git add assets/css/custom.css
git commit -m "Hover effect: lighten (opacity) instead of darken (brightness)"
```

---

## PHASE 2 — Past-work pages: justified row layout

Wix uses justified-row layout where each row has a common height and variable widths derived from image aspect ratios. We'll re-enable Hugo gallery theme's built-in justified-layout, with a `layout: justified` opt-in per page.

### Task 2.1: Rewrite `gallery-simple.html` to support 3 layout modes

**Files:**
- Rewrite: `layouts/partials/gallery-simple.html` (entire file)

- [ ] **Step 1: Replace partial** with one supporting `layout` ∈ {`justified`, `square`, `carousel`}.

```html
{{ $columns := default 3 .Params.columns }}
{{ $layout := default "justified" .Params.layout }}
{{ $rowHeight := default 220 .Params.rowHeight }}

<section class="gallery sub-gallery">
  <div id="gallery" class="
    {{- if eq $layout "carousel" }}carousel-wrap
    {{- else if eq $layout "square" }}square-grid cols-{{ $columns }}
    {{- else if eq $layout "portrait-cover" }}portrait-grid cols-{{ $columns }}
    {{- else }}justified-grid
    {{- end -}}
  ">

    {{ $images := slice }}
    {{ range $image := where (.Resources.ByType "image") "Params.hidden" "ne" true }}
      {{ $title := "" }}
      {{ if ne $image.Title $image.Name }}{{ $title = $image.Title }}{{ end }}
      {{ $images = $images | append (dict "Name" $image.Name "Title" $title "image" $image "Params" $image.Params) }}
    {{ end }}
    {{ $publishResources := default true .Params.build.publishResources }}
    {{ $sortedImages := sort $images (.Params.sort_by | default "Name") (.Params.sort_order | default "asc") }}

    {{ if eq $layout "carousel" }}
      <button class="carousel-arrow carousel-prev" aria-label="Previous">&lsaquo;</button>
      <div class="carousel-track">
    {{ end }}

    {{ range $i, $item := $sortedImages }}
      {{ $image := .image }}
      {{ $thumb := $image.Filter (slice images.AutoOrient (images.Process "fit 2000x2000")) }}
      {{ $full  := $image.Filter (slice images.AutoOrient (images.Process "fit 2000x2000")) }}
      {{ $aspect := div (mul $thumb.Width 1.0) $thumb.Height }}

      <a class="gallery-item
          {{- if eq $layout "carousel" }} carousel-item
          {{- else if eq $layout "square" }} square-item
          {{- else if eq $layout "portrait-cover" }} portrait-item
          {{- else }} justified-item
          {{- end -}}"
         {{ if eq $layout "justified" }}style="flex-grow: {{ printf "%.3f" $aspect }}; flex-basis: {{ printf "%.0f" (mul $aspect $rowHeight) }}px;"{{ end }}
         href="{{ if $publishResources }}{{ $image.RelPermalink }}{{ else }}{{ $full.RelPermalink }}{{ end }}"
         data-pswp-src="{{ $full.RelPermalink }}"
         data-pswp-width="{{ $full.Width }}"
         data-pswp-height="{{ $full.Height }}"
         data-pswp-target="{{ $image.Name | urlize }}"
         title="{{ .Title }}"
         itemscope itemtype="https://schema.org/ImageObject">
        <img class="lazyload"
             {{ if eq $layout "justified" }}style="height: {{ $rowHeight }}px;"{{ end }}
             width="{{ $thumb.Width }}"
             height="{{ $thumb.Height }}"
             data-src="{{ $thumb.RelPermalink }}"
             alt="{{ .Title }}" />
        <meta itemprop="contentUrl" content="{{ if $publishResources }}{{ $image.RelPermalink }}{{ else }}{{ $full.RelPermalink }}{{ end }}" />
      </a>
    {{ end }}

    {{ if eq $layout "carousel" }}
      </div>
      <button class="carousel-arrow carousel-next" aria-label="Next">&rsaquo;</button>
    {{ end }}

  </div>
</section>
```

- [ ] **Step 2: Update per-page front-matter**

Edit each sub-page index file to specify the right layout:
- `content/paper-jewelry/index.md`: `params: { layout: "square", columns: 3 }`
- `content/gem-series/index.md`: `params: { layout: "justified", rowHeight: 220 }`
- `content/lillstreet/index.md`: `params: { layout: "justified", rowHeight: 210 }`
- `content/undergrad/index.md`: `params: { layout: "portrait-cover", columns: 4 }`
- `content/undergrad-thesis/index.md`: `params: { layout: "carousel" }`
- `content/production-line/index.md`: `params: { layout: "justified", rowHeight: 220 }`

For each file:
1. Read current contents (likely already has params like `columns` and `square`).
2. Replace front matter `params` block with the values above.

Example for `content/paper-jewelry/index.md`:
```markdown
---
title: "Paper Jewelry Series"
params:
  layout: "square"
  columns: 3
---
```

- [ ] **Step 3: Commit**

```bash
git add layouts/partials/gallery-simple.html content/paper-jewelry/index.md content/gem-series/index.md content/lillstreet/index.md content/undergrad/index.md content/undergrad-thesis/index.md content/production-line/index.md
git commit -m "Sub-gallery: justified/square/portrait-cover/carousel modes per page"
```

### Task 2.2: Add CSS for justified, square, portrait-cover layouts

**Files:**
- Modify: `assets/css/custom.css` — REPLACE the existing "PAST WORK: Simple centered grid" section.

- [ ] **Step 1: Replace past-work CSS**

```css
/* ======================================
   SUB-PAGE: justified, square, portrait-cover
   ====================================== */
.sub-gallery {
  padding-left: 230px;
  padding-right: 230px;
  padding-top: 80px;
}

/* Justified row layout (Wix Pro Gallery default) */
.justified-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 976px;
  margin: 0;
}
.justified-item {
  flex-grow: 1;
  flex-basis: auto;
  min-width: 100px;
  overflow: hidden;
  cursor: zoom-in;
}
.justified-item img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

/* Square grid (Paper Jewelry) */
.square-grid {
  display: grid;
  gap: 8px;
  max-width: 700px;
  margin: 0;
}
.square-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
.square-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
.square-item { aspect-ratio: 1; overflow: hidden; cursor: zoom-in; }
.square-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Portrait grid with contain fit (Undergrad) */
.portrait-grid {
  display: grid;
  gap: 8px;
  max-width: 700px;
  margin: 0;
}
.portrait-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
.portrait-item { aspect-ratio: 131 / 208; overflow: hidden; cursor: zoom-in; background: #fff; }
.portrait-item img { width: 100%; height: 100%; object-fit: contain; display: block; }
```

Remove the now-obsolete `.simple-grid*` rules.

- [ ] **Step 2: Verify in browser**

Visit each page and confirm:
- `/paper-jewelry/`: square 3×2 (matches Wix)
- `/gem-series/`: row of variable-width images, common height
- `/lillstreet/`: variable rows of common height
- `/undergrad/`: 4×3 portrait cells, white backgrounds visible
- `/undergrad-thesis/`: carousel still works
- `/production-line/`: justified row(s)

- [ ] **Step 3: Commit**

```bash
git add assets/css/custom.css
git commit -m "Sub-gallery CSS: justified/square/portrait-cover layouts matching Wix"
```

### Task 2.3: Carousel polish — thin arrows + partial-next-image bleed

**Files:**
- Modify: `assets/css/custom.css` — find `.carousel-arrow { ... font-size: 3rem; color: #bbb; ... }` and the `.carousel-track { overflow-x: hidden; ... }`.

- [ ] **Step 1: Update carousel styles**

```css
.carousel-wrap {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
  padding: 1rem 40px;
}
.carousel-track {
  display: flex;
  gap: 16px;
  overflow-x: hidden;
  scroll-behavior: smooth;
  flex: 1;
}
.carousel-item {
  flex: 0 0 calc((100% - 32px) / 3);
  cursor: zoom-in;
  position: relative !important;
}
.carousel-item img { width: 100%; height: auto; display: block; }
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 1.5rem;
  font-weight: 300;
  color: #888;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  z-index: 10;
  user-select: none;
}
.carousel-arrow:hover { color: #333; }
.carousel-prev { left: 0; }
.carousel-next { right: 0; }
```

- [ ] **Step 2: Verify**

Visit `/undergrad-thesis/` — arrows should be thin `< >`, smaller than current.

- [ ] **Step 3: Commit**

```bash
git add assets/css/custom.css
git commit -m "Carousel: thinner arrows matching Wix"
```

---

## PHASE 3 — Lightbox: white background + side caption

PhotoSwipe's default theme is dark. Wix uses a white-bg lightbox with caption on the right. We'll override PhotoSwipe via CSS + a small adapter for caption-on-right.

### Task 3.1: Inspect PhotoSwipe initialization

**Files:**
- Read: `themes/gallery/assets/js/photoswipe.js` or wherever it's initialised.

- [ ] **Step 1: Locate the PhotoSwipe init code in the theme**

```bash
grep -rn "PhotoSwipe\|pswp" themes/gallery/ | head -20
```

- [ ] **Step 2: Identify the partial that pulls in PhotoSwipe assets**

```bash
grep -rn "photoswipe\|pswp" themes/gallery/layouts/ assets/ | head -20
```

Note which CSS classes are used for `.pswp__bg`, `.pswp__caption`, etc.

### Task 3.2: Override PhotoSwipe theme via CSS

**Files:**
- Modify: `assets/css/custom.css` — append a new section.

- [ ] **Step 1: Append lightbox overrides** to the end of `custom.css`:

```css
/* ======================================
   LIGHTBOX: white background, side caption (Wix-style)
   ====================================== */
.pswp__bg { background: #fff !important; opacity: 1 !important; }
.pswp__top-bar { background: transparent !important; }
.pswp__button { color: #333 !important; filter: none !important; }
.pswp__button--close::before,
.pswp__button--arrow--left::before,
.pswp__button--arrow--right::before { color: #333; }
.pswp__counter { color: #888; font-family: "Raleway", sans-serif; font-size: 0.8rem; }

/* Shrink image area to leave room for caption */
.pswp__container { padding-right: 28%; }
.pswp__img { background: #fff; }

/* Caption on right side */
.pswp__dynamic-caption.pswp__dynamic-caption--aside {
  display: block !important;
  position: absolute;
  top: 60px;
  right: 60px;
  width: calc(28% - 100px);
  background: transparent;
  color: #333;
  font-family: "Raleway", sans-serif;
  font-size: 0.85rem;
  line-height: 1.7;
}
.pswp__dynamic-caption strong {
  display: block;
  font-size: 1.4rem;
  font-weight: 400;
  font-family: "Raleway", sans-serif;
  color: #222;
  margin-bottom: 1rem;
}

/* Arrows: thin, mid-height, not edge-flush */
.pswp__button--arrow {
  background: transparent !important;
  width: 60px; height: 60px;
}
.pswp__button--arrow svg { fill: #888; }

/* Hide native PhotoSwipe loading indicator (Wix doesn't have one) */
.pswp__preloader { display: none; }
```

- [ ] **Step 2: Verify**

Click an image on the homepage. Lightbox should be white-bg, caption on right.

- [ ] **Step 3: If caption isn't appearing on right**

Check if the dynamic-caption plugin is loaded. If not, append to `gallery-simple.html` and `gallery.html` a small inline init script, or modify the theme's PhotoSwipe init to register the dynamic-caption plugin. Search:
```bash
grep -rn "dynamic-caption\|dynamicCaption" themes/gallery/ assets/
```

If the plugin isn't present, we need to either:
1. Add a `<script src="https://cdn.jsdelivr.net/npm/photoswipe-dynamic-caption-plugin@1/photoswipe-dynamic-caption-plugin.umd.min.js" defer></script>` and a custom init.
2. OR use a simple CSS-only caption that reads from `data-pswp-caption`.

Document the chosen approach in the commit message.

- [ ] **Step 4: Commit**

```bash
git add assets/css/custom.css
git commit -m "Lightbox: white background + side caption (Wix-style)"
```

### Task 3.3: (If needed) Add dynamic-caption plugin

**Files:**
- Modify: `layouts/partials/head-custom.html` — add CDN link
- Create: `assets/js/lightbox-init.js`

- [ ] **Step 1: Add plugin CSS link**

Append to `head-custom.html`:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photoswipe-dynamic-caption-plugin@1/photoswipe-dynamic-caption-plugin.css">
```

- [ ] **Step 2: Create init script**

Write `assets/js/lightbox-init.js`:
```js
import PhotoSwipeLightbox from 'https://cdn.jsdelivr.net/npm/photoswipe@5/dist/photoswipe-lightbox.esm.js';
import PhotoSwipeDynamicCaption from 'https://cdn.jsdelivr.net/npm/photoswipe-dynamic-caption-plugin@1/photoswipe-dynamic-caption-plugin.esm.js';

const lightbox = new PhotoSwipeLightbox({
  gallery: '#gallery',
  children: 'a.gallery-item',
  pswpModule: () => import('https://cdn.jsdelivr.net/npm/photoswipe@5/dist/photoswipe.esm.js')
});
new PhotoSwipeDynamicCaption(lightbox, {
  type: 'aside',
  captionContent: (slide) => {
    const span = slide.data.element.querySelector('.pswp-caption-content');
    return span ? span.innerHTML : '';
  }
});
lightbox.init();
```

- [ ] **Step 3: Disable theme's PhotoSwipe init**

Find theme's PhotoSwipe init partial and override it with a no-op:
```bash
# Identify the file
grep -rn "PhotoSwipeLightbox\|pswpModule" themes/gallery/
```
Then create `layouts/partials/<that-file>.html` (override path) with empty contents.

- [ ] **Step 4: Reference our init script** in a layout that's always loaded — add to `head-custom.html`:
```html
<script type="module" src="{{ "js/lightbox-init.js" | relURL }}"></script>
```

- [ ] **Step 5: Verify**

Click an image on the homepage; lightbox should open with the caption pulled from `.pswp-caption-content` and rendered on the right.

- [ ] **Step 6: Commit**

```bash
git add layouts/partials/head-custom.html assets/js/lightbox-init.js layouts/partials/photoswipe.html
git commit -m "Lightbox: PhotoSwipe dynamic-caption plugin (caption on right)"
```

---

## PHASE 4 — Navigation cleanup

### Task 4.1: Remove first-child blue + use proper active state

**Files:**
- Modify: `assets/css/custom.css` — remove `:first-child` rule
- Modify: `layouts/partials/header.html` — use `IsMenuCurrent` correctly

- [ ] **Step 1: Remove the bad CSS rule**

Find and delete:
```css
.nav-menu > li:first-child .nav-link {
  color: #4a90d9;
}
```

- [ ] **Step 2: Rewrite the menu loop** in `header.html` so the parent dropdown also gets `.active` when any child is current. Replace the existing `{{ range site.Menus.main }}` block with:

```html
{{ range site.Menus.main }}
  {{ $isActive := $.IsMenuCurrent .Menu . }}
  {{ if .HasChildren }}
    {{/* Parent active if any child is current */}}
    {{ range .Children }}
      {{ if $.IsMenuCurrent .Menu . }}{{ $isActive = true }}{{ end }}
    {{ end }}
    <li class="has-dropdown">
      <a href="{{ .URL }}" class="nav-link dropdown-toggle{{ if $isActive }} active{{ end }}">{{ .Name }}</a>
      <ul class="dropdown-menu">
        {{ range .Children }}
          <li>
            <a href="{{ .URL }}" class="nav-link{{ if $.IsMenuCurrent .Menu . }} active{{ end }}">{{ .Name }}</a>
          </li>
        {{ end }}
      </ul>
    </li>
  {{ else }}
    <li>
      <a href="{{ .URL }}" class="nav-link{{ if $isActive }} active{{ end }}">{{ .Name }}</a>
    </li>
  {{ end }}
{{ end }}
```

- [ ] **Step 3: Verify**

Visit each top-level page; the corresponding nav item (or its parent for past-work pages) should be blue.

- [ ] **Step 4: Commit**

```bash
git add assets/css/custom.css layouts/partials/header.html
git commit -m "Nav: drop first-child blue; mark parent active when child page is open"
```

### Task 4.2: Remove dropdown caret `▼`

**Files:**
- Modify: `assets/css/custom.css`

- [ ] **Step 1: Delete the `.dropdown-toggle::after` rule** (which renders the caret) so the trigger looks clean like Wix.

```css
/* delete:
.dropdown-toggle::after {
  content: "";
  display: inline-block;
  width: 0; height: 0;
  ...
}
*/
```

- [ ] **Step 2: Verify**

Visit any page; "Past Work" nav item should have no `▼`.

- [ ] **Step 3: Commit**

```bash
git add assets/css/custom.css
git commit -m "Nav: remove dropdown caret to match Wix"
```

### Task 4.3: Match social-icon style to Wix (filled solid)

**Files:**
- Modify: `layouts/partials/header.html` — replace the two SVGs.

- [ ] **Step 1: Swap SVGs** for solid-fill Facebook and Instagram glyphs:

```html
{{ with .facebook }}
  <a target="_blank" rel="noopener" title="Facebook" href="{{ . }}">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z"/>
    </svg>
  </a>
{{ end }}
{{ with .instagram }}
  <a target="_blank" rel="noopener" title="Instagram" href="{{ . }}">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41a3.7 3.7 0 0 1 1.38.9c.42.42.69.83.9 1.38.15.42.36 1.06.4 2.23.06 1.27.08 1.65.08 4.85s-.02 3.58-.07 4.85c-.05 1.17-.25 1.81-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.83.69-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.81-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.18 15.58 2.16 15.2 2.16 12s.02-3.58.07-4.85c.05-1.17.25-1.81.41-2.23a3.7 3.7 0 0 1 .9-1.38c.42-.42.83-.69 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.18 8.8 2.16 12 2.16Zm0 1.94c-3.14 0-3.51.01-4.74.07-1 .05-1.55.21-1.91.35-.48.19-.83.42-1.19.78-.36.36-.59.71-.78 1.2-.14.35-.3.9-.35 1.9-.06 1.23-.07 1.6-.07 4.73s.01 3.51.07 4.74c.05 1 .21 1.55.35 1.9.19.49.42.84.78 1.2.36.36.71.59 1.2.78.35.14.9.3 1.9.35 1.23.06 1.6.07 4.74.07s3.51-.01 4.74-.07c1-.05 1.55-.21 1.9-.35.49-.19.84-.42 1.2-.78.36-.36.59-.71.78-1.2.14-.35.3-.9.35-1.9.06-1.23.07-1.6.07-4.74s-.01-3.5-.07-4.73c-.05-1-.21-1.55-.35-1.9-.19-.49-.42-.84-.78-1.2-.36-.36-.71-.59-1.2-.78-.35-.14-.9-.3-1.9-.35-1.23-.06-1.6-.07-4.74-.07Zm0 3.3a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 1.94a2.66 2.66 0 1 0 0 5.32 2.66 2.66 0 0 0 0-5.32Zm5.85-2.16a1.08 1.08 0 1 1 0 2.16 1.08 1.08 0 0 1 0-2.16Z"/>
    </svg>
  </a>
{{ end }}
```

- [ ] **Step 2: Commit**

```bash
git add layouts/partials/header.html
git commit -m "Nav: solid-fill social icons matching Wix"
```

---

## PHASE 5 — Bio + Contact background fix and styling

### Task 5.1: Fix bio-bg URL using Hugo's relURL

**Files:**
- Modify: `assets/css/custom.css` — the `.prose:has(.bio-box)` selector references `url('/images/bio-bg.jpg')` which is missing the `baseURL` prefix.

The cleanest fix: stop using a CSS background entirely. Instead, move the image to an `<img>` tag in the markup. But that requires changing how `prose` layouts work. An easier alternative: pass the URL through Hugo's templating by moving the rule out of static `custom.css` and into an inline `<style>` in `head-custom.html` (templated).

- [ ] **Step 1: Remove the `background: url(...)` from `custom.css`** for `.prose:has(.bio-box), .prose:has(.contact-centered)`. Replace with just structural rules (no background):

```css
.prose:has(.bio-box),
.prose:has(.contact-centered) {
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  margin-left: 0;
  max-width: 100%;
  padding: 80px 160px 80px 160px;
  min-height: 600px;
  display: flex;
  align-items: center;
}
```

- [ ] **Step 2: Add the URL in a templated `<style>` in `head-custom.html`**:

```html
<style>
  .prose:has(.bio-box),
  .prose:has(.contact-centered) {
    background-image: url('{{ "images/bio-bg.jpg" | relURL }}');
  }
</style>
```

- [ ] **Step 3: Verify**

Visit `http://localhost:1313/danni-web/bio/` and `…/contact/`. Background image should now display (jewelry tiling).

```js
() => window.getComputedStyle(document.querySelector('.prose')).backgroundImage
```
Expected: contains `/danni-web/images/bio-bg.jpg`.

- [ ] **Step 4: Commit**

```bash
git add assets/css/custom.css layouts/partials/head-custom.html
git commit -m "Bio/Contact: fix background-image URL via relURL (was missing baseURL)"
```

### Task 5.2: Move contact text to the top of the page

**Files:**
- Modify: `content/contact.md` — keep content as-is, only structural class change.
- Modify: `assets/css/custom.css` — adjust `.contact-centered` vertical alignment.

- [ ] **Step 1: Change `.prose:has(.contact-centered)` from `align-items: center` to `align-items: flex-start`** so contact info sits at the top, not vertically centered.

```css
.prose:has(.contact-centered) {
  justify-content: center;
  align-items: flex-start;
  padding-top: 120px;
}
```

- [ ] **Step 2: Update `.contact-centered` link color** to use red (matches Wix link color):

```css
.contact-centered { color: #333; }
.contact-centered a { color: #c02b1c; text-decoration: underline; }
.contact-centered strong { font-weight: 400; color: #c02b1c; }
```

- [ ] **Step 3: Commit**

```bash
git add assets/css/custom.css
git commit -m "Contact: align top + red link color matching Wix"
```

### Task 5.3: Bio box style polish (border tone, transparency)

**Files:**
- Modify: `assets/css/custom.css` — `.bio-box` rule.

- [ ] **Step 1: Tighten bio box** to a thinner border, white opaque bg (Wix uses fully opaque), narrower width:

```css
.bio-box {
  border: 1px solid #888;
  padding: 2.5rem 3rem;
  font-family: "Raleway", sans-serif;
  font-size: 0.95rem;
  font-weight: 400;
  line-height: 1.75;
  color: #444;
  max-width: 520px;
  margin: 0 0 0 auto;
  background: #fff;
}
```

- [ ] **Step 2: Verify** — visit `/bio/`, compare to `wix-bio-full.png`.

- [ ] **Step 3: Commit**

```bash
git add assets/css/custom.css
git commit -m "Bio: tighten box border + opaque bg to match Wix"
```

---

## PHASE 6 — CV content expansion

The Wix CV is much longer than ours. We need to update content.

### Task 6.1: Extract the full CV from Wix

- [ ] **Step 1: Re-visit `https://www.dannixu.com/cv` in Playwright** and dump the entire main text via:

```js
() => document.querySelector('main').innerText
```

Save to a working file like `wix-cv-raw.txt` (gitignored).

- [ ] **Step 2: Reformat into structured markdown** for `cv.md`. Match the Wix structure: Education / Solo or Two-Person Exhibitions / Selected Group Exhibitions / Professional Experience / Awards & Scholarships / Press / Talks & Workshops. Use Wix's "year + tab + entry" pattern; in markdown use a definition-list or a simple `**year** entry` line.

- [ ] **Step 3: Commit**

```bash
git add content/cv.md
git commit -m "CV: pull full content from Wix to match production"
```

### Task 6.2: CV typography tuned to Wix

**Files:**
- Modify: `assets/css/custom.css` — `.prose` block specifically for CV layout.

- [ ] **Step 1: Add CV-specific tweaks**:

```css
.prose {
  max-width: 700px;
  margin-left: 230px;
  padding-top: 80px;
  font-family: "Raleway", sans-serif;
  font-size: 0.85rem;
  line-height: 1.85;
  color: #5e5d5d;
}
.prose h3 {
  font-family: "Raleway", sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 2rem;
  border-bottom: none;
  padding-bottom: 0;
  color: #333;
}
.prose strong { color: #333; font-weight: 600; }
.prose em { font-style: italic; }
```

- [ ] **Step 2: Commit**

```bash
git add assets/css/custom.css
git commit -m "CV typography matching Wix (Raleway 0.85rem, no h3 underline)"
```

---

## PHASE 7 — Misc cleanups

### Task 7.1: Empty footer

**Files:**
- Create: `layouts/partials/footer.html` (override)

- [ ] **Step 1: Locate the theme's footer**

```bash
grep -rln "footer" themes/gallery/layouts/partials/ | head -5
```

- [ ] **Step 2: Override** by creating `layouts/partials/footer.html` containing just an empty `<footer></footer>` (or a copyright in mid-grey if we want minimal Wix-style).

```html
<footer class="site-footer"></footer>
```

- [ ] **Step 3: Hide footer text via CSS too** (safety):

```css
body > footer .site-footer__copyright,
.site-footer .copyright,
.site-footer__author { display: none; }
```

- [ ] **Step 4: Commit**

```bash
git add layouts/partials/footer.html assets/css/custom.css
git commit -m "Footer: empty (matches Wix)"
```

### Task 7.2: Page-title hidden on sub-pages

**Files:**
- Modify: `layouts/_default/single.html` — drop `title.html` partial since Wix doesn't show page titles on past-work pages.

- [ ] **Step 1: Replace `single.html`** with:

```go-html-template
{{ define "main" }}
  {{ partial "gallery-simple.html" . }}
  {{ partial "related.html" . }}
  {{ with .Content }}
    <section class="prose">
      {{ . }}
    </section>
  {{ end }}
{{ end }}
```

- [ ] **Step 2: Verify**

Sub-pages no longer show "Paper Jewelry Series" title above the gallery (Wix doesn't either).

- [ ] **Step 3: Commit**

```bash
git add layouts/_default/single.html
git commit -m "Sub-pages: drop title partial (Wix doesn't show titles)"
```

---

## PHASE 8 — Final verification + deploy

### Task 8.1: Side-by-side visual diff for each page

- [ ] **Step 1: Resize Playwright to 1440×900**

```js
await page.setViewportSize({ width: 1440, height: 900 });
```

- [ ] **Step 2: For each route, capture local + Wix screenshots and compare**

Routes:
- `/` ↔ `https://www.dannixu.com/`
- `/paper-jewelry/` ↔ `/paper-jewelry-series`
- `/gem-series/` ↔ `/gem-series`
- `/lillstreet/` ↔ `/current-work`
- `/undergrad/` ↔ `/undergrad`
- `/undergrad-thesis/` ↔ `/undergrad-thesis`
- `/production-line/` ↔ `/production-line`
- `/cv/` ↔ `/cv`
- `/bio/` ↔ `/blank-mpvle`
- `/contact/` ↔ `/blank-pvj6y`

For each: `fullPage: true`, save as `compare-<page>-local.png` and `compare-<page>-wix.png`, visually diff.

- [ ] **Step 3: Capture and compare lightbox**

- Open lightbox on homepage image 4 on local
- Open lightbox on Wix homepage image 4
- Screenshot both
- Compare bg color, caption position, arrow style

- [ ] **Step 4: Capture and compare hover state**

- Hover an image on local + Wix
- Screenshot both
- Confirm both lighten on hover

- [ ] **Step 5: Capture and compare dropdown**

- Hover "Past Work" on local + Wix
- Screenshot both
- Confirm both show clean dropdown with no `▼`

- [ ] **Step 6: Document any remaining gaps** in a checklist comment on the final commit.

### Task 8.2: Mobile verification @ 600px

- [ ] **Step 1: Resize to 600×900** and walk through every page. Confirm responsive CSS still works (homepage groups collapse, sub-galleries become 2-column, nav becomes hamburger).

- [ ] **Step 2: Adjust CSS as needed** in the existing `@media (max-width: 900px)` / `@media (max-width: 640px)` blocks.

- [ ] **Step 3: Commit any fixes**

```bash
git add assets/css/custom.css
git commit -m "Mobile: polish for new layouts"
```

### Task 8.3: Deploy

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

GitHub Actions auto-deploys to `https://yuluobin.github.io/danni-web/`.

- [ ] **Step 2: Wait ~2 minutes**, then verify deployment matches local by visiting the live URL.

- [ ] **Step 3: Note remaining TODOs** (DNS migration, image originals from Danni, image titles/descriptions) in CLAUDE.md if any new items came up.

---

## Self-Review

After writing this plan, re-checking spec coverage:

| Spec item from user | Phase addressed |
|---------------------|----------------|
| Image layouts on homepage differ | Phase 1 (groups + per-layout CSS) |
| Image layouts on sub-pages differ | Phase 2 (justified rows) |
| Pop-up screen (lightbox) is different | Phase 3 (white bg + side caption) |
| "Many small interaction differences" | Phase 4 (nav active state, dropdown caret, social icons) + Phase 5 (bio bg) + Phase 7 (footer) |

No placeholders. Types are consistent (`.image-group.layout-A` referenced consistently across template + CSS). File paths are all absolute or repo-relative. Each task has concrete code and verification steps.

---
