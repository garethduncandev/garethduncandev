#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { EnvironmentStackProps, RootStack } from '../lib/root-stack';

// load environment variables if .env file is present
dotenv.config();

const app = new cdk.App();
const defaultAccount = getEnvironmentVariableValue('CDK_DEFAULT_ACCOUNT');
const defaultRegion = getEnvironmentVariableValue('CDK_DEFAULT_REGION');
const environment = getEnvironmentVariableValue('CDK_ENVIRONMENT');
const color = getEnvironmentVariableValue('CDK_ENVIRONMENT_COLOR');
const appName = getEnvironmentVariableValue('CDK_APP_NAME');
const domain = getEnvironmentVariableValue('CDK_DOMAIN');
const hostedZoneId = getEnvironmentVariableValue('CDK_HOSTED_ZONE_ID');
const cloudFrontDomainCertificateArn = getEnvironmentVariableValue(
  'CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN'
);
const removalPolicy =
  getEnvironmentVariableValue('CDK_REMOVAL_POLICY') === 'DESTROY'
    ? RemovalPolicy.DESTROY
    : RemovalPolicy.RETAIN;
const robotsNoIndex =
  getEnvironmentVariableValue('CDK_ROBOTS_NO_INDEX') === 'true' ? true : false;

const stackName = `${appName}-${environment}-${color}`;

const absoluteDomainName =
  process.env.CDK_ABSOLUTE_DOMAIN ?? `${environment}-${color}.${domain}`;

const rootStackProps: EnvironmentStackProps = {
  environment: environment,
  color: color,
  cloudFrontDomainCertificateArn: cloudFrontDomainCertificateArn,
  appName: appName,
  domain: domain,
  hostedZoneId: hostedZoneId,
  removalPolicy: removalPolicy,
  bucketName: stackName,
  env: {
    account: defaultAccount,
    region: defaultRegion,
  },
  absoluteDomainName: absoluteDomainName,
  robotsNoIndex: robotsNoIndex,
};

new RootStack(app, stackName, rootStackProps);

function getEnvironmentVariableValue(variableName: string): string {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(`${variableName} value is null or undefined`);
  }

  return value;
}
