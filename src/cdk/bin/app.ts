#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';

import { ApplicationStack } from '../lib/application-stack';

// load environment variables if .env file is present
dotenv.config();

const app = new cdk.App();

// for each environment create 2 stacks, one for blue and one for green
new ApplicationStack(app, 'garethduncandev-dev', {
  domain: 'garethduncan.dev',
  subDomain: 'dev',
  robotsNoIndex: true,
  aspNetCoreEnvironment: 'Development',
});
