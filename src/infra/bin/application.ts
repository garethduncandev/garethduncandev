#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ApplicationStack } from '../lib/application-stack';

const app = new cdk.App();

const sandboxName = app.node.tryGetContext('SANDBOX_NAME');

if (sandboxName) {
  new ApplicationStack(app, `GarethDuncanDev-${sandboxName}`, {
    domain: 'garethduncan.dev',
    subDomain: sandboxName,
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
