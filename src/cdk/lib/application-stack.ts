import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { ApplicationStackOptions } from '../bin/application-stack-options';
import { CloudFrontResponseHeadersPolicy } from './constructs/cloudfront-response-headers-policy';
import { HttpApiGateway } from './constructs/http-api-gateway';
import { HttpApiGatewayLambdaIntegration } from './constructs/http-api-gateway-lambda-integration';
import { LambdaDockerImageFunction } from './constructs/lambda-docker-image-function';
import { UiBucket } from './constructs/ui-bucket';
import { UiBucketDeployment } from './constructs/ui-bucket-deployment';
import { UiDistribution } from './constructs/ui-distribution';
import { UiDistributionHttpApiOrigin } from './constructs/ui-distribution-add-http-api';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';

export interface ApplicationStackProps extends cdk.StackProps {
  applicationStackOptions: ApplicationStackOptions;
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

    new CfnOutput(this, 'domain-name-export', {
      value: props.applicationStackOptions.fullDomainName,
      description: 'domain name',
      exportName: `${props.applicationStackOptions.applicationStackName}-domain-name`,
    });

    const responseHeadersPolicyCloudFrontUi =
      new CloudFrontResponseHeadersPolicy(
        this,
        `response-headers-policy-${id}-cloud-front-ui`,
        {
          nonIndex:
            props.applicationStackOptions.environmentOptions.robotsNoIndex,
        }
      );

    const responseHeadersPolicyHttpApi = new CloudFrontResponseHeadersPolicy(
      this,
      `response-headers-policy-${id}-http-api`,
      {
        nonIndex: true,
      }
    );

    const originAccessIdentity = new OriginAccessIdentity(this, `OAI`, {
      comment: `created-by-${id}-${props.applicationStackOptions.fullDomainName}-cdk-OAI`,
    });

    // s3 hosting bucket
    this.uiBucket = new UiBucket(this, 'ui-bucket', {
      bucketName: id,
      removalPolicy:
        props.applicationStackOptions.environmentOptions.removalPolicy,
    });

    this.uiBucket.bucket.grantRead(originAccessIdentity);

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
      responseHeadersPolicy:
        responseHeadersPolicyCloudFrontUi.responseHeadersPolicy,
      originAccessIdentity: originAccessIdentity,
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
    });

    new CfnOutput(this, 'http-api-id-export', {
      value: httpApi.httpApi.apiId,
      description: 'http api id',
      exportName: `${props.applicationStackOptions.applicationStackName}-http-api-id`,
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
      responseHeadersPolicy: responseHeadersPolicyHttpApi.responseHeadersPolicy,
    });

    // s3 bucket deployment to cloudfront
    new UiBucketDeployment(this, 'ui-bucket-deployment', {
      destinationBucket: this.uiBucket.bucket,
      distribution: distribution.distribution,
    });
  }
}
