#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ArgusVmStack } from '../lib/argus-vm-stack';

const app = new cdk.App();

const allowedCidr = app.node.tryGetContext('allowedCidr') ?? '0.0.0.0/0';
const instanceType = app.node.tryGetContext('instanceType') ?? 't3.xlarge';
const argusImage = app.node.tryGetContext('argusImage') ?? 'ghcr.io/rajkumar-madhu/argus:latest';
const region = app.node.tryGetContext('region') ?? process.env.CDK_DEFAULT_REGION ?? 'us-east-1';
const account = process.env.CDK_DEFAULT_ACCOUNT;

new ArgusVmStack(app, 'ArgusVmDev', {
  env: account ? { account, region } : { region },
  description: 'Self-hosted Argus community stack on a single EC2 VM (dev)',
  allowedCidr,
  instanceTypeName: instanceType,
  argusImage,
  tags: {
    Project: 'argus',
    Environment: 'dev',
    ManagedBy: 'cdk',
  },
});
