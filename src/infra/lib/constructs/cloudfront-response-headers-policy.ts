import { Duration } from 'aws-cdk-lib';
import { ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

export interface CloudFrontResponseHeadersPolicyProps {
  noIndex: boolean;
  domainName: string;
}

export interface CloudFrontApiResponseHeadersPolicyProps {
  noIndex: boolean;
}

const noIndexHeaderValue =
  'noindex, nofollow, noarchive, nositelinkssearchbox, nosnippet, noimageindex, notranslate, max-image-preview:0, max-video-preview:0';

const contentSecurityPolicyValue =
  "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'";

export class CloudFrontResponseHeadersPolicy extends Construct {
  public readonly responseHeadersPolicy: ResponseHeadersPolicy;

  public constructor(scope: Construct, id: string, props: CloudFrontResponseHeadersPolicyProps) {
    super(scope, id);

    this.responseHeadersPolicy = new ResponseHeadersPolicy(this, id, {
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['Content-Type', 'Accept', 'Origin'],
        accessControlAllowMethods: ['GET', 'POST', 'OPTIONS'],
        accessControlAllowOrigins: [`https://${props.domainName}`],
        originOverride: true,
      },
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: contentSecurityPolicyValue,
          override: true,
        },
        strictTransportSecurity: {
          override: true,
          accessControlMaxAge: Duration.seconds(31536000),
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          ...(props.noIndex
            ? [
                {
                  override: true,
                  header: 'X-Robots-Tag',
                  value: noIndexHeaderValue,
                },
              ]
            : []),
        ],
      },
    });
  }
}

export class CloudFrontApiResponseHeadersPolicy extends Construct {
  public readonly responseHeadersPolicy: ResponseHeadersPolicy;

  public constructor(scope: Construct, id: string, props: CloudFrontApiResponseHeadersPolicyProps) {
    super(scope, id);

    this.responseHeadersPolicy = new ResponseHeadersPolicy(this, id, {
      securityHeadersBehavior: {
        strictTransportSecurity: {
          override: true,
          accessControlMaxAge: Duration.seconds(31536000),
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          ...(props.noIndex
            ? [
                {
                  override: true,
                  header: 'X-Robots-Tag',
                  value: noIndexHeaderValue,
                },
              ]
            : []),
        ],
      },
    });
  }
}
