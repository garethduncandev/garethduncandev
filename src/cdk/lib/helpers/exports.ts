import { CfnOutput, Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ExportHelper {
  public static createExport(
    scope: Construct,
    rootStackName: string,
    nestedStackName: string,
    value: string,
    description: string,
    exportName: string
  ): void {
    const fullExportName = `${rootStackName}-${nestedStackName}-${exportName}`;
    new CfnOutput(scope, fullExportName, {
      value: value,
      description: description,
      exportName: fullExportName,
    });
  }

  public static readExport(stackName: string, exportName: string): string {
    const fullExportName = `${stackName}-${exportName}`;
    const value = Fn.importValue(fullExportName);
    return value;
  }
}
