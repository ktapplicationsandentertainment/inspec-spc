# InSpec SPC

Free statistical process control tools for people who need answers, not a statistics degree.
No sign-up, no jargon — paste your data and get a chart, a number, and a plain-language
explanation of what it means.

## Tools

- **Control Chart Generator** — X̄-R (subgrouped) and Individuals (I-MR) charts with Western
  Electric out-of-control rules applied automatically.
- **Process Capability Calculator** — Cp/Cpk/Pp/Ppk from raw data or summary stats, with
  stability and normality warnings baked in.
- **Histogram + Normality Check** — shape, skewness/kurtosis, and an optional fitted normal
  curve overlay.
- **Pareto Chart Generator** — sorts categories by impact and highlights the "vital few" behind
  80% of the total.
- **Gage R&R Calculator** — ANOVA method (preferred) and the classic Range method as a simpler
  fallback.
- **Sample Size / Confidence Interval Calculator** — for proportions and means, with an optional
  finite-population correction.
- **Hypothesis Testing** — one-sample, two-sample (Welch's), and paired t-tests, plus a
  chi-square test of independence.

Every calculation is unit-tested, and where possible validated against exact closed-form
mathematical identities (e.g. the t-distribution at df=1 is the Cauchy distribution, chi-square
at df=2 is exponential) rather than just spot-checked numbers.

## Stack

React + TypeScript + Vite, client-side only — no backend, nothing to keep running. Routing is
`react-router-dom` (`BrowserRouter`), so the host needs an SPA fallback rule (see `public/_redirects`
for the Cloudflare Pages version: `/* /index.html 200`).

## Development

```bash
npm install
npm run dev      # local dev server
npm test         # vitest
npm run build    # production build to dist/
```

## Deployment

Deployed via Cloudflare Pages, connected to this repo: build command `npm run build`, output
directory `dist`.
