import * as cdk from 'aws-cdk-lib';
import { NestedStackProps, RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { HostedZone, IHostedZone } from 'aws-cdk-lib/aws-route53';
import {
  BlockPublicAccess,
  Bucket,
  HttpMethods,
  IBucket,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AppStack } from './app-stack';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// Mapped to .env
export interface EnvironmentStackProps extends StackProps {
  environment: string;
  color: string;
  domain: string;
  hostedZoneId: string;
  cloudFrontDomainCertificateArn: string;
  appName: string;
  removalPolicy: RemovalPolicy;
  bucketName: string;
  absoluteDomainName: string;
  robotsNoIndex: boolean;
}

export interface RootNestedStackProps extends NestedStackProps {
  environmentStackProps: EnvironmentStackProps;
  bucket: IBucket;
  hostedZone: IHostedZone;
}

export class RootStack extends cdk.Stack {
  public constructor(
    scope: Construct,
    stackName: string,
    props: EnvironmentStackProps
  ) {
    super(scope, stackName, props);

    const hostedZone = this.getHostedZone(props.hostedZoneId, props.domain);

    // for cloudfront hosting and any storage for the api
    const bucket = this.createBucket(props.bucketName, props.removalPolicy);

    const rootNestedStackProps = {
      environmentStackProps: props,
      bucket: bucket,
      hostedZone: hostedZone,
    } as RootNestedStackProps;

    new AppStack(this, `${stackName}-app`, rootNestedStackProps);
  }

  private createBucket(
    bucketName: string,
    removalPolicy: RemovalPolicy
  ): IBucket {
    return new Bucket(this, `${bucketName}-bucket`, {
      removalPolicy: removalPolicy,
      bucketName: bucketName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });
  }

  private getHostedZone(hostedZoneId: string, domain: string): IHostedZone {
    return HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: hostedZoneId,
      zoneName: domain,
    });
  }
}
