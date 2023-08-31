import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { Construct } from 'constructs/lib/construct';

export class HttpApiGateway extends Construct {
  public readonly httpApi: HttpApi;

  public constructor(scope: Construct, id: string) {
    super(scope, id);

    this.httpApi = new HttpApi(this, id);
  }
}
