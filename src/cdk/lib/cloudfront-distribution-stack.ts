import { NestedStack, NestedStackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  IResponseHeadersPolicy,
  OriginAccessIdentity,
  OriginRequestCookieBehavior,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import {
  BlockPublicAccess,
  Bucket,
  HttpMethods,
  IBucket,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { StackOptions } from '../bin/stackOptions';
import { ExportHelper } from './helpers/exports';
import { ResponseHeadersPolicyHelper } from './helpers/reponse-headers-policy';
import { Route53Helper } from './helpers/route53';

export interface CloudFrontDistributionStackProps extends NestedStackProps {
  stackOptions: StackOptions;
  hostedZone: IHostedZone;
  uiHostingS3Bucket: string;
  rootStackName: string;
  httpApi: HttpApi;
}

export class CloudFrontDistributionStack extends NestedStack {
  public readonly distribution: Distribution;
  public readonly cloudFrontDistributionBucket: IBucket;

  public constructor(
    scope: Construct,
    nestedStackName: string,
    cloudFrontDistributionStackProps: CloudFrontDistributionStackProps
  ) {
    super(scope, nestedStackName, cloudFrontDistributionStackProps);

    this.cloudFrontDistributionBucket = this.createCloudFrontDistributionBucket(
      cloudFrontDistributionStackProps.uiHostingS3Bucket,
      cloudFrontDistributionStackProps.stackOptions.environment.removalPolicy
    );

    // S3 bucket to host angular application, to be served up via cloudfront
    const cloudFrontDomainCertificate = this.cloudFrontDomainCertificate(
      cloudFrontDistributionStackProps.stackOptions.appVariables
        .CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN
    );

    const responseHeadersPolicy =
      ResponseHeadersPolicyHelper.getResponseHeaderPolicy(
        this,
        cloudFrontDistributionStackProps.rootStackName,
        nestedStackName,
        cloudFrontDistributionStackProps.stackOptions.environment.robotsNoIndex
      );

    this.distribution = this.cloudFrontDistribution(
      scope,
      nestedStackName,
      cloudFrontDistributionStackProps.rootStackName,
      cloudFrontDistributionStackProps.stackOptions.fullDomainName,
      cloudFrontDomainCertificate,
      this.cloudFrontDistributionBucket,
      responseHeadersPolicy
    );

    // So we can query this to invalidate if required
    ExportHelper.createExport(
      this,
      cloudFrontDistributionStackProps.rootStackName,
      nestedStackName,
      this.distribution.distributionId,
      'cloudfront distributionId',
      'cloudFrontDistributionId'
    );

    ExportHelper.createExport(
      this,
      cloudFrontDistributionStackProps.rootStackName,
      nestedStackName,
      this.distribution.distributionDomainName,
      'cloudfront domain name',
      'cloudFrontDistributionDomainName'
    );

    Route53Helper.cloudFrontDistributionRoute53ARecord(
      this,
      cloudFrontDistributionStackProps.rootStackName,
      nestedStackName,
      cloudFrontDistributionStackProps.hostedZone,
      cloudFrontDistributionStackProps.stackOptions.fullDomainName,
      this.distribution
    );

    this.addHttpApiOrigin(
      this.distribution,
      cloudFrontDistributionStackProps.httpApi,
      cloudFrontDistributionStackProps.stackOptions.fullDomainName,
      responseHeadersPolicy
    );

    // add origin for api into cloudfront distributio
  }

  private cloudFrontDistribution(
    scope: Construct,
    nestedStackName: string,
    rootStackName: string,
    fullDomainName: string,
    cloudFrontDomainCertificate: ICertificate,
    bucket: IBucket,
    responseHeadersPolicy: IResponseHeadersPolicy
  ): Distribution {
    const absoluteDomainNames: string[] = [fullDomainName];

    const originAccessIdentity = new OriginAccessIdentity(
      scope,
      `${rootStackName}-${nestedStackName}-OAI`,
      {
        comment: `Createdby_${rootStackName}-${nestedStackName}_cdk-OAI`,
      }
    );

    const distribution = new Distribution(this, 'distribution', {
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: originAccessIdentity,
          originPath: `/app`,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: responseHeadersPolicy,
      },
      domainNames: absoluteDomainNames,
      certificate: cloudFrontDomainCertificate,
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

    bucket.grantRead(originAccessIdentity);

    return distribution;
  }

  private cloudFrontDomainCertificate(
    cloudFrontDomainCertificateArn: string
  ): ICertificate {
    return Certificate.fromCertificateArn(
      this,
      `certificate`,
      cloudFrontDomainCertificateArn
    );
  }

  private createCloudFrontDistributionBucket(
    bucketName: string,
    removalPolicy: RemovalPolicy
  ): IBucket {
    return new Bucket(this, `distribution-s3-bucket`, {
      removalPolicy: removalPolicy,
      autoDeleteObjects: removalPolicy === RemovalPolicy.DESTROY,
      bucketName: bucketName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });
  }

  private addHttpApiOrigin(
    distribution: Distribution,
    httpApi: HttpApi,
    region: string,
    responseHeadersPolicy: IResponseHeadersPolicy
  ): void {
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

    const apiUrl = `${httpApi.httpApiId}.execute-api.${region}.amazonaws.com`;
    const httpOrigin = new HttpOrigin(apiUrl);

    distribution.addBehavior('/api/*', httpOrigin, {
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachePolicy: CachePolicy.CACHING_DISABLED,
      compress: false,
      originRequestPolicy: apiOriginPolicy,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      responseHeadersPolicy: responseHeadersPolicy,
    });
  }
}
