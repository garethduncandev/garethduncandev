import { Cors } from 'aws-cdk-lib/aws-apigateway';
import {
  IResponseHeadersPolicy,
  ResponseCustomHeader,
  ResponseHeadersCorsBehavior,
  ResponseHeadersPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

export class ResponseHeadersPolicyHelper {
  public static getResponseHeaderPolicy(
    scope: Construct,
    stackName: string,
    robotsNoIndex: boolean
  ): IResponseHeadersPolicy {
    const policyName = `${stackName}-response-headers-policy`;
    return new ResponseHeadersPolicy(scope, policyName, {
      responseHeadersPolicyName: policyName,
      corsBehavior: this.corsBehaviour(),
      customHeadersBehavior: robotsNoIndex
        ? {
            customHeaders: [this.customHeaderRobotsNoIndex()],
          }
        : undefined,
    });
  }

  private static corsBehaviour(): ResponseHeadersCorsBehavior {
    return {
      accessControlAllowCredentials: false,
      accessControlAllowHeaders: Cors.DEFAULT_HEADERS,
      accessControlAllowMethods: Cors.ALL_METHODS,
      accessControlAllowOrigins: Cors.ALL_ORIGINS,
      originOverride: true,
      accessControlExposeHeaders: ['*'],
    };
  }

  private static customHeaderRobotsNoIndex(): ResponseCustomHeader {
    return {
      override: true,
      header: 'X-Robots-Tag',
      value:
        'noindex, nofollow, noarchive, nositelinkssearchbox, nosnippet, noimageindex, notranslate, max-image-preview:0, max-video-preview:0',
    };
  }
}
