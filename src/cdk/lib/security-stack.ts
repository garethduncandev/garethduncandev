import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// nested stacks

import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';

export class SecurityStack extends cdk.Stack {
  public readonly originAccessIdentity: OriginAccessIdentity;

  public constructor(scope: Construct, id: string) {
    super(scope, id);

    // return this for the applications stack to use
    this.originAccessIdentity = new OriginAccessIdentity(this, `OAI`, {
      comment: `created-by-${id}-cdk-OAI`,
    });
  }
}
