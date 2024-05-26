// Import the required AWS SDK clients and commands for Node.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from 'nanoid';

// Set the AWS region
//const REGION = "us-east-2"; 
//const TABLE_NAME = "__Table_name__"; // taken from environment variable
const TABLE_NAME = process.env.TABLE_NAME;


// Create an Amazon DynamoDB service client object
const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
  const { inputText, inputFilePath } = JSON.parse(event.body);
  const item = {
    id: nanoid(), // Generates a unique ID
    input_text: inputText,
    input_file_path: inputFilePath,
  };

  try {
    const data = await ddbClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));
    return { statusCode: 200, body: JSON.stringify({ message: "Data inserted successfully", item }) };
  } catch (err) {
    console.error("Error", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Failed to insert data", error: err }) };
  }
};
