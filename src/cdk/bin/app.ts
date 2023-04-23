#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { RootStack, RootStackProps } from '../lib/root-stack';
import { StackVariables as StackVariables } from './stackVariables';
import { AppVariables } from './appVariables';
import * as environments from '../environments.json';
import { Environment } from './environment';

// load environment variables if .env file is present
dotenv.config();

const app = new cdk.App();

const appVariables = parseAppEnv();

for (const environment of environments as Environment[]) {
  createStackEnvironment(appVariables, environment);
}

function createStackEnvironment(
  appVariables: AppVariables,
  environment: Environment
): void {
  const stackVariables = new StackVariables(appVariables, environment);

  const rootStackName = `${appVariables.CDK_APP_NAME}-${environment.environmentName}-${environment.deploymentName}`;
  const rootStackProps: RootStackProps = {
    stackVariables: stackVariables,
  };

  new RootStack(app, rootStackName, rootStackProps);
}

function parseAppEnv(): AppVariables {
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
