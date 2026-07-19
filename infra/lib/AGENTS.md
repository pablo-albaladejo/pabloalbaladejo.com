<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-07-19 | Updated: 2026-07-19 -->

# lib

## Purpose
The two CDK stack definitions provisioning all AWS resources for the site and its talks@ inbox: `SiteStack` (public website hosting + deploy identity) and `EmailStack` (isolated inbound-email forwarding).

## Key Files
| File | Description |
|------|--------------|
| `site-stack.ts` | `SiteStack`: a Route 53 public hosted zone (`pabloalbaladejo.com`, authoritative once the registrar's NS records — output as `NameServers` — point at it; the domain is registered in a different AWS account/org root); an ACM certificate (apex + `www`, DNS validation); a private S3 bucket (`BLOCK_ALL` public access, SSE, `enforceSSL`, `RETAIN` removal policy); a CloudFront `Function` (`ViewerRequest`, JS runtime 2.0) that 301-redirects `www` → apex and rewrites clean URLs to `index.html`; a CloudFront distribution (OAC origin, `CACHING_OPTIMIZED`, `SECURITY_HEADERS`, HTTP/2+3, `PRICE_CLASS_100`, custom 403→404 error response); apex + `www` A/AAAA alias records; a GitHub OIDC provider and a deploy `Role` (`pabloalbaladejo-com-deploy`) trusted only by `refs/heads/main` in this exact repo (`pablo-albaladejo/pabloalbaladejo.com`, both legacy and immutable-ID `sub` claim formats), granted S3 read/write/delete on the bucket and `cloudfront:CreateInvalidation` scoped to this one distribution. Outputs: `NameServers`, `BucketName`, `DistributionId`, `DeployRoleArn`. |
| `email-stack.ts` | `EmailStack`: turns `talks@pabloalbaladejo.com` into a Gmail forwarder via SES. References (does not create) the hosted zone `SiteStack` owns via a **hardcoded zone ID** (`Z0587030V3YJF5X7SGF7`). Verifies the domain as an SES identity via Easy DKIM (writes DKIM CNAMEs into the zone). A private, auto-expiring (7-day lifecycle) S3 bucket lands raw inbound MIME, with a confused-deputy-guarded bucket policy (`aws:Referer` = account ID) allowing only SES to write. A Node 20 Lambda (`../lambda/forwarder`) rewrites and re-sends each message. An SES `ReceiptRuleSet` routes `talks@` mail to S3-then-Lambda. A custom resource (`AwsCustomResource`) activates the rule set on deploy and deactivates it on stack deletion, since CloudFormation has no native "active receipt rule set" property. Adds an MX record (SES inbound endpoint) and a `_dmarc` TXT record (`p=none`); notes SPF is added out-of-band via CLI because it must share the apex TXT record set with a pre-existing Google Search Console verification value. |

## Subdirectories
None.

## For AI Agents

### Working In This Directory
- `EmailStack`'s hardcoded `HOSTED_ZONE_ID` must match whatever `SiteStack` actually provisions — if the zone is ever recreated (a destructive, rare event), this constant needs a manual update.
- `EmailStack` is intentionally additive-only to the shared zone (MX, DMARC, DKIM CNAMEs) — never have it modify or delete records `SiteStack` owns (apex A/AAAA, the pre-existing GSC TXT value).
- Both stacks favor tightly scoped IAM (see `site-stack.ts`'s `CreateInvalidation` policy scoped to one distribution ARN, and `email-stack.ts`'s confused-deputy `aws:Referer` condition) — match this scoping style rather than broad wildcard permissions when adding new grants.
- Changing the CloudFront `ViewerRequest` function (URL rewriting/redirect logic) affects every route on the live site — test the generated JS logic carefully; a bug here can break the whole site's routing.

### Testing Requirements
- `pnpm --dir infra exec cdk synth` validates both stacks synthesize; there's no automated integration test against real AWS. Deploys are manual (`cdk deploy`) and touch production DNS/CDN/email — review diffs (`cdk diff`) carefully before Pablo runs a deploy.

### Common Patterns
- Every stack ends with `CfnOutput`s for the values other systems need (GitHub Actions repo variables, DNS setup) rather than requiring the operator to look up ARNs/IDs manually in the console.
- Constants (domain, account IDs, zone ID, recipient addresses) are declared as top-of-file `const`s in each stack file, not shared across stacks — if you add a value both stacks need, consider whether duplication or a shared constants module is more appropriate given the stacks' intentional decoupling.

## Dependencies

### Internal
- `email-stack.ts` references `SiteStack`'s hosted zone by hardcoded ID (not a CDK cross-stack reference) and imports the Lambda asset from `../lambda/forwarder/`.

### External
- **aws-cdk-lib** modules: `aws-certificatemanager`, `aws-cloudfront` (+ `aws-cloudfront-origins`), `aws-iam`, `aws-route53` (+ `aws-route53-targets`), `aws-s3`, `aws-ses` (+ `aws-ses-actions`), `aws-lambda`, `custom-resources`.

<!-- MANUAL: notes below this line are preserved on regeneration -->
