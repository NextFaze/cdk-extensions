#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MyAwesomeSpaAppStack } from '../lib/my-awesome-spa-app-stack';
import { SubscriptionStack } from '../lib/subscription-stack';
import { DartApiStack } from '../lib/dart-lambda-stack';

const app = new cdk.App();
new MyAwesomeSpaAppStack(app, 'MyAwesomeSpaAppStack', {
  env: {
    region: 'ap-southeast-2',
  },
  cdnAliases: ['my-cdn.domain.com'],
  webAliases: ['my-app.domain.com'],
  zoneId: '1231241231',
  zoneName: 'domain.com',
  certificateArn: 'arn:aws:acm:us-east-1:00000012313:certificate/some-id',
});

new SubscriptionStack(app, 'MySubscriptionStack', {
  env: {
    region: 'ap-southeast-2',
  },
});

new DartApiStack(app, 'MyDartApiStack', {
  env: {
    region: 'ap-southeast-2',
  },
});
