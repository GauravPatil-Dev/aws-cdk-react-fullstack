import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class ApiGatewaySetup extends Construct {
  constructor(scope: Construct, id: string, lambdas: { [key: string]: lambda.IFunction }) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'MyApi', {
      endpointTypes: [apigateway.EndpointType.REGIONAL]
    });

    // Loop through each lambda function passed and create an API method based on configuration
    for (const [path, lambdaFunction] of Object.entries(lambdas)) {
    console.log(`Adding API method for ${path}`);
      const resource = api.root.addResource(path);
      this.addMethod(resource, 'POST', lambdaFunction); // Default to adding POST

      if (path === 'DataHandler') {
        this.addMethod(resource, 'GET', lambdaFunction); // Add GET additionally for dataHandler
      }

      // Add CORS only once per resource
      this.addCorsPreflight(resource);

      const joinUrl = (baseUrl: string, path: string): string => {
        return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
      };
  
      // Use the utility function to create the full API endpoint
      const apiUrl = joinUrl(api.url, resource.path);
  
      // Create an output for each endpoint
      new cdk.CfnOutput(this, `APIEndpoint-${path}`, {
        value: apiUrl,
        description: `API endpoint for ${path}`
      });
    }
  }

  private addMethod(resource: apigateway.IResource, methodType: string, lambdaFunction: lambda.IFunction) {
    resource.addMethod(methodType, new apigateway.LambdaIntegration(lambdaFunction), {
      methodResponses: [{  // Method response for CORS
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true
        }
      }],
      authorizationType: apigateway.AuthorizationType.NONE,
    });
  }

  private addCorsPreflight(resource: apigateway.IResource) {
    resource.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: ['*'],
    });
  }
}