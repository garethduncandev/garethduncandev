import { NestedStack } from 'aws-cdk-lib';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  AllowedMethods,
  Distribution,
  OriginAccessIdentity,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { ExportHelper } from './helpers/exports';
import { OriginAccessIdentityHelper } from './helpers/origin-access-identity';
import { ResponseHeadersPolicyHelper } from './helpers/reponse-headers-policy';
import { Route53Helper } from './helpers/route53';
import { RootNestedStackProps } from './root-stack';
import path = require('path');

export class AppStack extends NestedStack {
  public constructor(
    scope: Construct,
    stackName: string,
    props: RootNestedStackProps
  ) {
    super(scope, stackName, props);

    // S3 bucket to host angular application, to be served up via cloudfront
    const cloudFrontDomainCertificate = this.cloudFrontDomainCertificate(
      stackName,
      props.environmentStackProps.cloudFrontDomainCertificateArn
    );

    const originAccessIdentity =
      OriginAccessIdentityHelper.originAccessIdentity(this, stackName);

    const cloudFrontDistribution = this.cloudFrontDistribution(
      stackName,
      props.environmentStackProps.absoluteDomainName,
      cloudFrontDomainCertificate,
      originAccessIdentity,
      props.bucket,
      props.environmentStackProps.robotsNoIndex
    );

    // So we can query this to invalidate if required
    ExportHelper.createExport(
      this,
      stackName,
      cloudFrontDistribution.distributionId,
      'cloudfront distributionId',
      'appCloudFrontDistributionId'
    );

    Route53Helper.cloudFrontDistributionRoute53ARecord(
      this,
      stackName,
      props.hostedZone,
      props.environmentStackProps.absoluteDomainName,
      cloudFrontDistribution
    );

    this.appDeployment(props, props.bucket);
  }

  private cloudFrontDistribution(
    stackName: string,
    absoluteDomainName: string,
    cloudFrontDomainCertificate: ICertificate,
    originAccessIdentity: OriginAccessIdentity,
    bucket: IBucket,
    noIndexing: boolean
  ): Distribution {
    const absoluteDomainNames: string[] = [absoluteDomainName];

    const distibution = new Distribution(this, `${stackName}-distibution`, {
      defaultBehavior: {
        origin: new S3Origin(bucket, {
          originAccessIdentity: originAccessIdentity,
          originPath: `/app`,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        originRequestPolicy: OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy:
          ResponseHeadersPolicyHelper.getResponseHeaderPolicy(
            this,
            stackName,
            noIndexing
          ),
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

    return distibution;
  }

  private cloudFrontDomainCertificate(
    stackName: string,
    cloudFrontDomainCertificateArn: string
  ): ICertificate {
    return Certificate.fromCertificateArn(
      this,
      `${stackName}-cloudfront-certificate`,
      cloudFrontDomainCertificateArn
    );
  }

  private appDeployment(
    props: RootNestedStackProps,
    bucket: IBucket
  ): BucketDeployment {
    return new BucketDeployment(
      this,
      `${props.environmentStackProps.stackName}-app-bucket-deployment`,
      {
        sources: [Source.asset(path.join(__dirname, '../../app/build'))],
        destinationKeyPrefix: `app`,
        destinationBucket: bucket,
        prune: true,
        exclude: [],
      }
    );
  }
}
