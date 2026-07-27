import * as cdk from 'aws-cdk-lib';
import { Aws, CfnParameter } from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { HttpApiGateway } from './constructs/http-api-gateway';
import { HttpApiGatewayLambdaIntegration } from './constructs/http-api-gateway-lambda-integration';
import { ApiLambdaFunction } from './constructs/lambda-docker-image-function';
import { UiBucket } from './constructs/ui-bucket';
import { UiBucketDeployment } from './constructs/ui-bucket-deployment';
import { UiDistribution } from './constructs/ui-distribution';
import { UiDistributionHttpApiOrigin } from './constructs/ui-distribution-add-http-api';

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

    const cloudFrontCertificateIdentifier = new CfnParameter(this, 'CloudFrontCertificateIdentifier', {
      type: 'String',
      description: 'ACM certificate identifier for CloudFront distribution',
    });

    const cloudFrontCertificateARN = `arn:aws:acm:us-east-1:${Aws.ACCOUNT_ID}:certificate/${cloudFrontCertificateIdentifier.valueAsString}`;

    const hostedZoneId = new CfnParameter(this, 'HostedZoneId', {
      type: 'String',
      description: 'Route53 hosted zone ID',
    });

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, `${id}-zone`, {
      hostedZoneId: hostedZoneId.valueAsString,
      zoneName: props.domain,
    });

    // s3 hosting bucket
    this.uiBucket = new UiBucket(this, `${id}-ui-bucket`);

    // lambda
    const apiLambdaFunction = new ApiLambdaFunction(this, `${id}-api-lambda`, {
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
    });

    // api gateway
    const httpApi = new HttpApiGateway(this, `${id}-http-api`);

    // lambda api gateway integration
    new HttpApiGatewayLambdaIntegration(
      this,
      `${id}-http-api-lambda-integration`,
      {
        lambdaFunction: apiLambdaFunction.function,
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
        noIndex: props.robotsNoIndex,
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
