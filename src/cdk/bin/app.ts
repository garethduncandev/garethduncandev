#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';

import { ApplicationStack } from '../lib/application-stack';

const app = new cdk.App();

new ApplicationStack(app, 'garethduncandev-dev', {
  domain: 'garethduncan.dev',
  subDomain: 'dev',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'Development',
});

new ApplicationStack(app, 'garethduncandev-blue', {
  domain: 'garethduncan.dev',
  subDomain: 'blue',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'ProductionBlue',
});

new ApplicationStack(app, 'garethduncandev-green', {
  domain: 'garethduncan.dev',
  subDomain: 'green',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'ProductionGreen',
});

new ApplicationStack(app, 'garethduncandev-prod', {
  domain: 'garethduncan.dev',
  subDomain: undefined,
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'Production',
});
