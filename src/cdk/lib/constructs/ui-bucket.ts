import { RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs/lib/construct';

export interface UiBucketProps {
  bucketName: string;
  removalPolicy: RemovalPolicy;
}

export class UiBucket extends Construct {
  public readonly bucket: Bucket;

  public constructor(scope: Construct, id: string, props: UiBucketProps) {
    super(scope, id);

    this.bucket = new Bucket(this, id, {
      removalPolicy: props.removalPolicy,
      autoDeleteObjects: props.removalPolicy === RemovalPolicy.DESTROY,
      bucketName: props.bucketName,
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
}
