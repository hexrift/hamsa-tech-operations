# Hamsa Tech Operations

A Meridian Vale logistics customer portal in a controlled Hamsa-owned staging environment. A customer can look up a shipment reference and see its route and delivery milestones. The staging records are in `data/shipments.json`; no live customer shipment is represented. A separate [platform operations view](operations.html) shows recent public GitHub Actions runs and the commit used to build the portal. A successful CI check does not establish customer service availability.

Run `npm ci && npm test && npm run build && npm run serve`, then open `http://127.0.0.1:4173/`. Run `npm run check:browser` to verify the rendered page in Chrome. Set `CHROME_BIN` if Chrome is not on the system path.

The `CI and staging` workflow runs unit tests, builds the site, verifies shipment `MV-4821` in Chrome against the built artifact, and only then deploys that artifact to GitHub Pages on `main`. The separate `Staging browser journey` workflow checks the hosted URL and uploads its rendered evidence. See [staging incident coordination](docs/incident-channel.md) for the verified AI Institution Mission-outcome notification path and the separate hosted browser health signal. AI Institution holds the authoritative decisions and evidence.
