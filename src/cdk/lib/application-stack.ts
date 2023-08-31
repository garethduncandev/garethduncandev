import * as cdk from 'aws-cdk-lib';
import { Aws } from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { HttpApiGateway } from './constructs/http-api-gateway';
import { HttpApiGatewayLambdaIntegration } from './constructs/http-api-gateway-lambda-integration';
import { LambdaDockerImageFunction } from './constructs/lambda-docker-image-function';
import { UiBucket } from './constructs/ui-bucket';
import { UiBucketDeployment } from './constructs/ui-bucket-deployment';
import { UiDistribution } from './constructs/ui-distribution';
import { UiDistributionHttpApiOrigin } from './constructs/ui-distribution-add-http-api';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';

export interface ApplicationStackProps extends cdk.StackProps {
  domain: string;
  subDomain: string | undefined;
  aspNetCoreEnvironment: string;
  robotsNoIndex: boolean;
}

export class ApplicationStack extends cdk.Stack {
  public uiBucket: UiBucket;

  public constructor(
    scope: Construct,
    id: string,
    props: ApplicationStackProps
  ) {
    super(scope, id, props);

    const cloudFrontCertificateIdentifier = this.node.tryGetContext(
      'cloudfront-certificate-identifier'
    );

    if (!cloudFrontCertificateIdentifier) {
      throw new Error("cloudfront certificate identifier can't be empty");
    }

    const cloudFrontCertificateARN = `arn:aws:acm:us-east-1:${Aws.ACCOUNT_ID}:certificate/${cloudFrontCertificateIdentifier}`;

    const hostedZoneId = this.node.tryGetContext('hosted-zone-id');

    if (!hostedZoneId) {
      throw new Error("hosted zone id can't be empty");
    }

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, `${id}-zone`, {
      hostedZoneId: hostedZoneId,
      zoneName: props.domain,
    });

    const originAccessIdentity = new OriginAccessIdentity(this, `${id}-OAI`, {
      comment: `${id}-cdk-OAI`,
    });

    // s3 hosting bucket
    this.uiBucket = new UiBucket(this, `${id}-ui-bucket`, {
      originAccessIdentity: originAccessIdentity,
    });

    // lambda
    const lambdaDockerImageFunction = new LambdaDockerImageFunction(this, id, {
      aspNetCoreEnvironment: props.aspNetCoreEnvironment,
    });

    // cloudfront distribution
    const distribution = new UiDistribution(this, `${id}-ui-distribution`, {
      cloudFrontDomainCertificateArn: cloudFrontCertificateARN,
      uiBucket: this.uiBucket.bucket,
      domainName: props.subDomain
        ? `${props.subDomain}.${props.domain}`
        : props.domain,
      hostedZone: hostedZone,
      noIndex: props.robotsNoIndex,
      originAccessIdentity: originAccessIdentity,
    });

    // api gateway
    const httpApi = new HttpApiGateway(this, `${id}-http-api`);

    // lambda api gateway integration
    new HttpApiGatewayLambdaIntegration(
      this,
      `${id}-http-api-lambda-integration`,
      {
        dockerImageFunction: lambdaDockerImageFunction.dockerImageFunction,
        httpApi: httpApi.httpApi,
      }
    );

    // add http api as another origin to distribution
    new UiDistributionHttpApiOrigin(
      this,
      `${id}-ui-distribution-http-api-origin`,
      {
        distribution: distribution.distribution,
        httpApi: httpApi.httpApi,
      }
    );

    // s3 bucket deployment to cloudfront
    new UiBucketDeployment(this, `${id}-ui-bucket-deployment`, {
      destinationBucket: this.uiBucket.bucket,
      distribution: distribution.distribution,
      applicationStackProps: props,
    });
  }
}
