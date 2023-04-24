import { AppVariables } from './appVariables';
import {
  DeploymentStackOptionsModel,
  EnvironmentOptionsModel,
} from './environment-deployment';

export class StackOptions {
  public constructor(
    public appVariables: AppVariables,
    public environment: EnvironmentOptionsModel,
    public deploymentOptions: DeploymentStackOptionsModel
  ) {}

  public get fullDomainName(): string {
    return `${this.environment.environmentName}-${this.deploymentOptions.deploymentName}.${this.appVariables.CDK_DOMAIN}`;
  }

  public get apiAllowedOrigins(): string[] {
    const origins = [
      `https://${this.fullDomainName}`,
      `https://${this.appVariables.CDK_DOMAIN}`,
    ];

    if (this.environment.allowLocalHostAccess) {
      origins.push(this.appVariables.CDK_UI_LOCALHOST_URL);
    }

    return origins;
  }
}
