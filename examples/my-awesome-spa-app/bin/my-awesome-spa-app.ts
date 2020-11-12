#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyAwesomeSpaAppStack } from '../lib/my-awesome-spa-app-stack';

const app = new cdk.App();
new MyAwesomeSpaAppStack(app, 'MyAwesomeSpaAppStack', {
  env: {
    region: 'ap-southeast-2',
  },
});
