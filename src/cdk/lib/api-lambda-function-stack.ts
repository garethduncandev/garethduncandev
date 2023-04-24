import { Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
import { StackOptions } from '../bin/stackOptions';

export interface ApiLambdaStackProps extends NestedStackProps {
  rootStackName: string;
  stackOptions: StackOptions;
}

export class ApiLambdaStack extends NestedStack {
  public readonly dockerImageLambdaFunction: DockerImageFunction;

  public constructor(
    scope: Construct,
    nestedStackName: string,
    apiStackProps: ApiLambdaStackProps
  ) {
    super(scope, nestedStackName, apiStackProps);

    // create docker image function
    const dockerImageCode = this.createDockerImageCodeFromAsset(
      '../../api/src/WebUI/bin/Release/net7.0/linux-x64/publish'
    );

    this.dockerImageLambdaFunction = this.createDockerImageLambdaFunction(
      apiStackProps.rootStackName,
      apiStackProps,
      dockerImageCode
    );
  }

  private createDockerImageCodeFromAsset(
    apiImageAssetDirectory: string
  ): DockerImageCode {
    return DockerImageCode.fromImageAsset(
      path.join(__dirname, apiImageAssetDirectory)
    );
  }

  private createDockerImageLambdaFunction(
    rootStackName: string,
    props: ApiLambdaStackProps,
    apiCode: DockerImageCode
  ): DockerImageFunction {
    const functionName = `${rootStackName}`;
    return new DockerImageFunction(this, functionName, {
      functionName: functionName,
      code: apiCode,
      memorySize: props.stackOptions.environment.apiDefaultMemoryAllocation,
      timeout: Duration.seconds(props.stackOptions.environment.apiTimeout),
      environment: {
        ASPNETCORE_ENVIRONMENT:
          props.stackOptions.deploymentOptions.aspNetCoreEnvironment,
      },
    });
  }
}
