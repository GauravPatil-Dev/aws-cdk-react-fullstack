import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class LambdaSetup extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly presignLambda: lambda.Function;
  public readonly dataHandlerLambda: lambda.Function;
  public readonly uploaderLambda: lambda.Function;
  public readonly EC2Lambda: cdk.aws_lambda.Function;

  constructor(scope: Construct, id: string, bucketName: string, dynamoTable: dynamodb.Table, bucket: s3.Bucket) {
    super(scope, id);

    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
      ],
    });


    // First Lambda Function: Generates presigned URLs for S3
    this.presignLambda = new lambda.Function(this, 'PresignUrlFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda/presignurl/'),
      handler: 'index.handler',
      environment: {
        BUCKET_NAME: bucketName,
      },
      role: lambdaRole,
    });

    // Second Lambda Function: this function interacts with DynamoDB
    this.dataHandlerLambda = new lambda.Function(this, 'DataHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset('lambda/datahandler/'),
      handler: 'index.handler',
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        BUCKET_NAME: bucketName,
      },
      role: lambdaRole,
    });

    // Permissions to allow the Lambda functions to interact with DynamoDB
    dynamoTable.grantReadWriteData(lambdaRole);

    const unifiedRole = new iam.Role(this, 'UnifiedRole', {
    assumedBy: new iam.CompositePrincipal(
      new iam.ServicePrincipal('lambda.amazonaws.com'),
      new iam.ServicePrincipal('ec2.amazonaws.com')
    ),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMFullAccess'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaDynamoDBExecutionRole'),
    ],
  }); 
  
  // Create an instance profile and associate it with the ec2InstanceRole
  const ec2InstanceProfile = new iam.CfnInstanceProfile(this, 'EC2InstanceProfile1', {
    instanceProfileName: 'EC2InstanceProfile1',
    roles: [unifiedRole.roleName],
  });

    unifiedRole.addToPolicy(new iam.PolicyStatement({
    actions: ['iam:PassRole'],
    resources: [unifiedRole.roleArn],
  }));
  
  unifiedRole.addToPolicy(new iam.PolicyStatement({
    resources: ['*'],
    actions: ['ec2:RunInstances', 'ec2:TerminateInstances', 'iam:PassRole', 'iam:CreateRole', 'iam:AttachRolePolicy', 'iam:CreateInstanceProfile', 'iam:AddRoleToInstanceProfile', 'iam:GetInstanceProfile'],
  }));

      // Lambda Function
      this.EC2Lambda = new lambda.Function(this, 'EC2InstanceStream', {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambda/ec2instance/'),
        handler: 'index.handler',
        timeout: cdk.Duration.seconds(300),
        environment: {
          TABLE_NAME: dynamoTable.tableName,
          BUCKET_NAME: bucketName,
          EC2_INSTANCE_PROFILE_ARN: ec2InstanceProfile.attrArn, 
        },
        role: unifiedRole,
      });
  
      this.EC2Lambda.addEventSource(new DynamoEventSource(dynamoTable, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        batchSize: 5,
        bisectBatchOnError: true,
        retryAttempts: 1
      }));   
  }
}
