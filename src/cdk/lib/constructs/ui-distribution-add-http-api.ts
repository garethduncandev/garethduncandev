import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs/lib/construct';
import { CloudFrontResponseHeadersPolicy } from './cloudfront-response-headers-policy';

export class UiDistributionHttpApiOriginProps {
  public constructor(
    public readonly distribution: Distribution,
    public readonly httpApiUrl: string
  ) {}
}

export class UiDistributionHttpApiOrigin extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: UiDistributionHttpApiOriginProps
  ) {
    super(scope, id);

    const responseHeaderPolicy = new CloudFrontResponseHeadersPolicy(
      this,
      `response-headers-policy-${id}-http-api`,
      {
        nonIndex: true,
      }
    );

    const apiOriginPolicy = new OriginRequestPolicy(
      this,
      `api-origin-policy-${id}`,
      {
        cookieBehavior: OriginRequestCookieBehavior.all(),
        headerBehavior: OriginRequestHeaderBehavior.allowList(
          'Accept-Charset',
          'Origin',
          'Access-Control-Request-Headers',
          'Referer',
          'Accept-Language',
          'Accept-Datetime',
          'Access-Control-Request-Method'
        ),
        queryStringBehavior: OriginRequestQueryStringBehavior.all(),
        comment: 'HTTP API origin policy',
      }
    );

    // const apiUrl = `${props.httpApiId}.execute-api.${props.httpApiRegion}.amazonaws.com`;
    const httpOrigin = new HttpOrigin(props.httpApiUrl);

    props.distribution.addBehavior('/api/*', httpOrigin, {
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: CachePolicy.CACHING_DISABLED,
      compress: false,
      originRequestPolicy: apiOriginPolicy,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: responseHeaderPolicy.responseHeadersPolicy,
    });
  }
}
