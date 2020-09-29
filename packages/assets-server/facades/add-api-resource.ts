import { LambdaIntegration, RestApi } from '@aws-cdk/aws-apigateway';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { AssetsServer, IAssetsServerProps } from '../assets-server.construct';
import { Bucket } from '@aws-cdk/aws-s3';

export function addApiResource(
  scope: AssetsServer,
  props: IAssetsServerProps,
  { s3Bucket }: { s3Bucket: Bucket }
): void {
  const handler = new NodejsFunction(scope, 'Handler', {
    entry: '../handlers/index.js',
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
