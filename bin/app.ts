#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { mainStack } from '../lib/mainStack';

const app = new cdk.App();
new mainStack(app, 'mainStack', {
});