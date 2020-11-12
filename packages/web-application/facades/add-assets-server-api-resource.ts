import {
  JsonSchemaType,
  JsonSchemaVersion,
  LambdaIntegration,
  Model,
  PassthroughBehavior,
  RequestValidator,
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
  {
    s3Bucket,
    assetsPublicHost,
  }: { s3Bucket: Bucket | IBucket; assetsPublicHost: string }
): void {
  // assets uploader handler
  const uploadHandler = new NodejsFunction(scope, 'UploadHandler', {
    entry: path.resolve(__dirname, '../handlers/index.ts'),
    handler: 'assetsUploaderHandler',
    environment: {
      BUCKET_NAME: s3Bucket.bucketName,
    },
    nodeModules: ['sharp'],
  });
  s3Bucket.grantWrite(uploadHandler);

  const uploadResource = restApiResource.addResource('upload');
  uploadResource.addMethod(
    'POST',
    new LambdaIntegration(uploadHandler, {
      // only supports uploading images with form-data at the moment
      passthroughBehavior: PassthroughBehavior.NEVER,
    })
  );

  // download image
  const downloadHandler = new NodejsFunction(scope, 'DownloadHandler', {
    entry: path.resolve(__dirname, '../handlers/index.ts'),
    handler: 'assetsDownloaderHandler',
    environment: {
      BUCKET_NAME: s3Bucket.bucketName,
      ASSETS_PUBLIC_HOST: assetsPublicHost,
    },
    nodeModules: ['sharp'],
  });
  // this handler also takes care of creating missing resolution asset, thus it needs read + write permissions
  s3Bucket.grantReadWrite(downloadHandler);
  const downloadResource = restApiResource
    .addResource('download')
    .addResource('{key}');

  const getDownloadValidator = new RequestValidator(
    scope,
    'DownloadGetRequestValidator',
    {
      restApi: restApiResource.api,
      requestValidatorName: 'Download Get Validator',
      validateRequestParameters: true,
    }
  );

  const getDownloadRequestModel = new Model(scope, 'DownloadGetRequestModel', {
    restApi: restApiResource.api,
    description: 'Download image with optional resolution',
    contentType: 'application/json',
    modelName: 'RequestModelDownloadGet',
    schema: {
      schema: JsonSchemaVersion.DRAFT7,
      title: 'Download asset',
      type: JsonSchemaType.OBJECT,
      additionalProperties: false,
      properties: {
        resolution: {
          title: 'Asset Resolution',
          type: JsonSchemaType.STRING,
          // matches 123x123 || 13X23, AUTOx123 i.e (auto and x are case insensitive)
          pattern: new RegExp('\\d+|AUTO(x{1})\\d+|AUTO', 'ig').toString(),
        },
        // based on css object-size attribute
        size: {
          title: 'Asset size',
          type: JsonSchemaType.STRING,
          enum: ['cover', 'contain', 'fill', 'inside', 'outside'],
        },
        // based on css object-position attribute
        position: {
          title: 'Asset position',
          type: JsonSchemaType.STRING,
          enum: [
            'top',
            'right',
            'bottom',
            'left',
            'center',
            'right top',
            'right bottom',
            'left top',
            'left bottom',
            'center center',
          ],
        },
      },
    },
  });

  downloadResource.addMethod('GET', new LambdaIntegration(downloadHandler), {
    requestValidator: getDownloadValidator,
    requestModels: {
      'application/json': getDownloadRequestModel,
    },
    requestParameters: {
      'method.request.querystring.resolution': false,
      'method.request.querystring.size': false,
      'method.request.querystring.position': false,
    },
  });
}
