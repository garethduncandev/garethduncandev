import { RemovalPolicy } from 'aws-cdk-lib';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs/lib/construct';

export class UiBucketProps {
  public constructor(
    public readonly originAccessIdentity: OriginAccessIdentity
  ) {}
}

export class UiBucket extends Construct {
  public readonly bucket: Bucket;

  public constructor(scope: Construct, id: string, props: UiBucketProps) {
    super(scope, id);

    this.bucket = new Bucket(this, id, {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      accessControl: BucketAccessControl.PRIVATE,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    this.bucket.grantRead(props.originAccessIdentity);
  }
}
