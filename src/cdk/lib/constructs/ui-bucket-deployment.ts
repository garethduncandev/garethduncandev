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

export class AppSettings {
  public constructor(
    public buildTime: Date,
    public domain: string,
    public subDomain: string | undefined,
    public apiUrl: string,
    public aspNetCoreEnvironment: string,
    public stackName: string
  ) {}
}

export class UiBucketDeployment extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: UiBucketDeploymentProps
  ) {
    super(scope, id);

    const apiUrl = props.applicationStackProps.subDomain
      ? `https://${props.applicationStackProps.subDomain}.${props.applicationStackProps.domain}/api`
      : `https://${props.applicationStackProps.domain}/api`;

    new BucketDeployment(this, id, {
      sources: [
        Source.asset(path.join(__dirname, '../../../app/build')),
        Source.jsonData(
          'appsettings.json',
          new AppSettings(
            new Date(),
            props.applicationStackProps.domain,
            props.applicationStackProps.subDomain,
            apiUrl,
            props.applicationStackProps.aspNetCoreEnvironment,
            props.applicationStackProps.stackName ?? ''
          )
        ),
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
