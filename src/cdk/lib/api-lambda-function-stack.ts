import { Duration, NestedStack, NestedStackProps } from 'aws-cdk-lib';
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import * as path from 'path';
import { EnvironmentVariables } from '../bin/environmentVariables';

export interface ApiLambdaStackProps extends NestedStackProps {
  rootStackName: string;
  environmentVariables: EnvironmentVariables;
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
      apiStackProps.environmentVariables.CDK_API_IMAGE_ASSET_DIRECTORY
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
      memorySize: props.environmentVariables.CDK_API_DEFAULTMEMORYALLOCATION,
      timeout: Duration.seconds(props.environmentVariables.CDK_API_TIMEOUT),
      environment: {
        ASPNETCORE_ENVIRONMENT: 
        
          props.environmentVariables.CDK_API_ASPNETCORE_ENVIRONMENT,
   
          
      },
    });
  }
}
