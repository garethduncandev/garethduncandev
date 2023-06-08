import { CorsHttpMethod, HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs/lib/construct';
import { ApplicationStackOptions } from '../../bin/application-stack-options';

export class HttpApiGatewayProps {
  public constructor(
    public readonly apiName: string,
    public readonly allowOrigins: string[],
    public readonly applicationStackOptions: ApplicationStackOptions
  ) {}
}

export class HttpApiGateway extends Construct {
  public readonly httpApi: HttpApi;

  public constructor(scope: Construct, id: string, props: HttpApiGatewayProps) {
    super(scope, id);

    this.httpApi = new HttpApi(this, `http-api-${id}`, {
      apiName: props.apiName,
      createDefaultStage: true,
      corsPreflight: {
        allowOrigins: props.allowOrigins,
        allowHeaders: ['*'],
        allowMethods: [CorsHttpMethod.ANY],
      },
    });

    new CfnOutput(this, `http-api-id-export-${id}`, {
      value: this.httpApi.apiId,
      description: 'http api id',
      exportName: `${props.applicationStackOptions.applicationStackName}-http-api-id`,
    });
  }
}
