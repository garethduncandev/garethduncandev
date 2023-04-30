#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as environmentOptionsJson from '../environments.json';

import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import {
  ApplicationStack,
  ApplicationStackProps,
} from '../lib/application-stack';
import {
  CloudFrontSwitchStack,
  CloudFrontSwitchStackProps,
} from '../lib/cloudfront-switch-stack';
import { SecurityStack } from '../lib/security-stack';
import { ApplicationOptions } from './application-options';
import { ApplicationStackOptions } from './application-stack-options';
import { EnvironmentOptionsModel } from './environment-options';

// load environment variables if .env file is present
dotenv.config();

const app = new cdk.App();

// load application options from environment variables
const applicationOptions = parseApplicationOptions();

// load individual environment options from environments.json
const allEnvironmentOptions = parseEnvironmentOptions();

const environmentColors: ('blue' | 'green')[] = ['blue', 'green'];

// for each environment create 2 stacks, one for blue and one for green
for (const environmentOptions of allEnvironmentOptions) {
  const securityStack = new SecurityStack(
    app,
    `${applicationOptions.CDK_APP_NAME}-${environmentOptions.environmentName}-security`
  );

  // a blue and a green stack allows for zero downtime deployments with the help of a lambda edge function
  environmentColors.forEach((color) => {
    createApplicationStack(
      new ApplicationStackOptions(
        color,
        applicationOptions,
        environmentOptions
      ),
      securityStack.originAccessIdentity
    );
  });

  // create special cloudfront stack to use either blue or green origins
  createCloudFrontSwitchStack(
    environmentOptions,
    securityStack.originAccessIdentity
  );
}

function createApplicationStack(
  options: ApplicationStackOptions,
  originAccessIdentity: OriginAccessIdentity
): void {
  const props: ApplicationStackProps = {
    applicationStackOptions: options,
    originAccessIdentity: originAccessIdentity,
  };

  new ApplicationStack(app, options.applicationStackName, props);
}

function createCloudFrontSwitchStack(
  environmentOptions: EnvironmentOptionsModel,
  originAccessIdentity: OriginAccessIdentity
): void {
  // create a stack for the lambda edge function that will allow is to switch between blue and green stacks
  const domainName = environmentOptions.domainNameFormat
    .replace('{environmentName}', environmentOptions.environmentName)
    .replace('{domainName}', applicationOptions.CDK_DOMAIN);

  const cloudFrontSwitchStack: CloudFrontSwitchStackProps = {
    applicationOptions: applicationOptions,
    environmentOptions: environmentOptions,
    domainName: domainName,
    originAccessIdentity: originAccessIdentity,
  };

  // create cloudfront lambda edge function stack
  const id = `${applicationOptions.CDK_APP_NAME}-${environmentOptions.environmentName}`;
  new CloudFrontSwitchStack(app, id, cloudFrontSwitchStack);
}

function parseApplicationOptions(): ApplicationOptions {
  return {
    CDK_APP_NAME: process.env.CDK_APP_NAME ?? '',
    CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN:
      process.env.CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN ?? '',
    CDK_DEFAULT_ACCOUNT: process.env.CDK_DEFAULT_ACCOUNT ?? '',
    CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION ?? '',
    CDK_DOMAIN: process.env.CDK_DOMAIN ?? '',
    CDK_HOSTED_ZONE_ID: process.env.CDK_HOSTED_ZONE_ID ?? '',
    CDK_UI_LOCALHOST_URL: process.env.CDK_UI_LOCALHOST_URL ?? '',
  };
}

function parseEnvironmentOptions(): EnvironmentOptionsModel[] {
  return environmentOptionsJson as EnvironmentOptionsModel[];
}
