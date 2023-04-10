#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { RootStack, RootStackProps } from '../lib/root-stack';
import { EnvironmentVariables } from './environmentVariables';

// load environment variables if .env file is present
dotenv.config();

const app = new cdk.App();

const environmentVariables = parseEnvironmentVariables();

const rootStackName = `${environmentVariables.CDK_APP_NAME}-${environmentVariables.CDK_ENVIRONMENT}-${environmentVariables.CDK_ENVIRONMENT_COLOR}`;

const rootStackProps: RootStackProps = {
  environmentVariables: environmentVariables,
};

new RootStack(app, rootStackName, rootStackProps);

function parseEnvironmentVariables(): EnvironmentVariables {
  return {
    CDK_ROBOTS_NO_INDEX: process.env.CDK_ROBOTS_NO_INDEX === 'true',
    CDK_APP_NAME: process.env.CDK_APP_NAME ?? '',
    CDK_ENVIRONMENT: process.env.CDK_ENVIRONMENT ?? '',
    CDK_ENVIRONMENT_COLOR: process.env.CDK_ENVIRONMENT_COLOR ?? '',
    CDK_DOMAIN: process.env.CDK_DOMAIN ?? '',
    CDK_ABSOLUTE_DOMAIN: process.env.CDK_ABSOLUTE_DOMAIN ?? '',
    CDK_HOSTED_ZONE_ID: process.env.CDK_HOSTED_ZONE_ID ?? '',
    CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN:
      process.env.CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN ?? '',
    CDK_REMOVAL_POLICY: cdk.RemovalPolicy.DESTROY,
    CDK_DEFAULT_ACCOUNT: process.env.CDK_DEFAULT_ACCOUNT ?? '',
    CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION ?? '',
    CDK_API_TIMEOUT: process.env.CDK_API_TIMEOUT
      ? parseInt(process.env.CDK_API_TIMEOUT)
      : 0,
    CDK_API_DEFAULTMEMORYALLOCATION: process.env.CDK_API_DEFAULTMEMORYALLOCATION
      ? parseInt(process.env.CDK_API_DEFAULTMEMORYALLOCATION)
      : 0,
    CDK_API_CORS_ALLOWORIGINS: JSON.parse(
      process.env.CDK_API_CORS_ALLOWORIGINS ?? '[]'
    ),
    CDK_API_CORS_ALLOWHEADERS: JSON.parse(
      process.env.CDK_API_CORS_ALLOWHEADERS ?? '[]'
    ),

    CDK_API_IMAGE_ASSET_DIRECTORY:
      process.env.CDK_API_IMAGE_ASSET_DIRECTORY ?? '',
  };
}
