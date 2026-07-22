import { fileURLToPath } from "node:url";

import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import type { StackProps } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ses from "aws-cdk-lib/aws-ses";
import * as actions from "aws-cdk-lib/aws-ses-actions";
import * as cr from "aws-cdk-lib/custom-resources";
import type { Construct } from "constructs";

const DOMAIN = "pabloalbaladejo.com";
const HOSTED_ZONE_ID = "Z0587030V3YJF5X7SGF7";
const RECIPIENT = `talks@${DOMAIN}`;
const FORWARD_TO = "pablo.albaladejo.mestre@gmail.com";
const FORWARD_FROM_NAME = "Pablo (talks)";
const MAIL_PREFIX = "inbound/";
const RULE_SET_NAME = "talks-forwarding";

// SES inbound SMTP endpoint for the receiving region.
const INBOUND_SMTP = "inbound-smtp.us-east-1.amazonaws.com";

const LAMBDA_ASSET = fileURLToPath(
  new URL("../lambda/forwarder", import.meta.url)
);

/**
 * Fully isolated stack that turns talks@pabloalbaladejo.com into an email
 * forwarder to Pablo's Gmail via Amazon SES. It shares nothing with SiteStack
 * beyond referencing (never mutating) the existing public hosted zone, so it can
 * be deployed or destroyed without touching the live website.
 */
export class EmailStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Reference the zone that SiteStack manages; we only ADD records to it.
    const zone = route53.PublicHostedZone.fromPublicHostedZoneAttributes(
      this,
      "Zone",
      { hostedZoneId: HOSTED_ZONE_ID, zoneName: DOMAIN }
    );

    // Verify the domain as a sending/receiving identity via Easy DKIM. The
    // construct writes the three DKIM CNAME records into the zone and SES
    // verifies the domain through them (no legacy _amazonses TXT needed).
    new ses.EmailIdentity(this, "DomainIdentity", {
      identity: ses.Identity.publicHostedZone(zone),
    });

    // Private landing bucket for raw inbound MIME; auto-expire after 7 days.
    const mailBucket = new s3.Bucket(this, "InboundMailBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [{ expiration: Duration.days(7) }],
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Let SES write inbound messages to the bucket (confused-deputy guarded).
    mailBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        sid: "AllowSESPuts",
        actions: ["s3:PutObject"],
        principals: [new iam.ServicePrincipal("ses.amazonaws.com")],
        resources: [mailBucket.arnForObjects(`${MAIL_PREFIX}*`)],
        conditions: { StringEquals: { "aws:Referer": this.account } },
      })
    );

    const domainIdentityArn = this.formatArn({
      service: "ses",
      resource: "identity",
      resourceName: DOMAIN,
    });
    // In the SES sandbox, SendRawEmail is authorized against the DESTINATION
    // identity too (not only the From/domain). Without permission on the Gmail
    // identity the forwarder 403s: "not authorized to perform ses:SendRawEmail
    // on resource identity/<gmail>". Grant both identities involved.
    const forwardToIdentityArn = this.formatArn({
      service: "ses",
      resource: "identity",
      resourceName: FORWARD_TO,
    });

    const forwarder = new lambda.Function(this, "Forwarder", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(LAMBDA_ASSET),
      timeout: Duration.seconds(30),
      memorySize: 256,
      environment: {
        MAIL_BUCKET: mailBucket.bucketName,
        MAIL_PREFIX,
        FORWARD_FROM: RECIPIENT,
        FORWARD_FROM_NAME,
        FORWARD_TO,
      },
    });

    mailBucket.grantRead(forwarder);
    forwarder.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendRawEmail"],
        resources: [domainIdentityArn, forwardToIdentityArn],
      })
    );

    // Receipt rule set: match talks@ -> store in S3, then invoke the forwarder.
    const ruleSet = new ses.ReceiptRuleSet(this, "RuleSet", {
      receiptRuleSetName: RULE_SET_NAME,
      rules: [
        {
          recipients: [RECIPIENT],
          enabled: true,
          scanEnabled: true,
          actions: [
            new actions.S3({
              bucket: mailBucket,
              objectKeyPrefix: MAIL_PREFIX,
            }),
            new actions.Lambda({
              function: forwarder,
              invocationType: actions.LambdaInvocationType.EVENT,
            }),
          ],
        },
      ],
    });

    // CloudFormation cannot mark a rule set active (it is an account-level
    // setting), so a custom resource flips it on at deploy and off at destroy.
    const activate = new cr.AwsCustomResource(this, "ActivateRuleSet", {
      onUpdate: {
        service: "SES",
        action: "setActiveReceiptRuleSet",
        parameters: { RuleSetName: RULE_SET_NAME },
        physicalResourceId: cr.PhysicalResourceId.of(
          `active-${RULE_SET_NAME}`
        ),
      },
      onDelete: {
        // Empty params clears the active rule set (deactivates ours).
        service: "SES",
        action: "setActiveReceiptRuleSet",
        parameters: {},
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
      installLatestAwsSdk: false,
    });
    activate.node.addDependency(ruleSet);

    // --- DNS (additive only; apex A/AAAA and GSC TXT are left untouched) ---
    // MX -> SES inbound. SPF is added out-of-band via CLI because it must share
    // the apex TXT record set with the pre-existing Google verification value.
    new route53.MxRecord(this, "Mx", {
      zone,
      values: [{ hostName: INBOUND_SMTP, priority: 10 }],
    });

    new route53.TxtRecord(this, "Dmarc", {
      zone,
      recordName: "_dmarc",
      values: [`v=DMARC1; p=none; rua=mailto:${FORWARD_TO}`],
    });

    new CfnOutput(this, "InboundBucketName", { value: mailBucket.bucketName });
    new CfnOutput(this, "ForwarderFunctionName", {
      value: forwarder.functionName,
    });
    new CfnOutput(this, "ReceiptRuleSetName", { value: RULE_SET_NAME });
    new CfnOutput(this, "Recipient", { value: RECIPIENT });
  }
}
