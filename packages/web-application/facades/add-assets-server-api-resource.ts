import {
  LambdaIntegration,
  PassthroughBehavior,
} from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import {
  AssetsServer,
  IAssetsServerProps,
} from '../constructs/assets-server.construct';
import { Bucket, IBucket } from '@aws-cdk/aws-s3';
import path from 'path';

export function addAssetsServerApiResource(
  scope: AssetsServer,
  { restApiResource }: IAssetsServerProps,
  { s3Bucket }: { s3Bucket: Bucket | IBucket }
): void {
  const handler = new NodejsFunction(scope, 'Handler', {
    entry: path.resolve(__dirname, '../handlers/index.ts'),
    handler: 'assetsUploaderHandler',
    environment: {
      BUCKET_NAME: s3Bucket.bucketName,
    },
  });
  s3Bucket.grantWrite(handler);

  const uploadResource = restApiResource.addResource('upload');
  uploadResource.addMethod(
    'POST',
    new LambdaIntegration(handler, {
      passthroughBehavior: PassthroughBehavior.NEVER,
    })
  );
}
