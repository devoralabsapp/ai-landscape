# AI Atlas · AI Ecosystem Landscape

**English** · [Tiếng Việt](README.vi.md)

Explore 123 AI tools, agents, platforms, model families and protocols in 16 categories. AI Atlas is an interactive directory with practical notes, official logos and links to publisher sources. Inspired by the [CNCF Landscape](https://landscape.cncf.io/).

[Open AI Atlas at ai.devoralabs.tech](https://ai.devoralabs.tech/)

## Explore the atlas

- Browse the map or switch to a list with descriptions. Search by product, publisher, previous name, model, plan or task. Filter by category, interface, delivery model, local or self-hosted support and product status.
- Open any entry to see its **Models**, **Plans** and **Overview**. The overview includes practical notes, publisher links and the logo source.
- Compare up to three entries, save tools in your browser and share links to an entry or a filtered view.
- Switch between English and Vietnamese, choose from seven themes and adjust motion. The atlas supports keyboard navigation and respects your device's reduced motion setting.

The catalog has four layers:

| Layer | What you'll find |
| --- | --- |
| Use AI | General assistants, task agents, search, research, productivity and meeting notes |
| Build products | Coding agents, app builders, workflow automation and cybersecurity tools |
| Create content | Images, video, avatars, audio and music |
| Build AI systems | Frameworks, model runtimes, APIs, data, evaluation, protocols and browsers |

Use **Work field** to browse cybersecurity, pentest, AppSec, SOC or OSINT. Search also accepts those terms. Each tagged entry explains its role in the Overview tab. [Pentest view](https://ai.devoralabs.tech/?lang=en&field=pentest#explore)

Export the current results as CSV from the atlas, or download the full snapshot below.

| Language | Catalog |
| --- | --- |
| English | [CSV](dist/catalog.en.csv) · [JSON](dist/catalog.en.json) |
| Vietnamese | [CSV](dist/catalog.csv) · [JSON](dist/catalog.json) · [Editorial guide](AI-Landscape.vi.md) |

## Sources and editorial method

The catalog is a curated snapshot reviewed on **8 November 2026**. Each entry links to a publisher's site, documentation or official repository. The `checked` date records the source review. The **Best for** and **Editorial notes** fields reflect editorial judgment.

Models are grouped by family or provider and ordered by the publisher's positioning within each family. Plans distinguish subscriptions, usage-based APIs and self-hosted options where applicable. Refer to the linked publisher pages for current prices, limits, supported regions and model access. Lifecycle labels and aliases help readers find renamed, redirected and retired products.

The logo manifest records the source page, original asset URL, review date, identity scope and SHA-256 checksum. The overview distinguishes product marks from shared family and publisher marks. [Logo sources](dist/logo-sources.json)

## Run locally

Use Node.js 22 or later. The atlas runs as a static site without API keys or runtime dependencies.

```sh
npm run build
npm run dev
```

Open [localhost:4173](http://127.0.0.1:4173). Run `npm run check` to validate catalog data, translations, asset references and logo integrity.

## Update the catalog

| File | Purpose |
| --- | --- |
| [dist/data.js](dist/data.js) | Entries, categories, descriptions and editorial notes |
| [dist/product-data.js](dist/product-data.js) | Model groups, plans, provider relationships and sources |
| [dist/translations.en.json](dist/translations.en.json) | English translations |
| [dist/security-data.js](dist/security-data.js) | Cybersecurity work fields, search keywords and use cases |
| [dist/logo-sources.json](dist/logo-sources.json) | Logo provenance and integrity metadata |

When adding an entry, include its product profile, English translations and an image from an official source. Run `npm run build` to validate the changes and regenerate the downloads before committing. Open a GitHub issue or pull request to suggest a correction or addition.

The six additional themes come from the [Creative Theme System](https://github.com/devoralabsapp/creative-theme-system-skill). Interface and illustration animations follow the [Web Motion System](https://github.com/devoralabsapp/web-motion-system-skill/tree/main/skills/web-motion-system-skill). The Vietnamese README includes more implementation detail.

## Deployment

Vercel builds the site with `npm run build` and serves `dist`. Pushes to `main` deploy to [ai.devoralabs.tech](https://ai.devoralabs.tech/). The previous public Vercel URL redirects to the custom domain and preserves paths and query parameters.

## License

The source code and original editorial content are available under the [MIT License](LICENSE). Third-party logos, names and trademarks remain the property of their respective owners. [Asset attribution](dist/assets/logos/README.md)
