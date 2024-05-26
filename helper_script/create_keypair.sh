#!/bin/bash
# This script checks for the existence of an EC2 key pair and creates it if it does not exist.

KEY_PAIR="ec2vm"  # Define the key pair name

# Check if the key pair exists using AWS CLI
if ! aws ec2 describe-key-pairs --key-name "$KEY_PAIR" --query 'KeyPairs[*].KeyName' --output text | grep -q "$KEY_PAIR"; then
  echo "Key pair not found, creating one..."
  # Create the key pair and save the private key to a file
  aws ec2 create-key-pair --key-name "$KEY_PAIR" --query 'KeyMaterial' --output text > "${KEY_PAIR}.pem"
  # Set restrictive permissions on the private key file
  chmod 400 "${KEY_PAIR}.pem"
  echo "Key pair created and saved as ${KEY_PAIR}.pem"
else
  echo "Key pair '${KEY_PAIR}' already exists."
fi