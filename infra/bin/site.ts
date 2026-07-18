import { App } from "aws-cdk-lib";

import { SiteStack } from "../lib/site-stack.js";

const app = new App();

new SiteStack(app, "PabloAlbaladejoSite", {
  // us-east-1 is required for CloudFront certificates; keeping the whole
  // stack there avoids a cross-region certificate dance.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
});
