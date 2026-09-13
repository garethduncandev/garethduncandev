import { HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface HttpApiGatewayLambdaIntegrationProps {
  httpApi: HttpApi;
  lambdaFunction: IFunction;
}

export class HttpApiGatewayLambdaIntegration extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: HttpApiGatewayLambdaIntegrationProps
  ) {
    super(scope, id);

    props.httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [HttpMethod.ANY],
      integration: new HttpLambdaIntegration(id, props.lambdaFunction),
    });
  }
}
