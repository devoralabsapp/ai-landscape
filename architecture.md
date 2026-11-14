# AI Atlas architecture

AI Atlas is a static bilingual directory. Plain HTML, CSS and browser JavaScript render the catalog. Node.js 22 or later runs the build and local server. The site has no runtime package dependencies, backend, database or API credentials.

## Source files and generated outputs

`dist/` contains both editable source files and generated files. Keep it in Git.

| Area | Editable source and responsibility |
| --- | --- |
| Catalog | [dist/data.js](dist/data.js) defines categories, layers and pipe-delimited entries. The entry name is normalized to produce its ID. That ID joins profiles, logos and tags, and appears in deep links and saved data. |
| Models and plans | [dist/product-data.js](dist/product-data.js) maps entry IDs to model groups, plans, sources, availability notes and product modes. Model tiers are ordered within a family. They express vendor positioning. |
| Work fields | [dist/security-data.js](dist/security-data.js) defines field labels and search aliases in `WORK_FIELDS`, and entry-specific tags, roles and notes in `SECURITY_PROFILES`. Cybersecurity is the umbrella field. Pentest, AppSec, SOC and OSINT are specific fields. |
| Publisher logos | [dist/logo-sources.json](dist/logo-sources.json) maps every entry ID to a local asset, official source URL, scope, type, byte count and SHA-256. Files live in [dist/assets/logos/](dist/assets/logos/README.md). |
| Localization | [dist/translations.en.json](dist/translations.en.json) holds explicit Vietnamese-to-English strings. [dist/i18n.js](dist/i18n.js) exposes `englishText()`, `tr()` and `localizeDOM()`. The build uses the same translation logic through [scripts/locales.mjs](scripts/locales.mjs). |
| UI and state | [dist/index.html](dist/index.html) defines the initial markup and ordered browser scripts. [dist/app.js](dist/app.js) reads URL filters, indexes search, renders map/list/results, handles dialogs and exports filtered CSV. |
| Themes and motion | [dist/preferences.js](dist/preferences.js), [dist/styles.css](dist/styles.css) and [dist/themes.css](dist/themes.css) handle early preferences, responsive layout and theme overrides. [dist/motion.js](dist/motion.js), [dist/motion.css](dist/motion.css) and [dist/ai-illustration.css](dist/ai-illustration.css) handle animations and the hero. [dist/logos.css](dist/logos.css) controls logo framing and fit. |

[scripts/catalog.mjs](scripts/catalog.mjs) evaluates the trusted repo data files in a Node VM, joins product profiles and security tags, and adds each logo record. [scripts/build.mjs](scripts/build.mjs) runs checks and generates:

- `dist/logos.js` and `dist/translations.en.js` for the browser.
- `dist/catalog.csv`, `dist/catalog.json`, `dist/catalog.en.csv` and `dist/catalog.en.json` for full snapshot downloads.
- `AI-Landscape.vi.md` for the Vietnamese catalog in Markdown.

Edit the relevant sources and run `npm run build` to update these files. Static CSV columns are defined in `scripts/build.mjs`. The filter-aware CSV button builds its file in `downloadCSV()` in `dist/app.js`. When changing export fields, inspect both paths.

## Browser behavior

- The early preference script reads URL, then browser storage, then defaults. The default site language is `vi` and the default theme is `atlas`. `README.md` is English independently of the site preference.
- `app.js` reads and writes `q`, `category`, `layer`, `surface`, `source`, `field`, `status`, `view`, `saved` and `tool` in the URL, alongside `lang` and `theme`. `filtered()` intersects active filters. Search uses normalized Vietnamese and English text, plus model names, plan names and work-field keywords. SOC, OSINT and AppSec match as whole terms.
- Saved tools, comparison IDs, language, theme and reduced-motion preference are stored per origin in `localStorage`. A shared URL can restore filters, theme, language and the open tool. Saved and comparison records belong to the browser that created them.
- Dialogs use native `<dialog>` and tabs for Models, Plans and Overview. Open by `?tool=<id>`. Overview includes source attribution and a security use case when the entry has a profile.
- `AtlasMotion` keeps finite interface animations and looping hero animations in separate registries. Result transitions reuse card identity via `data-entry`. Hero loops pause outside the viewport and when the tab is hidden. The OS reduced-motion setting and the site toggle can disable motion.

## Serving and validation

`npm run dev` serves `dist/` directly on `127.0.0.1:4173`. Set `PORT` to use a different port. The server serves local files on reload. It does not simulate Vercel host redirects.

`npm run check` validates catalog and profile relationships, translations, source URL shape, logo files and checksums, theme preferences, animation lifecycle and JavaScript syntax. Browser review covers interactions and layout. Publisher fact checks require reading the relevant sources.

[vercel.json](vercel.json) builds with `npm run build` and publishes `dist` as a static site. The production hostname is `ai.devoralabs.tech`. The repo defines 308 rules scoped to the old Vercel hostname. See [handoff.md](handoff.md#known-deployment-issue) for the observed routing state.
