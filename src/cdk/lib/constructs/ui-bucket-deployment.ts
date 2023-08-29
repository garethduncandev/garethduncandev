import { IDistribution } from 'aws-cdk-lib/aws-cloudfront';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs/lib/construct';
import path = require('path');
import { ApplicationStackProps } from '../application-stack';

export class UiBucketDeploymentProps {
  public constructor(
    public readonly destinationBucket: IBucket,
    public readonly distribution: IDistribution,
    public readonly applicationStackProps: ApplicationStackProps
  ) {}
}

export class UiBucketDeployment extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: UiBucketDeploymentProps
  ) {
    super(scope, id);

    new BucketDeployment(this, id, {
      sources: [
        Source.asset(path.join(__dirname, '../../../app/build')),
        Source.jsonData('appsettings.json', {
          buildTime: new Date().toISOString(),
          applicationStackProps: props.applicationStackProps,
        }),
      ],
      destinationKeyPrefix: `app`,
      destinationBucket: props.destinationBucket,
      prune: true,
      exclude: [],
      distribution: props.distribution,
      distributionPaths: ['/*'],
    });
  }
}
