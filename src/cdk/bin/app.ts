#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import * as environmentOptionsJson from '../environments.json';
import {
  DnsSwitchStack,
  ChosenDeploymentStackProps,
} from '../lib/dns-switch-stack';
import { RootStack, RootStackProps } from '../lib/root-stack';
import { AppVariables } from './appVariables';
import {
  DeploymentStackOptionsModel,
  EnvironmentOptionsModel,
} from './environment-deployment';
import { StackOptions } from './stackOptions';

// load environment variables if .env file is present
dotenv.config();

const app = new cdk.App();

const appVariables = parseAppEnv();

const environmentOptions = parseEnvironmentsJson();

// Create stacks for all environment deployments e.g. development-blue, test-green, production-blue
for (const options of environmentOptions) {
  for (const deploymentOptions of options.deployments) {
    createStackEnvironmentDeployment(appVariables, options, deploymentOptions);
  }
}

// Create stack for all environment deployments e.g. development, test, production
for (const options of environmentOptions) {
  createDNSSwitchStack(options, appVariables);
}

function createStackEnvironmentDeployment(
  appVariables: AppVariables,
  environmentOptions: EnvironmentOptionsModel,
  deploymentStackOptions: DeploymentStackOptionsModel
): void {
  const stackOptions = new StackOptions(
    appVariables,
    environmentOptions,
    deploymentStackOptions
  );

  const rootStackName = `${appVariables.CDK_APP_NAME}-${environmentOptions.environmentName}-${deploymentStackOptions.deploymentName}`;
  const rootStackProps: RootStackProps = {
    stackOptions: stackOptions,
  };

  new RootStack(app, rootStackName, rootStackProps);
}

function createDNSSwitchStack(
  environmentOptions: EnvironmentOptionsModel,
  appVariables: AppVariables
): void {
  const stackName = `${appVariables.CDK_APP_NAME}-${environmentOptions.environmentName}`;
  const chosenDeploymentStackProps: ChosenDeploymentStackProps = {
    appVariables: appVariables,
  };

  new DnsSwitchStack(app, stackName, chosenDeploymentStackProps);
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

function parseEnvironmentsJson(): EnvironmentOptionsModel[] {
  return environmentOptionsJson as EnvironmentOptionsModel[];
}
