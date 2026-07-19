<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# bin

## Purpose
The CDK app's entrypoint — the file `cdk.json` (`"app": "npx tsx bin/site.ts"`) tells the CDK CLI to execute directly.

## Key Files
| File | Description |
|------|--------------|
| `site.ts` | Instantiates the CDK `App` and both stacks: `SiteStack("PabloAlbaladejoSite")` pinned to `region: "us-east-1"` (required for CloudFront ACM certs) with the account read from `CDK_DEFAULT_ACCOUNT`; `EmailStack("EmailStack")` pinned to a hardcoded account (`896751635911`) and the same region, deliberately independent (comment notes it "only references the hosted zone, never the website resources, so it can be deployed independently and safely"). |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- This file wires stack instantiation only — stack logic (resources, IAM, DNS) belongs in `../lib/`, not here.
- The two stacks are deployed independently in practice; don't assume they need to be deployed together or in a particular order unless a cross-stack dependency is explicitly introduced.

### Testing Requirements
- `pnpm --dir infra exec cdk synth` from the repo root (or `pnpm exec cdk synth` from inside `infra/`) confirms this entrypoint and both stacks synthesize without error.

### Common Patterns
- Stack IDs (`"PabloAlbaladejoSite"`, `"EmailStack"`) are the CloudFormation stack names — do not rename them casually, as that would create new stacks rather than updating the existing deployed ones.

## Dependencies

### Internal
- Imports `../lib/site-stack.js` and `../lib/email-stack.js` (compiled/`tsx`-resolved from the `.ts` sources in `lib/`).

### External
- **aws-cdk-lib** (`App`).

<!-- MANUAL: notes below this line are preserved on regeneration -->
