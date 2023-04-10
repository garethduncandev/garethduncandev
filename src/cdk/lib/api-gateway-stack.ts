import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
  HttpRoute,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ApiGatewayStackProps extends NestedStackProps {
  dockerImageLambdaFunction: DockerImageFunction;
  rootStackName: string;
  allowOrigins: string[];
  allowHeaders: string[];
}

export class ApiGatewayStack extends NestedStack {
  public readonly httpApi: HttpApi;

  public constructor(
    scope: Construct,
    nestedStackName: string,
    apiGatewayStackProps: ApiGatewayStackProps
  ) {
    super(scope, nestedStackName, apiGatewayStackProps);

    // create http api
    this.httpApi = this.createHttpApi(apiGatewayStackProps);

    this.createHttpApiDockerImageFunctionIntegration(
      nestedStackName,
      this.httpApi,
      apiGatewayStackProps.dockerImageLambdaFunction
    );
  }

  private createHttpApiDockerImageFunctionIntegration(
    stackName: string,
    httpApi: HttpApi,
    apiHandler: DockerImageFunction
  ): HttpRoute[] {
    return httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [HttpMethod.ANY],
      integration: new HttpLambdaIntegration(
        `${stackName}-http-api-integration`,
        apiHandler
      ),
    });
  }

  private createHttpApi(apiGatewayStackProps: ApiGatewayStackProps): HttpApi {
    return new HttpApi(this, `http-api`, {
      apiName: apiGatewayStackProps.rootStackName,
      corsPreflight: {
        allowOrigins: apiGatewayStackProps.allowOrigins,
        allowHeaders: apiGatewayStackProps.allowHeaders,
        allowMethods: [CorsHttpMethod.ANY],
      },
    });
  }
}
