import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { Aws } from 'aws-cdk-lib/core';

export interface GitHubOidcRepoConfig {
  owner: string;
  repo: string;
  filters: string[];
}

export interface AwsGithubOidcStackProps extends cdk.StackProps {
  repositories: GitHubOidcRepoConfig[];
}

export class AwsGithubOidcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsGithubOidcStackProps) {
    super(scope, id, props);

    const provider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    const deployRole = new iam.Role(this, 'GitHubActionsDeployRole', {
      roleName: 'github-actions-deploy',
      assumedBy: new iam.WebIdentityPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': props.repositories.flatMap(
              r => r.filters.map(f => `repo:${r.owner}/${r.repo}:${f}`)
            ),
          },
        }
      ),
      maxSessionDuration: cdk.Duration.hours(1),
    });

    deployRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [`arn:aws:iam::${Aws.ACCOUNT_ID}:role/cdk-*`],
    }));

    new cdk.CfnOutput(this, 'DeployRoleArn', {
      value: deployRole.roleArn,
    });
  }
}
