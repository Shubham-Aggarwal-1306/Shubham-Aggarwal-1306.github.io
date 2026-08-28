# Shubham Aggarwal — portfolio

Next.js 16 (App Router) + React 19, deployed on Vercel.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Structure

| Path | |
|---|---|
| `app/page.tsx` | the single page, composed from `lib/content.ts` |
| `app/layout.tsx` | metadata, Person JSON-LD |
| `app/globals.css` | all styling |
| `app/robots.ts`, `app/sitemap.ts` | generated from `SITE_URL` |
| `lib/content.ts` | all copy, kept verbatim |
| `lib/site.ts` | origin + identity constants |
| `components/Field.tsx` | decorative three.js particle field |
| `components/Motion.tsx` | scroll reveals, nav state, progress bar |

## Production URL

`SITE_URL` in `lib/site.ts` drives the canonical tag, OG URLs, `robots.txt`
and `sitemap.xml`. It reads `NEXT_PUBLIC_SITE_URL` and falls back to
`https://shubham-aggarwal.tech`.

**Until that domain resolves to this deployment, set `NEXT_PUBLIC_SITE_URL` in
the Vercel project to the `*.vercel.app` URL.** A canonical tag pointing at a
domain that does not serve the site is worse than none at all.

## Constraints worth preserving

- **Content renders without JavaScript.** Reveal styles sit behind
  `@media (scripting: enabled)`; with scripting off, nothing hides. Do not
  reintroduce a class injected by an inline script — mutating `<html>` before
  hydration is a React hydration mismatch.
- **`prefers-reduced-motion` is honoured.** All animation is disabled and
  `Field.tsx` returns before importing three.js, so those users never download
  it.
- **three.js is dynamically imported** so it stays out of the initial bundle
  and off the critical path.
- **`--faint` must not go below `#7e7e88`** — darker fails WCAG AA on `--bg`.
  Do not animate opacity on faint text for the same reason.
