import { RemovalPolicy } from 'aws-cdk-lib';

export class EnvironmentOptionsModel {
  public constructor(
    public environmentName: string,
    public removalPolicy: RemovalPolicy,
    public robotsNoIndex: boolean,
    public apiTimeout: number,
    public apiDefaultMemoryAllocation: number,
    public allowLocalHostAccess: boolean,
    public domainName: string,
    public deployments: DeploymentStackOptionsModel[]
  ) {}
}

export class DeploymentStackOptionsModel {
  public constructor(
    public deploymentName: string,
    public aspNetCoreEnvironment: string,
    public aspNetCoreEnvironmentDeploymentName: string
  ) {}
}
