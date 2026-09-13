import { RemovalPolicy } from 'aws-cdk-lib';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class UiBucket extends Construct {
  public readonly bucket: Bucket;

  public constructor(scope: Construct, id: string) {
    super(scope, id);

    this.bucket = new Bucket(this, id, {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      accessControl: BucketAccessControl.PRIVATE,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
  }
}
