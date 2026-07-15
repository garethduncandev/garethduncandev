#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { ApplicationStack } from '../lib/application-stack';
import { GitHubOidcStack } from '../lib/github-oidc-stack';

const app = new cdk.App();

new GitHubOidcStack(app, 'GarethDuncanDev-GitHubOidc', {
  gitHubOrg: 'garethduncandev',
  gitHubRepo: 'garethduncandev',
});

const prEnvironmentName = app.node.tryGetContext('PR_ENVIRONMENT_NAME');

if (prEnvironmentName) {
  new ApplicationStack(app, `GarethDuncanDev-${prEnvironmentName}`, {
    domain: 'garethduncan.dev',
    subDomain: prEnvironmentName,
    robotsNoIndex: true,
    aspNetCoreEnvironment: 'Development',
  });
}

new ApplicationStack(app, 'GarethDuncanDev-dev', {
  domain: 'garethduncan.dev',
  subDomain: 'dev',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'Development',
});

new ApplicationStack(app, 'GarethDuncanDev-blue', {
  domain: 'garethduncan.dev',
  subDomain: 'blue',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'ProductionBlue',
});

new ApplicationStack(app, 'GarethDuncanDev-green', {
  domain: 'garethduncan.dev',
  subDomain: 'green',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'ProductionGreen',
});

new ApplicationStack(app, 'GarethDuncanDev-prod', {
  domain: 'garethduncan.dev',
  subDomain: undefined,
  robotsNoIndex: false,
  aspNetCoreEnvironment: 'Production',
});
