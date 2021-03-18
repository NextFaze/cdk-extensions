import { App, Stack, StackProps } from '@aws-cdk/core';
import { DartFunction } from '~/cdkx/aws-lambda-dart';

export type IDartApiStackProps = StackProps;

export class DartApiStack extends Stack {
  constructor(scope: App, id: string, props: IDartApiStackProps) {
    super(scope, id, props);

    new DartFunction(this, 'dart-handler', {
      handler: 'hello.ALB',
    });
  }
}
