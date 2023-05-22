import { RemovalPolicy } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  AllowedMethods,
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  OriginAccessIdentity,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs/lib/construct';
import { CloudFrontResponseHeadersPolicy } from './cloudfront-response-headers-policy';

export class UiDistributionProps {
  public constructor(
    public readonly removalPolicy: RemovalPolicy,
    public readonly domainName: string,
    public readonly cloudFrontDomainCertificateArn: string,
    public readonly noIndex: boolean,
    public readonly hostedZone: IHostedZone,
    public readonly uiBucket: IBucket,
    public readonly originAccessIdentity: OriginAccessIdentity
  ) {}
}

export class UiDistribution extends Construct {
  public readonly distribution: Distribution;

  public constructor(scope: Construct, id: string, props: UiDistributionProps) {
    super(scope, id);

    const certificate = Certificate.fromCertificateArn(
      this,
      `certificate`,
      props.cloudFrontDomainCertificateArn
    );

    const responseHeadersPolicyCloudFrontUi =
      new CloudFrontResponseHeadersPolicy(
        this,
        `response-headers-policy-${id}-cloud-front-ui`,
        {
          nonIndex: props.noIndex,
        }
      );

    const indexHtmlCloudfrontFunction = new Function(
      this,
      `ViewerResponseFunction-${id}`,
      {
        code: FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var uri = request.uri;
      
          // Check whether the URI is missing a file name.
          if (uri.endsWith('/')) {
              request.uri += 'index.html';
          }
          // Check whether the URI is missing a file extension.
          else if (!uri.includes('.')) {
              request.uri += '/index.html';
          }
      
          return request;
      }
        `),
        comment: 'Comment about the function',
        functionName: 'ExampleViewerResponseFunction',
      }
    );

    this.distribution = new Distribution(this, 'distribution', {
      defaultBehavior: {
        origin: new S3Origin(props.uiBucket, {
          originAccessIdentity: props.originAccessIdentity,
          originPath: `/app`,
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
        responseHeadersPolicy:
          responseHeadersPolicyCloudFrontUi.responseHeadersPolicy,
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

    new ARecord(this, `alias-record`, {
      recordName: props.domainName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
      zone: props.hostedZone,
    });
  }
}
