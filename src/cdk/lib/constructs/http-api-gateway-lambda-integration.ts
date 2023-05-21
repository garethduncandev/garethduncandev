import { HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs/lib/construct';

export class HttpApiGatewayLambdaIntegrationProps {
  public constructor(
    public readonly httpApi: HttpApi,
    public readonly dockerImageFunction: DockerImageFunction
  ) {}
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
      integration: new HttpLambdaIntegration(id, props.dockerImageFunction),
    });
  }
}
