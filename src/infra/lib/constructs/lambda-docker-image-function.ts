import { Duration } from 'aws-cdk-lib';
import { Architecture, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import path = require('path');

export interface ApiLambdaFunctionProps {
  aspNetCoreEnvironment: string;
}

export class ApiLambdaFunction extends Construct {
  public readonly function: Function;

  public constructor(
    scope: Construct,
    id: string,
    props: ApiLambdaFunctionProps
  ) {
    super(scope, id);

    this.function = new Function(this, 'function', {
      runtime: Runtime.PROVIDED_AL2023,
      architecture: Architecture.X86_64,
      handler: 'bootstrap',
      code: Code.fromAsset(
        path.join(__dirname, '../../../web/api/publish')
      ),
      memorySize: 256,
      timeout: Duration.seconds(30),
      environment: {
        ASPNETCORE_ENVIRONMENT: props.aspNetCoreEnvironment,
      },
    });
  }
}
