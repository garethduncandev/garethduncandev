import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface GitHubOidcStackProps extends cdk.StackProps {
  gitHubOrg: string;
  gitHubRepo: string;
}

export class GitHubOidcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GitHubOidcStackProps) {
    super(scope, id, props);

    const provider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    const deployRole = new iam.Role(this, 'GitHubActionsDeployRole', {
      roleName: 'github-actions-deploy',
      assumedBy: new iam.FederatedPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': [
              `repo:${props.gitHubOrg}/${props.gitHubRepo}:environment:dev`,
              `repo:${props.gitHubOrg}/${props.gitHubRepo}:environment:production`,
              `repo:${props.gitHubOrg}/${props.gitHubRepo}:ref:refs/heads/main`,
            ],
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      maxSessionDuration: cdk.Duration.hours(1),
    });

    // Allow assuming the CDK bootstrap roles (created by cdk bootstrap)
    deployRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [`arn:aws:iam::${this.account}:role/cdk-*`],
    }));

    new cdk.CfnOutput(this, 'DeployRoleArn', {
      value: deployRole.roleArn,
    });
  }
}
