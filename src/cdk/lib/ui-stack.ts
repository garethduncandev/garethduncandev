import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { StackVariables } from '../bin/stackVariables';

import path = require('path');

export interface UiStackProps extends NestedStackProps {
  stackVariables: StackVariables;
  cloudFrontDistributionBucket: IBucket;
  hostedZone: IHostedZone;
  cloudFrontDistribution: Distribution;
}

export class UiStack extends NestedStack {
  public constructor(
    scope: Construct,
    nestedStackName: string,
    appStackProps: UiStackProps
  ) {
    super(scope, nestedStackName, appStackProps);

    this.deployment(
      appStackProps.cloudFrontDistributionBucket,
      appStackProps.cloudFrontDistribution
    );
  }

  private deployment(
    bucket: IBucket,
    distribution: Distribution
  ): BucketDeployment {
    return new BucketDeployment(this, 'ui-deployment', {
      sources: [Source.asset(path.join(__dirname, '../../app/build'))],
      destinationKeyPrefix: `app`,
      destinationBucket: bucket,
      prune: true,
      exclude: [],
      distribution: distribution,
      distributionPaths: ['/index.html'],
    });
  }
}
