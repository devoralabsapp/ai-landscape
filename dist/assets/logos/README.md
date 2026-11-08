# Publisher logos and icons

These files are copied from official product websites, publisher brand kits or
official repositories for identification in the AI Atlas directory. They are
third-party assets, not original AI Atlas artwork, and are **not re-licensed under
the repository's MIT license**. Each owner retains its trademark and other rights.
Their inclusion does not imply endorsement or affiliation.

See [`../../logo-sources.json`](../../logo-sources.json) for the original asset URL,
publisher source page, date checked, byte size and SHA-256 of each copied file.
`scope` distinguishes a product mark from a shared product-family or publisher
identity; `kind` distinguishes a brand asset from the official site's icon.
For embedded assets, `extraction` records the exact page element. Midjourney's
PNG is decoded unchanged from its page's icon data URL; GitHub Copilot's inline
SVG keeps the original paths/styles with only an XML namespace added so it can
render as a standalone file.

Files retain their supplied colors and proportions. Rendering uses `object-fit:
contain` on a white plate, with no color filters, cropping or logo shadows. The
OpenCode mark uses whole-pixel multiples of its official 4:5 grid. Replace an asset
only from a verified publisher source, update its metadata/hash and run
`npm run build`. The build validates coverage and file integrity.
