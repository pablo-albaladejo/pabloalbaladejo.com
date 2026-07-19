<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# infra

## Purpose
AWS CDK (TypeScript) application that provisions the infrastructure for pabloalbaladejo.com: the public website (S3 + CloudFront + ACM + Route 53 + a GitHub OIDC deploy role) in `SiteStack`, and a fully isolated inbound-email forwarder (`talks@pabloalbaladejo.com` → Pablo's Gmail via SES) in `EmailStack`. This is a separate pnpm project from the site root (own `package.json`, lockfile, `tsconfig.json`) and is **not** built or deployed by any GitHub Actions workflow — `cdk deploy` is run manually.

## Key Files
| File | Description |
|------|--------------|
| `package.json` | Infra project manifest (`pabloalbaladejo.com-infra`) — `cdk` script wraps the CDK CLI; deps are `aws-cdk-lib`/`constructs`, dev deps `aws-cdk`/`tsx`/`typescript`. |
| `cdk.json` | CDK app entrypoint: `npx tsx bin/site.ts` (runs the TypeScript app directly via `tsx`, no separate compile step). |
| `tsconfig.json` | Strict TS config (`NodeNext` module/resolution, ES2022 target, `noEmit`) scoped to `bin/**/*` and `lib/**/*`. |
| `pnpm-lock.yaml` | Lockfile for this project — independent from the site root's lockfile. |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `bin/` | CDK app entrypoint — instantiates `SiteStack` and `EmailStack` (see `bin/AGENTS.md`). |
| `lib/` | The two stack definitions: `site-stack.ts` and `email-stack.ts` (see `lib/AGENTS.md`). |
| `lambda/` | Lambda function source bundled into stacks — currently the SES inbound forwarder (see `lambda/AGENTS.md`). |
| `cdk.out/` | CDK synth output — generated, gitignored (`infra/cdk.out/` in the repo root `.gitignore`). Not documented; never hand-edit. |

## For AI Agents

### Working In This Directory
- This is a **separate pnpm root**: run `pnpm install` inside `infra/` (or `pnpm --dir infra install`) before touching CDK code — the site's `pnpm install` at the repo root does not cover it.
- `SiteStack` and `EmailStack` are deliberately decoupled: `EmailStack` only *references* (`fromPublicHostedZoneAttributes`) the Route 53 zone `SiteStack` owns, and only *adds* DNS records (MX, DMARC, DKIM CNAMEs) — it never mutates site resources, so it can be deployed or destroyed independently without touching the live website.
- Both stacks pin `region: "us-east-1"` — required for CloudFront-attached ACM certificates, and kept for the whole app to avoid a cross-region certificate dance.
- The GitHub OIDC deploy role (`SiteStack`) trusts `repo:pablo-albaladejo/pabloalbaladejo.com:ref:refs/heads/main` (plus a pinned immutable-ID variant) — it can only be assumed by workflows running on `main`. Do not widen this trust condition without understanding the security implication.

### Testing Requirements
- No test suite. Verify changes with `pnpm --dir infra exec cdk synth` (confirms the TypeScript compiles and CloudFormation synthesizes) before proposing a diff.
- `cdk deploy` requires real AWS credentials and touches production DNS/CloudFront/SES — Pablo runs deploys manually; do not attempt to deploy from an agent session.

### Common Patterns
- Stacks export operational values via `CfnOutput` (bucket name, distribution ID, deploy role ARN, DKIM/MX setup hints) rather than hardcoding them elsewhere — read these outputs instead of re-deriving resource identifiers.
- IAM policies are scoped as tightly as the CDK constructs allow (e.g. the deploy role gets `cloudfront:CreateInvalidation` on exactly one distribution ARN; the SES bucket policy is confused-deputy guarded with an `aws:Referer` condition).

## Dependencies

### Internal
- `bin/site.ts` imports both stacks from `lib/`.
- `lib/email-stack.ts` imports the Lambda asset path from `lambda/forwarder/`.

### External
- **aws-cdk-lib** / **constructs** — the CDK v2 framework.
- **tsx** — runs the TypeScript CDK app without a separate build step.
- AWS services provisioned: S3, CloudFront, ACM, Route 53, IAM (incl. OIDC provider), SES, Lambda, custom resources (`aws-cdk-lib/custom-resources`).

<!-- MANUAL: notes below this line are preserved on regeneration -->
