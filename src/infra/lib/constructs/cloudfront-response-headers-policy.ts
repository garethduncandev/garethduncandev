import { Duration } from 'aws-cdk-lib';
import { ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

export interface UiBucketProps {
  noIndex: boolean;
  domainName: string;
}

export class CloudFrontResponseHeadersPolicy extends Construct {
  public readonly responseHeadersPolicy: ResponseHeadersPolicy;

  private readonly noIndexHeaderValue =
    'noindex, nofollow, noarchive, nositelinkssearchbox, nosnippet, noimageindex, notranslate, max-image-preview:0, max-video-preview:0';

  //private readonly contentSecurityPolicyValue = "style-src 'self';";

  public constructor(scope: Construct, id: string, props: UiBucketProps) {
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
        // contentSecurityPolicy: {
        //   contentSecurityPolicy: this.contentSecurityPolicyValue,
        //   override: true,
        // },
        strictTransportSecurity: {
          override: true,
          accessControlMaxAge: Duration.seconds(300),
        },
      },
      customHeadersBehavior: {
        customHeaders: [
          ...(props.noIndex
            ? [
                {
                  override: true,
                  header: 'X-Robots-Tag',
                  value: this.noIndexHeaderValue,
                },
              ]
            : []),
        ],
      },
    });
  }
}
