<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# lambda

## Purpose
Container directory for Lambda function source code bundled into CDK stacks via `lambda.Code.fromAsset(...)`. Currently holds one function: the SES inbound-email forwarder used by `EmailStack`.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `forwarder/` | The SES inbound-mail forwarding Lambda (`talks@` → Gmail) (see `forwarder/AGENTS.md`). |

## For AI Agents

### Working In This Directory
- Each subdirectory here is deployed as a standalone Lambda asset (`lambda.Code.fromAsset(fileURLToPath(new URL("../lambda/{name}", import.meta.url)))` in the referencing stack) — keep each function's dependencies self-contained within its own subdirectory since there's no shared bundling step.

<!-- MANUAL: notes below this line are preserved on regeneration -->
