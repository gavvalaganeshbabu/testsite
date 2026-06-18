# AEM Page Migration Plan — Kotak Bank Home

## Goal
Perform a **full migration** of `https://www.kotak.bank.in/en/home.html` into this AEM Edge Delivery Services project — scrape, analyze structure and components, generate import infrastructure, import the content, and verify the rendered result against the original.

## Source
- **URL:** `https://www.kotak.bank.in/en/home.html`
- **Type:** Single-page, full migration (analysis → infrastructure → import → verification).

## Output to be produced
- Block parser(s) for each mapped block variant
- Page transformer(s) (cleanup, sections, media handling)
- A page template entry with block mappings (DOM selectors + variants)
- A bundled import script
- The imported content document in `content/` (script-generated, not hand-written)
- Any new/updated block variants and CSS needed to match the source design

## Migration workflow

### 1. Scrape & analyze
- Scrape the source URL (HTML, metadata, images, cleaned DOM).
- Analyze section structure, identify content sequences, detect needed blocks/components.
- Note: a bank home page typically includes a header/nav, hero/banner carousel, product/quick-link cards, promotional sections, and a rich footer — navigation and footer may need dedicated handling.

### 2. Block mapping
- Survey existing project blocks (hero, columns, cards, header, footer, fragment, widget) for reuse before creating new variants.
- Map each detected content sequence to an existing block or a new variant.
- Record DOM selectors and variants in the page template.

### 3. Import infrastructure
- Generate block parser(s) for each mapped variant.
- Generate page transformer(s) (cleanup, sections, media/Dynamic Media handling).
- Assemble the bundled import script.

### 4. Content import
- Run the bundled import script via the bulk importer against the source URL.
- Produce the imported content document in `content/`.

### 5. Navigation & footer (if present)
- Instrument the header/navigation and footer separately if the page has them (these use dedicated orchestration, not the standard block parser flow).

### 6. Verification
- Render the imported page in the local preview.
- Visually and structurally compare against the original; iterate on parser/transformer/CSS until it matches.

## Checklist
- [ ] Confirm project type and the block library endpoint to use
- [ ] Scrape `https://www.kotak.bank.in/en/home.html` (HTML, metadata, images, cleaned DOM)
- [ ] Analyze page structure, sections, and content sequences
- [ ] Inventory existing blocks and detect reusable variants
- [ ] Map content sequences to blocks; create new variants where needed
- [ ] Add block mappings (selectors/variants) to the page template
- [ ] Generate block parser(s) for each variant
- [ ] Generate page transformer(s) (cleanup, sections, media)
- [ ] Assemble and bundle the import script
- [ ] Run the bulk import to produce the content document in `content/`
- [ ] Migrate header/navigation and footer if present on the page
- [ ] Verify the rendered page in preview and compare against the original
- [ ] Iterate on parsers/transformers/styling until the result matches
- [ ] Report final status and any follow-ups

> Note: Running this plan (scraping, generating infrastructure, importing content) requires **Execute mode**. Switch to Execute mode to begin.
