# Hamsa Tech Operations

A Meridian Vale logistics customer portal in a controlled Hamsa-owned staging environment. A customer can look up a shipment reference and see its route and delivery milestones. The staging records are in `data/shipments.json`; no live customer shipment is represented. A separate [platform operations view](operations.html) shows recent public GitHub Actions runs and the commit used to build the portal. A successful CI check does not establish customer service availability.

Run `npm ci && npm test && npm run build && npm run serve`, then open `http://127.0.0.1:4173/`. Run `npm run check:browser` to verify the rendered page in Chrome. Set `CHROME_BIN` if Chrome is not on the system path.

The `CI and staging` workflow tests and builds the site, then deploys the same artifact to GitHub Pages on `main`. The post-deployment browser journey checks whether `MV-4821` renders its destination and milestones. See [the incident-channel contract](docs/incident-channel.md) for operational alerts; AI Institution holds the authoritative decisions and evidence.
