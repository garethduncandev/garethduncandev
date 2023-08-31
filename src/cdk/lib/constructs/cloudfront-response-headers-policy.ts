import { ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs/lib/construct';

export interface UiBucketProps {
  noIndex: boolean;
}

export class CloudFrontResponseHeadersPolicy extends Construct {
  public readonly responseHeadersPolicy: ResponseHeadersPolicy;

  private readonly noIndexHeaderValue =
    'noindex, nofollow, noarchive, nositelinkssearchbox, nosnippet, noimageindex, notranslate, max-image-preview:0, max-video-preview:0';

  public constructor(scope: Construct, id: string, props: UiBucketProps) {
    super(scope, id);

    this.responseHeadersPolicy = new ResponseHeadersPolicy(this, id, {
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['*'],
        accessControlAllowMethods: ['ALL'],
        accessControlAllowOrigins: ['*'],
        originOverride: true,
        accessControlExposeHeaders: ['*'],
      },
      customHeadersBehavior: props.noIndex
        ? {
            customHeaders: [
              {
                override: true,
                header: 'X-Robots-Tag',
                value: this.noIndexHeaderValue,
              },
            ],
          }
        : undefined,
    });
  }
}
