import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import {
  AssetsServer,
  IAssetsServerProps,
} from '../constructs/assets-server.construct';
import { Bucket } from '@aws-cdk/aws-s3';

export function addAssetsServerApiResource(
  scope: AssetsServer,
  props: IAssetsServerProps,
  { s3Bucket }: { s3Bucket: Bucket }
): void {
  const handler = new NodejsFunction(scope, 'Handler', {
    entry: '../handlers/index.js',
    handler: 'assetsUploaderHandler',
    environment: {
      BUCKET_NAME: s3Bucket.bucketName,
    },
  });
  s3Bucket.grantWrite(handler);

  const restApi = new RestApi(scope, 'RestApi', {
    binaryMediaTypes: ['multipart/form-data'],
  });

  const uploadResource = restApi.root.addResource('upload');
  uploadResource.addMethod('POST', new LambdaIntegration(handler));
}
