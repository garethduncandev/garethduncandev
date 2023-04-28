export class ApplicationOptions {
  public constructor(
    public CDK_DEFAULT_ACCOUNT: string,
    public CDK_DEFAULT_REGION: string,
    public CDK_HOSTED_ZONE_ID: string,
    public CDK_CLOUD_FRONT_DOMAIN_CERTIFICATE_ARN: string,
    public CDK_DOMAIN: string,
    public CDK_APP_NAME: string,
    public CDK_UI_LOCALHOST_URL: string
  ) {}
}
