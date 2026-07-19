<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# .github/workflows

## Purpose
GitHub Actions CI/CD for the site: build+validate on every pull request, and build+deploy on every push to `main`. Both authenticate to AWS via OIDC (no long-lived access keys stored in the repo). Infra (`infra/`) deployment is **not** covered here — CDK deploys are run manually by Pablo.

## Key Files
| File | Description |
|------|--------------|
| `pr-checks.yml` | Runs on every `pull_request`: installs deps (`pnpm install --frozen-lockfile`, Node 22), runs `pnpm build`, then a Node inline script that walks `dist/`, extracts every `<script type="application/ld+json">` block from every built HTML file, and fails the job if any block fails `JSON.parse`. `permissions: contents: read` only — no deploy credentials. |
| `deploy.yml` | Runs on push to `main` (or manual `workflow_dispatch`); `concurrency: group: deploy, cancel-in-progress: false` serializes deploys. Installs deps, runs `pnpm build` (passing `PUBLIC_UMAMI_WEBSITE_ID` from repo vars), assumes the AWS OIDC deploy role (`role-to-assume: vars.AWS_DEPLOY_ROLE_ARN`), syncs `dist/` to S3 with `--delete`, then invalidates the CloudFront distribution (`--paths "/*"`). Requires `id-token: write` for OIDC. |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- These workflows are the actual enforcement of "every change lands as a PR" and "`pnpm build` is the gate" — `pr-checks.yml` is what a reviewer/CI relies on, not a local convention.
- Repository variables consumed here (`AWS_DEPLOY_ROLE_ARN`, `SITE_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`, `PUBLIC_UMAMI_WEBSITE_ID`) are configured in GitHub repo settings, not in this repo's files — the values must match what `infra/lib/site-stack.ts` provisions (`DeployRoleArn`, `BucketName`, `DistributionId` CfnOutputs).
- The deploy role's trust policy (in `infra/lib/site-stack.ts`) restricts assumption to workflows running on `refs/heads/main` in this exact repo — changing the branch this workflow runs on requires updating that trust policy too.

### Testing Requirements
- Workflow YAML changes can't be unit tested; validate syntax and step logic by reading carefully, and where possible dry-run equivalent shell locally (e.g. run the same `pnpm build` + JSON-LD check script from `pr-checks.yml` locally against a local `dist/`).
- Never modify `deploy.yml` in a way that could push to S3/invalidate CloudFront from a PR context — deploy must stay gated to `main`.

### Common Patterns
- Both jobs pin `pnpm/action-setup@v4` (pnpm 9) and `actions/setup-node@v4` (Node 22, `cache: pnpm`) identically — keep them in sync if bumping versions.
- `timeout-minutes: 10` on both jobs — a reasonable ceiling for a static-site build; raise only if the build genuinely needs longer.

## Dependencies

### Internal
- `deploy.yml` depends on outputs from `infra/lib/site-stack.ts` (bucket name, distribution ID, deploy role ARN) being registered as GitHub repo variables.

### External
- `actions/checkout@v4`, `pnpm/action-setup@v4`, `actions/setup-node@v4`, `aws-actions/configure-aws-credentials@v4` — all pinned GitHub Actions.
- AWS CLI (`aws s3 sync`, `aws cloudfront create-invalidation`) — available on `ubuntu-latest` runners by default.

<!-- MANUAL: notes below this line are preserved on regeneration -->
