import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createReadStream } from "fs";
import path from 'path';

// Initialize the S3 client
const s3Client = new S3Client({ region: "us-east-2" });

// Function to upload a file to S3
export async function uploadFile(bucketName: string) {
    const fileName = 'script.sh'; // Specify the file to upload
    //const bucketName = 'your-bucket-name';

    const filePath = path.resolve(__dirname, fileName);

    try {
        const fileStream = createReadStream(filePath);

        const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: fileStream,
        };

        const command = new PutObjectCommand(uploadParams);
        const response = await s3Client.send(command);
        console.log("Successfully uploaded file:", response);
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

