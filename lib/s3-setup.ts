import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class S3Setup extends Construct  {
  public readonly bucket: s3.Bucket;


    constructor(scope: Construct, id: string, bucketName: string) {
        super(scope, id);

      this.bucket = new s3.Bucket(this, bucketName, {
      bucketName: bucketName,
      publicReadAccess: false,
      cors: [{
        allowedHeaders: ["*"],
        allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.GET],
        allowedOrigins: ['http://localhost:3000'],
        //maxAge: 3000
      }]
    });

  const user = new iam.User(this, 'MyAppUser');
  user.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));
     user.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));
     user.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
  const policy = new iam.PolicyStatement({
  actions: ['s3:*'],
  resources: [this.bucket.bucketArn],
});


user.addToPolicy(policy);

  }
  
}