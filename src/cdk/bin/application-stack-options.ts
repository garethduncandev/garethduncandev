import { ApplicationOptions } from './application-options';
import { EnvironmentOptionsModel } from './environment-options';

export class ApplicationStackOptions {
  public constructor(
    public color: 'blue' | 'green',
    public applicationOptions: ApplicationOptions,
    public environmentOptions: EnvironmentOptionsModel
  ) {}

  public get applicationStackName(): string {
    return `${this.applicationOptions.CDK_APP_NAME}-${this.environmentOptions.environmentName}-${this.color}`;
  }

  public get fullDomainName(): string {
    return `${this.environmentOptions.environmentName}-${this.color}.${this.applicationOptions.CDK_DOMAIN}`;
  }

  public get apiAllowedOrigins(): string[] {
    const origins = [
      `https://${this.fullDomainName}`,
      `https://${this.applicationOptions.CDK_DOMAIN}`,
      `https://${this.environmentOptions.environmentName}.${this.applicationOptions.CDK_DOMAIN}`,
    ];

    if (this.environmentOptions.allowLocalHostAccess) {
      origins.push(this.applicationOptions.CDK_UI_LOCALHOST_URL);
    }

    return origins;
  }
}
