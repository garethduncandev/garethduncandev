import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  HttpMethods,
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs/lib/construct';

export class UiBucketProps {
  public constructor(
    public readonly bucketName: string,
    public readonly removalPolicy: RemovalPolicy,
    public readonly applicationStackName: string
  ) {}
}

export class UiBucket extends Construct {
  public readonly bucket: Bucket;

  public constructor(scope: Construct, id: string, props: UiBucketProps) {
    super(scope, id);

    this.bucket = new Bucket(this, id, {
      removalPolicy: props.removalPolicy,
      autoDeleteObjects: props.removalPolicy === RemovalPolicy.DESTROY,
      bucketName: props.bucketName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      accessControl: BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      cors: [
        {
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      websiteIndexDocument: 'app/index.html',
      websiteErrorDocument: 'app/index.html',
      publicReadAccess: true,
    });

    new CfnOutput(this, 'domain-name-export', {
      value: this.bucket.bucketName,
      description: 'bucket name',
      exportName: `${props.applicationStackName}-bucket-name`,
    });
  }
}
