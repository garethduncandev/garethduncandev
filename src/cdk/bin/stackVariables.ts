import { AppVariables } from './appVariables';
import { Environment } from './environment';

export class StackVariables {
  public constructor(
    public appVariables: AppVariables,
    public environment: Environment
  ) {}
  public get fullDomainName(): string {
    return `${this.environment.environmentName}-${this.environment.deploymentName}.${this.appVariables.CDK_DOMAIN}`;
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
