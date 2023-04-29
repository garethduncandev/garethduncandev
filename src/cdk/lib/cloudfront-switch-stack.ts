import * as cdk from 'aws-cdk-lib';
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

// nested stacks
import { ApplicationOptions } from '../bin/application-options';
import { EnvironmentOptionsModel } from '../bin/environment-options';

import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { CloudFrontResponseHeadersPolicy } from './constructs/cloudfront-response-headers-policy';
import { UiDistribution } from './constructs/ui-distribution';
import { UiDistributionHttpApiOrigin } from './constructs/ui-distribution-add-http-api';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';

export interface CloudFrontSwitchStackProps extends cdk.StackProps {
  applicationOptions: ApplicationOptions;
  environmentOptions: EnvironmentOptionsModel;
  domainName: string;
  bucketsToHaveAccess: Bucket[];
}

export class CloudFrontSwitchStack extends cdk.Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: CloudFrontSwitchStackProps
  ) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: props.applicationOptions.CDK_HOSTED_ZONE_ID,
      zoneName: props.applicationOptions.CDK_DOMAIN,
    });

    const responseHeadersPolicyCloudFrontUi =
      new CloudFrontResponseHeadersPolicy(
        this,
        `response-headers-policy-${id}-cloud-front-ui`,
        {
          nonIndex: props.environmentOptions.robotsNoIndex,
        }
      );

    const responseHeadersPolicyHttpApi = new CloudFrontResponseHeadersPolicy(
      this,
      `response-headers-policy-${id}-http-api`,
      {
        nonIndex: props.environmentOptions.robotsNoIndex,
      }
    );

    // get blue - green from params
    const color = new cdk.CfnParameter(this, 'color', {
      description: 'parameter of type String',
      type: 'String',
    }).valueAsString; // get the value of the parameter as string

    // get httpApiGatewayId from cross reference
    const rootStackName = `${props.applicationOptions.CDK_APP_NAME}-${props.environmentOptions.environmentName}-${color}`;
    const httpApiId = cdk.Fn.importValue(`${rootStackName}-http-api-id`);

    const httpApi = HttpApi.fromHttpApiAttributes(this, `${id}-http-api`, {
      httpApiId: httpApiId,
    });

    const s3Origin = `${props.applicationOptions.CDK_APP_NAME}-${props.environmentOptions.environmentName}-${color}`;
    const s3BucketOrigin = Bucket.fromBucketName(
      this,
      `${id}-bucket`,
      s3Origin
    );

    const originAccessIdentity = new OriginAccessIdentity(this, `OAI`, {
      comment: `created-by-${id}-${props.domainName}-cdk-OAI`,
    });

    props.bucketsToHaveAccess.forEach((bucket) => {
      bucket.grantRead(originAccessIdentity);
    });

    // props.uiBucket.grantRead(originAccessIdentity);

    const distribution = new UiDistribution(this, 'ui-distribution-switch', {
      cloudFrontDomainCertificateArn:
        props.applicationOptions.CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN,
      hostedZone: hostedZone,
      domainName: props.domainName,
      uiBucket: s3BucketOrigin,
      noIndex: props.environmentOptions.robotsNoIndex,
      removalPolicy: props.environmentOptions.removalPolicy,
      responseHeadersPolicy:
        responseHeadersPolicyCloudFrontUi.responseHeadersPolicy,
      originAccessIdentity: originAccessIdentity,
    });

    new UiDistributionHttpApiOrigin(
      this,
      'ui-distribution-http-api-origin-cloud-front-switch',
      {
        httpApi: httpApi,
        httpApiRegion: props.applicationOptions.CDK_DEFAULT_REGION,
        distribution: distribution.distribution,
        responseHeadersPolicy:
          responseHeadersPolicyHttpApi.responseHeadersPolicy,
      }
    );
  }
}
