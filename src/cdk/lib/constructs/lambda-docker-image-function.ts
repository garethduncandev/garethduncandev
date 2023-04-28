import { Duration } from 'aws-cdk-lib';
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs/lib/construct';
import path = require('path');

export interface LambdaDockerImageFunctionProps {
  functionName: string;
  apiDefaultMemoryAllocation: number;
  timeout: number;
  aspNetCoreEnvironment: string;
}

export class LambdaDockerImageFunction extends Construct {
  public readonly dockerImageFunction: DockerImageFunction;

  public constructor(
    scope: Construct,
    id: string,
    props: LambdaDockerImageFunctionProps
  ) {
    super(scope, id);

    const code = DockerImageCode.fromImageAsset(
      path.join(
        __dirname,
        '../../../api/src/WebUI/bin/Release/net7.0/linux-x64/publish'
      )
    );

    this.dockerImageFunction = new DockerImageFunction(
      this,
      props.functionName,
      {
        functionName: props.functionName,
        code: code,
        memorySize: props.apiDefaultMemoryAllocation,
        timeout: Duration.seconds(props.timeout),
        environment: {
          ASPNETCORE_ENVIRONMENT: props.aspNetCoreEnvironment,
        },
      }
    );
  }
}
