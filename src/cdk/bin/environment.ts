import { RemovalPolicy } from 'aws-cdk-lib';

export class Environment {
  public constructor(
    public environmentName: string,
    public environmentColor: string,
    public removalPolicy: RemovalPolicy,
    public robotsNoIndex: boolean,
    public apiTimeout: number,
    public apiDefaultMemoryAllocation: number,
    public aspNetCoreEnvironment: string,
    public production: boolean
  ) {}
}
