#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApplicationStack } from '../lib/application-stack';
import { AwsGithubOidcStack } from '../lib/aws-github-oidc-stack';

const app = new cdk.App();

const domain = 'garethduncan.dev';
const sdlcDomain = 'sdlc.garethduncan.dev';
const stackIdPrefix = 'GarethDuncanDev';

const sandboxName = `${app.node.tryGetContext('SANDBOX_NAME')}`;
if (sandboxName) {
  new ApplicationStack(app, `${stackIdPrefix}-${sandboxName}`, {
    domain: sdlcDomain,
    subDomain: sandboxName,
    robotsNoIndex: true,
    aspNetCoreEnvironment: 'Development',
  });
}

new ApplicationStack(app, `${stackIdPrefix}-dev`, {
  domain: sdlcDomain,
  subDomain: 'dev',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'Development',
});

new ApplicationStack(app, `${stackIdPrefix}-blue`, {
  domain: domain,
  subDomain: 'blue',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'ProductionBlue',
});

new ApplicationStack(app, `${stackIdPrefix}-green`, {
  domain: domain,
  subDomain: 'green',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'ProductionGreen',
});

new ApplicationStack(app, `${stackIdPrefix}-prod`, {
  domain: domain,
  subDomain: undefined,
  robotsNoIndex: false,
  aspNetCoreEnvironment: 'Production',
});

new AwsGithubOidcStack(app, 'AwsGithubOidcStack-sdlc', {
  repositories: [
    {
      owner: 'garethduncandev',
      repo: 'garethduncandev',
      filters: [
        'environment:dev',
        'environment:sandbox',
      ],
    },
  ],
});

new AwsGithubOidcStack(app, 'AwsGithubOidcStack-prod', {
  repositories: [
    {
      owner: 'garethduncandev',
      repo: 'garethduncandev',
      filters: [
        'environment:prod',
        'environment:production-blue',
        'environment:production-green',
      ],
    },
  ],
});
