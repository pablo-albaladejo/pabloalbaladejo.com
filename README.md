# pabloalbaladejo.com

Personal site of Pablo Albaladejo — built with [Astro](https://astro.build),
deployed to AWS (S3 + CloudFront via CDK), written and operated with AI
agents.

## Develop

```bash
pnpm install
pnpm dev
```

## Deploy

Pushes to `main` build the site and sync it to S3 through the GitHub
Actions workflow (OIDC role, no long-lived keys). Infrastructure lives in
[`infra/`](./infra) as an AWS CDK app (S3, CloudFront, ACM, Route 53).
