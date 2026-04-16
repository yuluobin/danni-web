# Danni Xu Studio - Static Website

Portfolio website for jewelry designer Danni Xu, migrated from Wix to Hugo + GitHub Pages.

## Stack

- **Hugo** v0.160+ (extended) with `hugo-theme-gallery` (git submodule at `themes/gallery/`)
- Deployed to GitHub Pages (free, replaces $280/yr Wix)
- Fonts: Overlock (title), Montserrat (tagline), Raleway (nav/body) via Google Fonts

## Project Structure

```
content/
├── _index.md                # Homepage (Security Blanket) - 4-image grid groups
├── *.jpg                    # Security Blanket images (in content root)
├── paper-jewelry/           # 3-col square grid
├── gem-series/              # 3-col natural grid
├── lillstreet/              # 3-col natural grid
├── undergrad/               # 4-col square grid
├── undergrad-thesis/        # Horizontal carousel
├── production-line/         # 3-col natural grid
├── cv.md                    # Prose page
├── bio.md                   # Prose page with bordered box
└── contact.md               # Prose page, centered

layouts/                     # Custom overrides
├── _default/
│   ├── home.html            # Homepage uses gallery.html (4-image groups)
│   └── single.html          # Sub-pages use gallery-simple.html
└── partials/
    ├── header.html          # Custom header (black box + nav bar)
    ├── head-custom.html     # Google Fonts
    ├── menu.html            # Empty (nav is in header.html)
    ├── gallery.html         # 4-image grid groups (homepage only)
    └── gallery-simple.html  # Configurable grid/carousel (past work pages)

assets/
├── css/custom.css           # All custom styles
└── js/
    ├── custom.js            # Mobile nav toggle + carousel scroll
    └── gallery.js           # Override: disables justified layout
```

## Per-Page Gallery Config (front matter)

```yaml
params:
  columns: 3        # Grid columns (default 3)
  square: true       # Force square aspect ratio
  layout: carousel   # "grid" (default) or "carousel"
```

## Development

```bash
hugo server --bind 0.0.0.0 -p 1313 --noHTTPCache --disableFastRender
```

**Important:** Hugo aggressively caches compiled CSS. If CSS changes don't appear, you must:
```bash
pkill -f "hugo server"; sleep 1; rm -rf resources public
```
Then restart the server.

## Build

```bash
hugo                  # Outputs to public/
```

## Key Design Details

- **Header**: Fixed black branding box (top-left) + fixed white nav bar (top-right, `left: 150px`)
- **Homepage gallery**: Images grouped in sets of 4 with specific grid layout (2 small + 1 medium + 1 large)
- **Past work pages**: Simple centered grids, configurable per page
- **Nav active color**: `#4a90d9` (blue)
- **Nav text color**: `#888` (gray)
- **Image processing**: `fit 2000x2000`, quality 92

## TODO

- [ ] Get exact font settings from Danni
- [ ] Replace Wix-compressed images with originals
- [ ] Set up GitHub Actions for auto-deploy
- [ ] Point dannixu.com DNS to GitHub Pages
