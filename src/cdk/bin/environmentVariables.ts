import { RemovalPolicy } from 'aws-cdk-lib';

export class EnvironmentVariables {
  public constructor(
    public CDK_ENVIRONMENT: string,
    public CDK_ENVIRONMENT_COLOR: string,
    public CDK_DOMAIN: string,
    public CDK_ABSOLUTE_DOMAIN: string,
    public CDK_HOSTED_ZONE_ID: string,
    public CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN: string,
    public CDK_APP_NAME: string,
    public CDK_REMOVAL_POLICY: RemovalPolicy,
    public CDK_ROBOTS_NO_INDEX: boolean,
    public CDK_DEFAULT_ACCOUNT: string,
    public CDK_DEFAULT_REGION: string,
    public CDK_API_TIMEOUT: number,
    public CDK_API_DEFAULTMEMORYALLOCATION: number,
    public CDK_API_CORS_ALLOWORIGINS: string[],
    public CDK_API_CORS_ALLOWHEADERS: string[],
    public CDK_API_IMAGE_ASSET_DIRECTORY: string,
    public CDK_UI_OUTPUT_DIRECTORY: string,
    public CDK_API_ASPNETCORE_ENVIRONMENT: string,
    public CDK_API_ASPNETCORE_ENVIRONMENT_COLOR: string
  ) {}
}
