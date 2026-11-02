# Meridian Vale Platform

Meridian Vale's logistics staging portal provides shipment lookup, route milestones, a shipment register, and a source-linked platform operations view. The application is a static site deployed from this repository to [GitHub Pages](https://hexrift.github.io/meridian-vale-platform/). Its records are controlled staging data, isolated from live shipment systems.

## Architecture

- `index.html`, `app.js`, and `data/shipments.json` provide the shipment workspace. References, routes, statuses, and milestones come from the versioned data file.
- `operations.html` and `operations.js` show the latest public GitHub Actions signals for change checks, staging deployment, and the hosted shipment journey. Each signal links to its source run; a successful build alone does not establish customer-visible availability.
- `lib/tracking.mjs` resolves shipment references. `lib/status.mjs` interprets workflow runs. The site has no runtime database or AWS credential.
- `.github/workflows/ci.yml` tests, builds, checks the rendered portal in Chrome, and deploys the built artifact from `main`. `.github/workflows/browser-journey.yml` runs an independent browser check against the published site.

## Local verification

Requires Node.js 20 or later and Chrome.

```bash
npm ci
npm test
npm run build
npm run serve
```

Open `http://127.0.0.1:4173/`. In another terminal, run `npm run check:browser`. Set `CHROME_BIN` if Chrome is not on the default path. The browser check writes its rendered DOM and receipt to `browser-check/`. Without `CHECK_REFERENCE`, the gate renders every active shipment reference from `data/shipments.json` (currently `MV-4821` and `MV-6158`) and fails if any of them does not return its route. The hosted workflow still accepts one constrained `MV-4821` or `MV-6158` reference input.

## Release and incident workflow

Changes enter through a pull request. CI verifies the application and rendered shipment journey before a `main` build can deploy. The separately dispatched hosted browser journey checks the published page and retains evidence even on failure. The platform operations page reports these source runs; it is an observation view, not an incident controller.

AI Institution holds the governed incident Mission, assigned expert decisions, source evidence, and verification receipts. Engineering changes and deployment remain in this repository. The private staging incident channel receives the Institution's native outcome notification. See [incident coordination](docs/incident-channel.md) for the signal boundaries and notification path.

This is a controlled staging environment. The public site contains no live shipment records, secrets, or customer access controls. Do not add production data or credentials to the repository.
