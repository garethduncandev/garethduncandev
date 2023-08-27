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

new ApplicationStack(app, 'garethduncandev-production-blue', {
  domain: 'garethduncan.dev',
  subDomain: 'production-blue',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'ProductionBlue',
});

new ApplicationStack(app, 'garethduncandev-production-green', {
  domain: 'garethduncan.dev',
  subDomain: 'production-green',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'ProductionGreen',
});

new ApplicationStack(app, 'garethduncandev-production', {
  domain: 'garethduncan.dev',
  subDomain: undefined,
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'Production',
});
