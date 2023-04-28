import { RemovalPolicy } from 'aws-cdk-lib';

export class EnvironmentOptionsModel {
  public constructor(
    public environmentName: string,
    public aspNetCoreEnvironment: string,
    public removalPolicy: RemovalPolicy,
    public robotsNoIndex: boolean,
    public apiTimeout: number,
    public apiDefaultMemoryAllocation: number,
    public allowLocalHostAccess: boolean,
    public domainNameFormat: string
  ) {}
}
