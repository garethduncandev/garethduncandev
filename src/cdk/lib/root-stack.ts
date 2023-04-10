import * as cdk from 'aws-cdk-lib';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

import { EnvironmentVariables } from '../bin/environmentVariables';

// nested stacks
import { ApiGatewayStack } from './api-gateway-stack';
import { ApiLambdaStack } from './api-lambda-function-stack';
import { UiStack } from './ui-stack';
import { CloudFrontDistributionStack } from './cloudfront-distribution-stack';

export interface RootStackProps extends cdk.StackProps {
  environmentVariables: EnvironmentVariables;
}

export class RootStack extends cdk.Stack {
  public constructor(
    scope: Construct,
    rootStackName: string,
    props: RootStackProps
  ) {
    super(scope, rootStackName, props);

    const hostedZone = this.getHostedZone(
      props.environmentVariables.CDK_HOSTED_ZONE_ID,
      props.environmentVariables.CDK_DOMAIN
    );

    const apiLambdaStack = new ApiLambdaStack(this, `api-lambda`, {
      rootStackName: rootStackName,
      environmentVariables: props.environmentVariables,
    });

    const apiGatewayStack = new ApiGatewayStack(this, `api-gateway`, {
      rootStackName: rootStackName,
      dockerImageLambdaFunction: apiLambdaStack.dockerImageLambdaFunction,
      allowHeaders: props.environmentVariables.CDK_API_CORS_ALLOWHEADERS,
      allowOrigins: props.environmentVariables.CDK_API_CORS_ALLOWORIGINS,
    });

    // for cloudfront distribution
    const cloudFrontDistributionStack = new CloudFrontDistributionStack(
      this,
      `cloudfront`,
      {
        httpApi: apiGatewayStack.httpApi,
        hostedZone: hostedZone,
        environmentVariables: props.environmentVariables,
        uiHostingS3Bucket: `${rootStackName}-ui-hosting`,
        rootStackName: rootStackName,
      }
    );

    // deploy UI static app to s3 bucket and cloudfront distribution
    new UiStack(this, `ui`, {
      environmentVariables: props.environmentVariables,
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
