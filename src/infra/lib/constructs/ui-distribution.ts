import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  AllowedMethods,
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { CloudFrontResponseHeadersPolicy } from './cloudfront-response-headers-policy';

export interface UiDistributionProps {
  domainName: string;
  cloudFrontDomainCertificateArn: string;
  noIndex: boolean;
  hostedZone: IHostedZone;
  uiBucket: IBucket;
  contentSecurityPolicy: string;
}

export class UiDistribution extends Construct {
  public readonly distribution: Distribution;

  private readonly cloudFrontFunction = `
  function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
  }
  `;

  public constructor(scope: Construct, id: string, props: UiDistributionProps) {
    super(scope, id);

    const certificate = Certificate.fromCertificateArn(
      this,
      'certificate',
      props.cloudFrontDomainCertificateArn
    );

    const responseHeadersPolicy = new CloudFrontResponseHeadersPolicy(
      this,
      'response-headers-policy',
      {
        noIndex: props.noIndex,
        domainName: props.domainName,
        contentSecurityPolicy: props.contentSecurityPolicy,
      }
    );

    const indexHtmlCloudfrontFunction = new Function(
      this,
      'cf-viewer-request-function',
      {
        code: FunctionCode.fromInline(this.cloudFrontFunction),
      }
    );

    this.distribution = new Distribution(this, 'distribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(props.uiBucket, {
          originPath: '/app',
        }),
        functionAssociations: [
          {
            function: indexHtmlCloudfrontFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: responseHeadersPolicy.responseHeadersPolicy,
      },
      domainNames: [props.domainName],
      certificate: certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    new ARecord(this, 'alias-record', {
      recordName: props.domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      zone: props.hostedZone,
    });
  }
}
