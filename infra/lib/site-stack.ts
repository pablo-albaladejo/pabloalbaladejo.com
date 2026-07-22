import { CfnOutput, Duration, Fn, RemovalPolicy, Stack } from "aws-cdk-lib";
import type { StackProps } from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

const DOMAIN = "pabloalbaladejo.com";
const WWW = `www.${DOMAIN}`;
const GITHUB_REPO = "pablo-albaladejo/pabloalbaladejo.com";

export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The domain is REGISTERED in another account (org root); this zone is
    // authoritative once the registrar's NS records point at it. The NS
    // values are exported below for that one-time manual step.
    const zone = new route53.PublicHostedZone(this, "Zone", {
      zoneName: DOMAIN,
    });

    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: DOMAIN,
      subjectAlternativeNames: [WWW],
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const bucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Rewrites clean URLs to the index.html objects Astro emits, and
    // collapses www onto the apex.
    const viewerRequestFn = new cloudfront.Function(this, "ViewerRequest", {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var host = request.headers.host.value;
  if (host === '${WWW}') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: { location: { value: 'https://${DOMAIN}' + request.uri } },
    };
  }
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    request.uri = uri + '/index.html';
  }
  return request;
}
`),
    });

    // Astro emits content-hashed filenames under /_astro/; without an explicit
    // Cache-Control browsers revalidate immutable files on every visit. Scoped
    // to that prefix only — HTML keeps the default revalidation behavior.
    const immutableAssets = new cloudfront.ResponseHeadersPolicy(
      this,
      "ImmutableAssets",
      {
        customHeadersBehavior: {
          customHeaders: [
            {
              header: "Cache-Control",
              value: "public, max-age=31536000, immutable",
              override: true,
            },
          ],
        },
        securityHeadersBehavior: {
          contentTypeOptions: { override: true },
        },
      },
    );

    // CloudFront standard logs are the only server-side traffic record for a
    // static site (no backend): they feed the SEO observatory's crawler-stats
    // collector (which search/AI bots fetch which pages). 90-day lifecycle
    // bounds cost; ACLs enabled because the log-delivery group requires them.
    const logBucket = new s3.Bucket(this, "CdnLogs", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: [{ expiration: Duration.days(90) }],
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      enableLogging: true,
      logBucket,
      logFilePrefix: "site-cdn/",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        compress: true,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy:
          cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
        functionAssociations: [
          {
            function: viewerRequestFn,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      additionalBehaviors: {
        "_astro/*": {
          origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          compress: true,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          responseHeadersPolicy: immutableAssets,
        },
      },
      domainNames: [DOMAIN, WWW],
      certificate,
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 404,
          responsePagePath: "/404.html",
          ttl: Duration.minutes(5),
        },
      ],
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    for (const [name, recordName] of [
      ["Apex", undefined],
      ["Www", WWW],
    ] as const) {
      new route53.ARecord(this, `${name}A`, {
        zone,
        recordName,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
      });
      new route53.AaaaRecord(this, `${name}Aaaa`, {
        zone,
        recordName,
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
      });
    }

    const githubOidc = new iam.OpenIdConnectProvider(this, "GithubOidc", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
    });

    const deployRole = new iam.Role(this, "DeployRole", {
      roleName: "pabloalbaladejo-com-deploy",
      assumedBy: new iam.WebIdentityPrincipal(
        githubOidc.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          },
          StringLike: {
            // GitHub is rolling out immutable-ID sub claims
            // (owner@id/repo@id); accept both formats.
            "token.actions.githubusercontent.com:sub": [
              `repo:${GITHUB_REPO}:ref:refs/heads/main`,
              "repo:pablo-albaladejo@7994467/pabloalbaladejo.com@1304978356:ref:refs/heads/main",
            ],
          },
        }
      ),
      maxSessionDuration: Duration.hours(1),
    });
    bucket.grantReadWrite(deployRole);
    bucket.grantDelete(deployRole);
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["cloudfront:CreateInvalidation"],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
        ],
      })
    );

    new CfnOutput(this, "NameServers", {
      value: Fn.join(" ", zone.hostedZoneNameServers ?? []),
      description:
        "Set these as the NS records of the registered domain (root account)",
    });
    new CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });
    new CfnOutput(this, "DeployRoleArn", { value: deployRole.roleArn });
  }
}
