<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# forwarder

## Purpose
The Lambda function that turns inbound mail to `talks@pabloalbaladejo.com` into a forwarded message in Pablo's personal Gmail, invoked by SES per the `ReceiptRuleSet` defined in `infra/lib/email-stack.ts`.

## Key Files
| File | Description |
|------|--------------|
| `index.mjs` | Handler flow: read the SES `messageId` off the Lambda event, fetch the raw MIME object from the landing S3 bucket (`MAIL_BUCKET`/`MAIL_PREFIX` env vars), rewrite the header block (`rewrite()`) — strips `From`/`To`/`Cc`/`Reply-To`/`Return-Path`/`Sender`/`Message-Id`/`DKIM-Signature` headers (old DKIM signatures no longer match after rewriting `From`, so SES would reject a duplicate-header error otherwise) and injects a verified `From` (`FORWARD_FROM`/`FORWARD_FROM_NAME` env vars), the personal `To` (`FORWARD_TO`), and a `Reply-To` set to the original sender so replies work — then re-sends the rewritten raw message via SES `SendRawEmailCommand`. Body is preserved byte-for-byte; only headers are touched. Follows the well-known `aws-lambda-ses-forwarder` pattern, trimmed to this account's single route. |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- This is plain Node ESM (`.mjs`, no build step, no `package.json` of its own) deployed as-is via `lambda.Code.fromAsset` — the AWS SDK v3 clients (`@aws-sdk/client-s3`, `@aws-sdk/client-ses`) it imports must be available in the Lambda's Node 20 runtime (they ship built into the `nodejs20.x` managed runtime; no `node_modules` bundling is set up here).
- Header rewriting uses regex on the raw MIME text, not a MIME parser — be careful with any change to `rewrite()`; a malformed regex could corrupt the message or leak/duplicate headers.
- Never remove the `DKIM-Signature` stripping step — a stale signature computed for a different `From` header will make SES reject the re-send as invalid.

### Testing Requirements
- No automated tests. Verify changes by sending a real test email to `talks@pabloalbaladejo.com` after deploy and confirming it arrives at the personal Gmail with a sane `From`/`Reply-To`, or by unit-testing `rewrite()` in isolation against sample raw MIME strings before deploying.

### Common Patterns
- Environment variables are the only configuration surface (`MAIL_BUCKET`, `MAIL_PREFIX`, `FORWARD_FROM`, `FORWARD_FROM_NAME`, `FORWARD_TO`) — set in `infra/lib/email-stack.ts`'s Lambda `environment` block, not hardcoded here.

## Dependencies

### Internal
- Deployed by `infra/lib/email-stack.ts` via `lambda.Code.fromAsset`; receives its S3/SES config entirely through env vars set there.

### External
- **@aws-sdk/client-s3** (`GetObjectCommand`), **@aws-sdk/client-ses** (`SendRawEmailCommand`) — provided by the Lambda Node 20 managed runtime.

<!-- MANUAL: notes below this line are preserved on regeneration -->
