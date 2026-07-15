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
import { Construct } from 'constructs';
import { CloudFrontResponseHeadersPolicy } from './cloudfront-response-headers-policy';
import { Aws } from 'aws-cdk-lib';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';

export interface UiDistributionHttpApiOriginProps {
  distribution: Distribution;
  httpApi: HttpApi;
  domainName: string;
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
      'response-headers-policy',
      {
        noIndex: true,
        domainName: props.domainName,
      }
    );

    const apiOriginPolicy = new OriginRequestPolicy(this, 'api-origin-policy', {
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
    });

    const apiUrl = `${props.httpApi.httpApiId}.execute-api.${Aws.REGION}.amazonaws.com`;

    props.distribution.addBehavior('/api/*', new HttpOrigin(apiUrl), {
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: CachePolicy.CACHING_DISABLED,
      compress: false,
      originRequestPolicy: apiOriginPolicy,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: responseHeaderPolicy.responseHeadersPolicy,
    });
  }
}
