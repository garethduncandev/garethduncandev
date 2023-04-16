import { AppVariables } from './appVariables';
import { Environment } from './environment';

export class StackVariables {
  public constructor(
    public appVariables: AppVariables,
    public environment: Environment
  ) {}
  public get fullDomainName(): string {
    return `${this.environment.environmentName}-${this.environment.environmentColor}.${this.appVariables.CDK_DOMAIN}`;
  }

  public get apiAllowedOrigins(): string[] {
    return this.environment.production
      ? [
          `https://${this.fullDomainName}`,
          `https://${this.appVariables.CDK_DOMAIN}`,
        ]
      : [
          `https://${this.fullDomainName}`,
          `https://${this.appVariables.CDK_UI_LOCALHOST_URL}`,
        ];
  }
}
