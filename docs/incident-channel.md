# Staging incident coordination

The Hamsasoftware workspace has a private `#tech-incidents-staging` channel for Meridian Vale staging operations. AI Institution holds the role-governed Mission, source evidence, decisions, and verification receipts. Slack receives notifications from the Institution; it is not the incident record.

## Connected notification path

The Institution's native Slack connector sends pending approval and Mission outcome notifications to the channel configured by `SLACK_APPROVAL_CHANNEL`. Its bot credential is supplied as `SLACK_BOT_TOKEN` through the runtime's secret configuration, never through this repository. The bot must be invited to the private channel with permission to post.

This path was verified on 1 November 2026: the Institution certified its Meridian Vale staging diagnosis Mission, and the AI Institution Incidents bot delivered the corresponding “Mission certified” notification to `#tech-incidents-staging`. The source Mission ID is `mission-f6dc838a-e2ce-42b4-bc61-d76c271419f3`; the channel message timestamp is `1793574668.228699`. The Mission links the governed GitHub pull-request read to its certification. The notification does not assert a customer production outage.

## Staging health signal

The separate [Staging browser journey](https://github.com/hexrift/hamsa-tech-operations/actions/workflows/staging-browser.yml) checks the **deployed** shipment-tracking page in Chrome. The controlled regression produced a [failed browser run](https://github.com/hexrift/hamsa-tech-operations/actions/runs/41359725233) after a passing deployment. The [recovery deployment](https://github.com/hexrift/hamsa-tech-operations/actions/runs/41360269148) and [hosted browser verification](https://github.com/hexrift/hamsa-tech-operations/actions/runs/41360615324) passed after the marker fix and release gate landed.

The browser workflow does not automatically post an app-health alert through the Institution's Slack connector. An operator initiated the governed diagnosis Mission from the observed failure; the native connector then delivered its outcome. A future automatic incident alert must include the deployed URL, failed browser result, deployment revision, time, and Institution incident record, and must be verified end to end before it is described as active.
