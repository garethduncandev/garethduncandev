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
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Aws } from 'aws-cdk-lib';

export class UiDistributionHttpApiOriginProps {
  public constructor(
    public readonly distribution: Distribution,
    public readonly httpApi: HttpApi
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
      `response-headers-policy-http-api`,
      {
        noIndex: true,
      }
    );

    const apiOriginPolicy = new OriginRequestPolicy(this, `api-origin-policy`, {
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
    });

    const apiUrl = `${props.httpApi.httpApiId}.execute-api.${Aws.REGION}.amazonaws.com`;

    const httpOrigin = new HttpOrigin(apiUrl);

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
