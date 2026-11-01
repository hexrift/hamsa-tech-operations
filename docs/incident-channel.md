# Staging incident channel contract

Channel: `#tech-incidents-staging` in the Hamsasoftware workspace. This is a private staging coordination channel. AI Institution holds the authoritative incident record, role decisions, approvals, and verification receipts.

## Notification

Send an alert only when the **deployed Meridian Vale staging URL** fails the shipment-tracking browser check, not when a CI result alone is red. The business symptom is that a customer cannot retrieve delivery milestones for a known shipment reference. The message should include the staging URL, browser-check result, deployment run URL, deployed commit, observed time, incident record link, incident commander, and the next verification step. Do not post secrets, request headers, credentials, or private repository content.

## Connection

The Institution runtime needs `SLACK_BOT_TOKEN` and `SLACK_OPERATIONS_CHANNEL` supplied through local or hosted secret configuration. For this staging channel the channel ID is `C0CDTP66D61`. The bot must be invited to the private channel and have the Slack scope necessary to post messages. A channel existing by itself does not prove delivery; record a successful Slack message timestamp and channel ID before describing the integration as live.

The workflow is: browser check records a failure → Institution incident commander opens or updates the incident → an authorized operator sends a source-linked alert → experts diagnose and approve a recovery → browser check verifies the deployed result → Institution records closure. Slack is an operational notification surface, not the source of truth.
