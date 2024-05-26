import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { S3Setup } from './s3-setup';
import { LambdaSetup } from './lambda-setup';
import { ApiGatewaySetup } from './api-gateway-setup';
import { DynamoDBSetup } from './dynamodb-setup';
import { uploadFile } from './upload';

export class mainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    try {
      const stackName = this.stackName;
      const accountId = process.env.CDK_DEFAULT_ACCOUNT || '1234';
      console.log(`Deploying to stack: ${stackName} in account: ${accountId}`);
      const bucketName = `${stackName.toLowerCase()}-${accountId}`;
      console.log(`Bucket name: ${bucketName}`);

      const s3Setup = new S3Setup(this, 'S3Setup', bucketName);
      const dynamoSetup = new DynamoDBSetup(this, 'DynamoDBSetup');
      const lambdaSetup = new LambdaSetup(this, 'LambdaSetup', bucketName, dynamoSetup.table, s3Setup.bucket);

      new ApiGatewaySetup(this, 'ApiGatewaySetup', {
        'PresignUrlFunction': lambdaSetup.presignLambda,
        'DataHandler': lambdaSetup.dataHandlerLambda,
      });
      uploadFile(bucketName);

    } catch (error) {
      console.error(`Error setting up the Main stack: ${error}`);
    }
  }
}
