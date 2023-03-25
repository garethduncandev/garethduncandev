import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

export class OriginAccessIdentityHelper {
  public static originAccessIdentity(
    scope: Construct,
    stackName: string
  ): OriginAccessIdentity {
    return new OriginAccessIdentity(scope, `${stackName}-OAI`, {
      comment: `Createdby_${stackName}_cdk-OAI`,
    });
  }
}
