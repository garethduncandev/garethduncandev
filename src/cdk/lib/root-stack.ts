import * as cdk from 'aws-cdk-lib';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { StackVariables } from '../bin/stackVariables';

// nested stacks
import { ApiGatewayStack } from './api-gateway-stack';
import { ApiLambdaStack } from './api-lambda-function-stack';
import { UiStack } from './ui-stack';
import { CloudFrontDistributionStack } from './cloudfront-distribution-stack';

export interface RootStackProps extends cdk.StackProps {
  stackVariables: StackVariables;
}

export class RootStack extends cdk.Stack {
  public constructor(
    scope: Construct,
    rootStackName: string,
    props: RootStackProps
  ) {
    super(scope, rootStackName, props);

    const hostedZone = this.getHostedZone(
      props.stackVariables.appVariables.CDK_HOSTED_ZONE_ID,
      props.stackVariables.appVariables.CDK_DOMAIN
    );

    const apiLambdaStack = new ApiLambdaStack(this, `api-lambda`, {
      rootStackName: rootStackName,
      stackVariables: props.stackVariables,
    });

    const apiGatewayStack = new ApiGatewayStack(this, `api-gateway`, {
      rootStackName: rootStackName,
      dockerImageLambdaFunction: apiLambdaStack.dockerImageLambdaFunction,
      allowHeaders: ['*'],
      allowOrigins: props.stackVariables.apiAllowedOrigins,
    });

    // for cloudfront distribution
    const cloudFrontDistributionStack = new CloudFrontDistributionStack(
      this,
      `cloudfront`,
      {
        httpApi: apiGatewayStack.httpApi,
        hostedZone: hostedZone,
        stackVariables: props.stackVariables,
        uiHostingS3Bucket: `${rootStackName}-ui-hosting`,
        rootStackName: rootStackName,
      }
    );

    // deploy UI static app to s3 bucket and cloudfront distribution
    new UiStack(this, `ui`, {
      stackVariables: props.stackVariables,
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
