# Welcome to Your CDK TypeScript Project

This project is a blank template for AWS CDK development using TypeScript. It includes Lambda functions for handling data uploads and interactions with Amazon DynamoDB and S3.

## Getting Started

### Prerequisites
- AWS CLI installed and configured with the appropriate credentials (AWS Access Key, Secret Key, and Region). [Configure AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).
- Node.js and npm installed. [Download Node.js](https://nodejs.org/en/download/).
- AWS CDK installed. If you haven't installed the AWS CDK, run `npm install -g aws-cdk`.

### Project Setup

1. **Clone the Repository**
git clone git@github.com:GauravPatil-Dev/aws-cdk.git
`cd <project-directory>`

2. **Install Dependencies**
Navigate to the project root directory and install npm dependencies:
`npm install`

3. **Install Lambda Dependencies**
Navigate to each Lambda function directory and install its dependencies:
`cd lambda/datahandler`
`npm install`
`cd ../../lambda/ec2instance`
`npm install`
`cd ../../`

To make sure keypair exists 
`bash helper_script/create_keypair.sh`

4. **Bootstrap Your CDK Environment**
Bootstrap the AWS CDK, which sets up the environment for your stack deployment:
`cdk bootstrap`

5. **Deploy the CDK Stack**
Deploy your stack to AWS:
`cdk deploy`


Take note of the outputs from the CDK deployment, particularly `Stack.TableName`.
### Configure Frontend

1. **Update Environment Variables for the Frontend**
- Navigate to the frontend directory and update the `.env` file:
  ```
  cd frontend/
  ```
- Set the API URLs and DynamoDB table name:
  ```
  REACT_APP_API_URL=<PresignUrlFunction endpoint>
  REACT_APP_DYNAMODB_URL=<DataHandler endpoint>
  REACT_APP_S3_BUCKET_NAME=<S3 Bucket Name>
  DYNAMODB_TABLE_NAME=<DynamoDB Table Name from Stack.TableName>
  ```

### Run the Frontend

After configuring the environment variables:
`npm start`

This will start the frontend application. Enter the necessary details on the webpage and click upload to interact with the backend services.
