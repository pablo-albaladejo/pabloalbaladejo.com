import { App } from "aws-cdk-lib";

import { EmailStack } from "../lib/email-stack.js";
import { SiteStack } from "../lib/site-stack.js";

const app = new App();

new SiteStack(app, "PabloAlbaladejoSite", {
  // us-east-1 is required for CloudFront certificates; keeping the whole
  // stack there avoids a cross-region certificate dance.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
});

// Isolated SES email-forwarding stack (talks@ -> Gmail). Pinned to the same
// account/region as the site; it only references the hosted zone, never the
// website resources, so it can be deployed independently and safely.
new EmailStack(app, "EmailStack", {
  env: { account: "896751635911", region: "us-east-1" },
});
