import * as cdk from 'aws-cdk-lib';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { ApplicationStackOptions } from '../bin/application-stack-options';
import { HttpApiGateway } from './constructs/http-api-gateway';
import { HttpApiGatewayLambdaIntegration } from './constructs/http-api-gateway-lambda-integration';
import { LambdaDockerImageFunction } from './constructs/lambda-docker-image-function';
import { UiBucket } from './constructs/ui-bucket';
import { UiBucketDeployment } from './constructs/ui-bucket-deployment';
import { UiDistribution } from './constructs/ui-distribution';
import { UiDistributionHttpApiOrigin } from './constructs/ui-distribution-add-http-api';

export interface ApplicationStackProps extends cdk.StackProps {
  applicationStackOptions: ApplicationStackOptions;
  originAccessIdentity: OriginAccessIdentity;
}

export class ApplicationStack extends cdk.Stack {
  public uiBucket: UiBucket;

  public constructor(
    scope: Construct,
    id: string,
    props: ApplicationStackProps
  ) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId:
        props.applicationStackOptions.applicationOptions.CDK_HOSTED_ZONE_ID,
      zoneName: props.applicationStackOptions.applicationOptions.CDK_DOMAIN,
    });

    // s3 hosting bucket
    this.uiBucket = new UiBucket(this, 'ui-bucket', {
      bucketName: id,
      removalPolicy:
        props.applicationStackOptions.environmentOptions.removalPolicy,
    });

    this.uiBucket.bucket.grantRead(props.originAccessIdentity);

    // cloudfront distribution
    const distribution = new UiDistribution(this, 'ui-distribution', {
      cloudFrontDomainCertificateArn:
        props.applicationStackOptions.applicationOptions
          .CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN,
      uiBucket: this.uiBucket.bucket,
      domainName: props.applicationStackOptions.fullDomainName,
      hostedZone: hostedZone,
      removalPolicy:
        props.applicationStackOptions.environmentOptions.removalPolicy,
      noIndex: props.applicationStackOptions.environmentOptions.robotsNoIndex,
      originAccessIdentity: props.originAccessIdentity,
    });

    // lambda
    const lambdaDockerImageFunction = new LambdaDockerImageFunction(
      this,
      'lambda-docker-image-function',
      {
        apiDefaultMemoryAllocation:
          props.applicationStackOptions.environmentOptions
            .apiDefaultMemoryAllocation,
        timeout: props.applicationStackOptions.environmentOptions.apiTimeout,
        aspNetCoreEnvironment:
          props.applicationStackOptions.environmentOptions
            .aspNetCoreEnvironment,
        functionName: id,
      }
    );

    // api gateway
    const httpApi = new HttpApiGateway(this, 'http-api', {
      allowOrigins: props.applicationStackOptions.apiAllowedOrigins,
      apiName: id,
      applicationStackOptions: props.applicationStackOptions,
    });

    // lambda api gateway integration
    new HttpApiGatewayLambdaIntegration(this, 'http-api-lambda-integration', {
      dockerImageFunction: lambdaDockerImageFunction.dockerImageFunction,
      httpApi: httpApi.httpApi,
    });

    // add http api as another origin to distribution
    new UiDistributionHttpApiOrigin(this, 'ui-distribution-http-api-origin', {
      distribution: distribution.distribution,
      httpApi: httpApi.httpApi,
      httpApiRegion:
        props.applicationStackOptions.applicationOptions.CDK_DEFAULT_REGION,
    });

    // s3 bucket deployment to cloudfront
    new UiBucketDeployment(this, 'ui-bucket-deployment', {
      destinationBucket: this.uiBucket.bucket,
      distribution: distribution.distribution,
    });
  }
}
