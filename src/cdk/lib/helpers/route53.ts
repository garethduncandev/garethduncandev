import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

export class Route53Helper {
  public static cloudFrontDistributionRoute53ARecord(
    scope: Construct,
    stackName: string,
    hostedZone: IHostedZone,
    recordName: string,
    distribution: Distribution
  ): ARecord {
    return new ARecord(scope, `${stackName}-alias-record`, {
      recordName: recordName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: hostedZone,
    });
  }
}
