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
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
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
      `cf-viewer-request-function-${id}`,
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
        comment:
          'Add index.html to the end of the request uri if no extension exists',
        functionName: `cf-viewer-request-function-${id}`,
      }
    );

    //const bucketS3Url = `http://${props.uiBucket.bucketDomainName}.s3-website.${this.region}.amazonaws.com`;
    const bucketS3Url = props.uiBucket.bucketDomainName;

    this.distribution = new Distribution(this, 'distribution', {
      defaultBehavior: {
        // origin: new S3Origin(props.uiBucket, {
        //   originAccessIdentity: props.originAccessIdentity,
        //   originPath: `/app`,
        // }),
        // http://garethduncandev-development-blue.s3-website.eu-west-2.amazonaws.com/

        origin: new HttpOrigin(bucketS3Url, {
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
