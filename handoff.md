# AI Atlas handoff

Reviewed **14 November 2026** against the checkout and production deployment. Start with [agent.md](agent.md) for the working checklist and [architecture.md](architecture.md) for the code and data flow.

## Where things stand

| Item | Value |
| --- | --- |
| Repository | [devoralabsapp/ai-landscape](https://github.com/devoralabsapp/ai-landscape) |
| Production | [ai.devoralabs.tech](https://ai.devoralabs.tech/) |
| Deployment | Vercel team `devoralabs`, project `ai-landscape`, production branch `main` |
| Last application revision verified | `a599702547a0dd421c68a5605e80f64fdd471b08`, ready on Vercel at review time |
| Catalog | 123 entries, 16 categories and 4 layers, with publisher sources reviewed on 8 November 2026 |
| Languages and themes | Vietnamese and English. Original Atlas theme plus six additional themes. GitHub opens the English README. |

The latest application change added cross-category work fields and three specialized entries: Burp Suite, Semgrep and Microsoft Security Copilot. The Work field selector and accent-insensitive search share editorial tags. The snapshot contains 14 cybersecurity entries, including 7 Pentest, 7 AppSec, 3 SOC and 2 OSINT entries. Tags can overlap. The Overview tab explains the role of each tagged tool. [Vietnamese Pentest view](https://ai.devoralabs.tech/?lang=vi&field=pentest#explore)

Cards open the Models, Plans and Overview tabs. The site also supports map and list views, a three-tool comparison, bookmarks, CSV export and shareable filter and tool links. Prior UI requests include slightly larger and darker text, more right padding for select arrows, quiet empty cells and a continuously moving hero illustration while it is visible and motion is enabled.

## Known deployment issue

On 14 November the custom domain served the current site, but `ai-landscape-mocha.vercel.app` returned HTTP 404 for both the homepage and an asset path. The project-domain list showed `ai.devoralabs.tech` only. [vercel.json](vercel.json) still contains the host-specific permanent redirect for the legacy hostname. Vercel must route the hostname to this project for those rules to take effect.

If restoring old links is in scope, confirm current project-domain ownership and routing before changing anything. Then verify a 308 for both the root and a nested path, including query parameters, and check that the custom domain still returns 200. Recheck after the next production deployment. The custom domain is the URL to share.

## Local media

The delivered video is `qa/video/AI-Atlas-intro-9x16-music-only.mp4` in the original workspace. It is a 25.7-second, 1080 × 1920 MP4 with Vietnamese titles, website captures and instrumental music. `qa/video/AI-Atlas-cover.jpg` is the cover. Use the `music-only` export when the brief calls for instrumental audio. `qa/` is ignored by Git and Vercel, so a fresh clone will need a separate copy if the video is needed.

## Resume work

1. Check `git status --short --branch` and `git log -5 --oneline`. Read the files relevant to the new request.
2. Run `npm run build`, then `npm run dev` from the checkout. Open [the local catalog](http://127.0.0.1:4173/).
3. Use the architecture map to change source files and regenerate tracked outputs. Verify the affected workflow in both languages when it involves copy or data.
4. If releasing changes, verify the intended branch and project. After Vercel reports ready, compare its Git SHA with the release commit and test the public URL.
