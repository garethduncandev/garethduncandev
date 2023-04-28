import { IHttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs/lib/construct';
export interface UiDistributionHttpApiOriginProps {
  distribution: Distribution;
  httpApi: IHttpApi;
  httpApiRegion: string;
  responseHeadersPolicy: ResponseHeadersPolicy;
}

export class UiDistributionHttpApiOrigin extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: UiDistributionHttpApiOriginProps
  ) {
    super(scope, id);

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

    const apiUrl = `${props.httpApi.apiId}.execute-api.${props.httpApiRegion}.amazonaws.com`;
    const httpOrigin = new HttpOrigin(apiUrl);

    props.distribution.addBehavior('/api/*', httpOrigin, {
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: CachePolicy.CACHING_DISABLED,
      compress: false,
      originRequestPolicy: apiOriginPolicy,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: props.responseHeadersPolicy,
    });
  }
}
