import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

export interface ApplicationStackProps extends cdk.StackProps {
  domain: string;
  subDomain: string | undefined;
  aspNetCoreEnvironment: string;
  robotsNoIndex: boolean;
}

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, props);
  }
}
