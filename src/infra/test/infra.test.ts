import * as cdk from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import { ApplicationStack } from '../lib/application-stack';

test('Stack creates successfully', () => {
  const app = new cdk.App();
  const stack = new ApplicationStack(app, 'TestStack', {
    domain: 'example.com',
    subDomain: 'dev',
    aspNetCoreEnvironment: 'Development',
    robotsNoIndex: true,
    contentSecurityPolicy: "default-src 'none'",
  });
  Template.fromStack(stack);
});
