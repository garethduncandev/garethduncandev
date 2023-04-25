import * as cdk from 'aws-cdk-lib';
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

// nested stacks
import { CfnParameter } from 'aws-cdk-lib';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { AppVariables } from '../bin/appVariables';

export interface ChosenDeploymentStackProps extends cdk.StackProps {
  appVariables: AppVariables;
}

export class DnsSwitchStack extends cdk.Stack {
  public constructor(
    scope: Construct,
    rootStackName: string,
    props: ChosenDeploymentStackProps
  ) {
    super(scope, rootStackName, props);

    const environmentName = new CfnParameter(this, 'environmentName', {
      type: 'String',
      description:
        'The name of the Amazon S3 bucket where uploaded files will be stored.',
    });

    const deploymentName = new CfnParameter(this, 'deploymentName', {
      type: 'String',
      description:
        'The name of the Amazon S3 bucket where uploaded files will be stored.',
    });

    const aRecordName = new CfnParameter(this, 'aRecordName', {
      type: 'String',
      description: 'The name aRecord value',
    });

    const hostedZone = this.getHostedZone(
      this,
      props.appVariables.CDK_HOSTED_ZONE_ID,
      props.appVariables.CDK_DOMAIN
    );

    const recordName = aRecordName.valueAsString
      .replace('{environment}', environmentName.valueAsString)
      .replace('{domainName}', deploymentName.valueAsString);

    const cloudFrontDistributionIdExportName = `${props.appVariables.CDK_APP_NAME}-${environmentName.valueAsString}-${deploymentName.valueAsString}-cloudfront-cloudFrontDistributionId`;
    const cloudFrontDistributionId = cdk.Fn.importValue(
      cloudFrontDistributionIdExportName
    );

    const cloudFrontDistributionDomainNameExportName = `${props.appVariables.CDK_APP_NAME}-${environmentName.valueAsString}-${deploymentName.valueAsString}-cloudfront-cloudFrontDistributionId`;
    const cloudFrontDistributionDomainName = cdk.Fn.importValue(
      cloudFrontDistributionDomainNameExportName
    );

    const distribution = Distribution.fromDistributionAttributes(
      this,
      'distribution',
      {
        distributionId: cloudFrontDistributionId,
        domainName: cloudFrontDistributionDomainName,
      }
    );

    new ARecord(this, `${rootStackName}-alias-record`, {
      recordName: recordName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: hostedZone,
    });

    // create dns record
  }

  private getHostedZone(
    scope: Construct,
    hostedZoneId: string,
    domain: string
  ): IHostedZone {
    return HostedZone.fromHostedZoneAttributes(scope, 'Zone', {
      hostedZoneId: hostedZoneId,
      zoneName: domain,
    });
  }
}
