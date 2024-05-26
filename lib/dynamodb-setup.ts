import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DynamoDBSetup extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new dynamodb.Table(this, 'dynamoDBInputTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 5,
      writeCapacity: 5,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      description: 'The name of the DynamoDB table',
  });

  }
}
