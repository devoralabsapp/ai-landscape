# Working on AI Atlas

Read [handoff.md](handoff.md) for the current state, [architecture.md](architecture.md) for file responsibilities, and [README.md](README.md) for product context. Keep work scoped to the requested change and inspect the working tree before editing.

## Catalog changes

1. Use the publisher's site, official docs or official repository to verify the tool's name, availability, models and plans. Record a source URL and distinguish the publisher's claims from editorial use-case notes. Record a new review date only for claims that were reviewed.
2. Edit the relevant entry in `dist/data.js` and its product profile in `dist/product-data.js`. Existing IDs are durable. When renaming an entry, check the ID derived from the name, bookmarks, comparison records, deep links and other references. Keep the current ID or migrate references deliberately.
3. Add or update `SECURITY_PROFILES` in `dist/security-data.js` when the tool has a concrete role in a work field. Distinguish a specialized tool from a general tool that supports a workflow.
4. For a new tool or changed logo, use an official brand asset or site icon, record provenance and compute the hash from the stored bytes. Use the appropriate product, family or publisher scope. Preserve supplied colors and proportions. [Logo attribution](dist/assets/logos/README.md)
5. Add English translations for new Vietnamese labels, notes, and product or plan text in `dist/translations.en.json`. Confirm both languages in the UI for dynamic labels. When adding or removing entries, review count references in the HTML metadata and both READMEs.
6. Run `npm run build` and review the generated diff. Commit relevant generated exports with the source changes.

## UI changes

- Keep UI text readable on mobile and desktop, and check one light and one dark theme for contrast. Use the existing theme tokens and account for right-side spacing around select arrows.
- Preserve keyboard access and native dialog focus behavior. Verify that search, active filters, clear filters, deep links and filtered CSV work together when those flows are affected.
- Keep empty map areas visually quiet. Keep the hero animation tied to visibility and reduced-motion settings. Reuse the existing motion lifecycle when changing transitions.
- For theme or motion changes, use the existing references. [Creative Theme System](https://github.com/devoralabsapp/creative-theme-system-skill) · [Web Motion System](https://github.com/devoralabsapp/web-motion-system-skill/tree/main/skills/web-motion-system-skill)

## Before handing back

```sh
npm run build
git diff --check
```

For a browser smoke test, run `npm run dev` and open `/?lang=vi&field=pentest#explore` and `/?lang=en&tool=chatgpt`. Choose checks that exercise the change, such as combining a field and source filter, switching to list view, or opening a tool's Models, Plans and Overview tabs.

Pushes to production branch `main` trigger a Vercel deployment. For an authorized release, verify the public site, the deployment status and the deployed Git SHA. Keep credentials and local QA files out of the public repo. Update the handoff when production state, a known issue or an important implementation constraint changes.
