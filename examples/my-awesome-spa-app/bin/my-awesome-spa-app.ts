#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyAwesomeSpaAppStack } from '../lib/my-awesome-spa-app-stack';

const app = new cdk.App();
new MyAwesomeSpaAppStack(app, 'MyAwesomeSpaAppStack', {
  env: {
    region: 'ap-southeast-2',
  },
  cdnAliases: ['my-cdn.domain.com'],
  webAliases: ['my-app.domain.com'],
  zoneId: '1231241231',
  zoneName: 'domain.com',
  certificateArn: 'arn:certificate',
});
