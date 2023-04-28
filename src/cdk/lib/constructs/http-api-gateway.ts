import { CorsHttpMethod, HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Construct } from 'constructs/lib/construct';

export interface HttpApiGatewayProps {
  apiName: string;
  allowOrigins: string[];
}

export class HttpApiGateway extends Construct {
  public readonly httpApi: HttpApi;

  public constructor(scope: Construct, id: string, props: HttpApiGatewayProps) {
    super(scope, id);

    this.httpApi = new HttpApi(this, `http-api`, {
      apiName: props.apiName,
      corsPreflight: {
        allowOrigins: props.allowOrigins,
        allowHeaders: ['*'],
        allowMethods: [CorsHttpMethod.ANY],
      },
    });
  }
}
