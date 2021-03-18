import { Code, Function, FunctionProps, Runtime } from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';
import path from 'path';

export type IDartFunctionProps = Omit<FunctionProps, 'runtime' | 'code'>;

export class DartFunction extends Function {
  constructor(scope: Construct, id: string, props: IDartFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PROVIDED,
      code: Code.fromDockerBuild(path.resolve(__dirname, './docker'), {
        file: 'dart.DOCKERFILE',
      }),
    });
  }
}
