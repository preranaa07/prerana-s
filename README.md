# Ecomexperts Hiring Test — Custom Sections (Vanilla JS, no jQuery)

This package contains **two brand‑new sections** built from scratch for Dawn (or any Online Store 2.0 theme):

1) `ecomx-banner.liquid` — the **Banner** with fully customizable text fields and subtle button animation.
2) `ecomx-product-grid.liquid` — the **Product Grid** (6 product blocks) with a **vanilla JS modal** that shows title, price, description, variant selectors, and a working **Add to Cart**.  
   It also implements the rule: *if a product with options `Black` and `Medium` is added, automatically add the selected “Soft Winter Jacket” product too.*

> No Dawn components are used. Everything is coded from scratch with vanilla JS + minimal CSS.

## Files

```
sections/ecomx-banner.liquid
sections/ecomx-product-grid.liquid
snippets/ecomx-modal.liquid
assets/ecomx-sections.css
assets/ecomx-banner.js
assets/ecomx-grid.js
templates/page.ecomexperts.json
README.md
```

## How to install

1. **Upload files** to your theme (Code editor → add files / create files) preserving the same paths.
2. Make sure the assets are referenced by the sections (already handled with `asset_url` + `script_tag`/`stylesheet_tag`).
3. **Create a new page** in Shopify admin named `Ecomexperts Test` and select the template: **`page.ecomexperts`**.
4. Open **Online Store → Customize**, switch to the `Ecomexperts Test` page, and configure:
   - Banner texts (headline, subheading, two CTAs) and background image.
   - In Product Grid, add up to **6 product blocks** (product picker).  
   - Choose the **“Soft Winter Jacket”** product in the section setting called **Bundled product**. The script will try to auto‑use the Black/Medium variant if present; otherwise it will use the first available variant.
5. **Publish** the theme or connect your GitHub repo and assign the branch to a theme.

## Notes

- The modal fetches product data from `/<handle>.js` and builds variant selectors.  
- All interactivity is plain JavaScript; no jQuery.
- CSS is kept minimal and responsive; tweak CSS variables in `assets/ecomx-sections.css` to match Figma exactly.
- Add-to-cart uses `/cart/add.js` (AJAX).

---

### Development tips
- If you need pixel-perfect tweaks: adjust spacings, font sizes, and the `@media` queries in `ecomx-sections.css`.
- The button animation is small but noticeable; tune `--btn-bounce-scale` and durations.

