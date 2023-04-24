import * as cdk from 'aws-cdk-lib';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { StackOptions } from '../bin/stackOptions';

// nested stacks
import { ApiGatewayStack } from './api-gateway-stack';
import { ApiLambdaStack } from './api-lambda-function-stack';
import { UiStack } from './ui-stack';
import { CloudFrontDistributionStack } from './cloudfront-distribution-stack';
import { IDistribution } from 'aws-cdk-lib/aws-cloudfront';

export interface RootStackProps extends cdk.StackProps {
  stackOptions: StackOptions;
}

export class RootStack extends cdk.Stack {
  public cloudFrontDistribution: IDistribution;

  public constructor(
    scope: Construct,
    rootStackName: string,
    props: RootStackProps
  ) {
    super(scope, rootStackName, props);

    const hostedZone = this.getHostedZone(
      props.stackOptions.appVariables.CDK_HOSTED_ZONE_ID,
      props.stackOptions.appVariables.CDK_DOMAIN
    );

    const apiLambdaStack = new ApiLambdaStack(this, `api-lambda`, {
      rootStackName: rootStackName,
      stackOptions: props.stackOptions,
    });

    const apiGatewayStack = new ApiGatewayStack(this, `api-gateway`, {
      rootStackName: rootStackName,
      dockerImageLambdaFunction: apiLambdaStack.dockerImageLambdaFunction,
      allowHeaders: ['*'],
      allowOrigins: props.stackOptions.apiAllowedOrigins,
    });

    // for cloudfront distribution
    const cloudFrontDistributionStack = new CloudFrontDistributionStack(
      this,
      `cloudfront`,
      {
        httpApi: apiGatewayStack.httpApi,
        hostedZone: hostedZone,
        stackOptions: props.stackOptions,
        uiHostingS3Bucket: `${rootStackName}-ui-hosting`,
        rootStackName: rootStackName,
      }
    );

    this.cloudFrontDistribution = cloudFrontDistributionStack.distribution;

    // deploy UI static app to s3 bucket and cloudfront distribution
    new UiStack(this, `ui`, {
      stackOptions: props.stackOptions,
      cloudFrontDistributionBucket:
        cloudFrontDistributionStack.cloudFrontDistributionBucket,
      hostedZone: hostedZone,
      cloudFrontDistribution: cloudFrontDistributionStack.distribution,
    });
  }

  private getHostedZone(hostedZoneId: string, domain: string): IHostedZone {
    return HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: hostedZoneId,
      zoneName: domain,
    });
  }
}
