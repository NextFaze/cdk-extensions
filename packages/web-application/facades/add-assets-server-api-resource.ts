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
import { Duration } from '@aws-cdk/core';

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
    timeout: Duration.minutes(5),
    ...getEnvSpecificHandlerConfig(),
  });
  s3Bucket.grantWrite(uploadHandler);

  const uploadRequestModel = new Model(scope, 'UploadAssets', {
    restApi: restApiResource.api,
    description: 'Upload files',
    contentType: 'multipart/form-data',
    modelName: 'UploadAssets',
    schema: {
      schema: JsonSchemaVersion.DRAFT7,
      title: 'Upload assets',
      type: JsonSchemaType.OBJECT,
      additionalProperties: true,
      required: ['s3Prefix'],
      properties: {
        s3Prefix: {
          title: 'Directory to upload files under',
          type: JsonSchemaType.STRING,
        },
      },
    },
  });
  const uploadResource = restApiResource.addResource('upload');
  const uploadBodyValidator = new RequestValidator(
    scope,
    'UploadBodyValidator',
    {
      requestValidatorName: 'Upload Body validator',
      validateRequestBody: true,
      restApi: restApiResource.api,
    }
  );
  uploadResource.addMethod(
    'POST',
    new LambdaIntegration(uploadHandler, {
      // only supports uploading images with form-data at the moment
      passthroughBehavior: PassthroughBehavior.NEVER,
    }),
    {
      requestValidator: uploadBodyValidator,
      requestModels: {
        'multipart/form-data': uploadRequestModel,
      },
    }
  );

  // download image
  const downloadHandler = new NodejsFunction(scope, 'DownloadHandler', {
    entry: path.resolve(__dirname, '../handlers/index.ts'),
    handler: 'assetsDownloaderHandler',
    environment: {
      BUCKET_NAME: s3Bucket.bucketName,
      ASSETS_PUBLIC_HOST: assetsPublicHost,
    },
    timeout: Duration.minutes(5),
    // sharp will need to load image in memory to be able to quickly manipulate it
    memorySize: 1024,
    ...getEnvSpecificHandlerConfig(),
  });
  // this handler also takes care of creating missing resolution asset, thus it needs read + write permissions
  s3Bucket.grantReadWrite(downloadHandler);
  const downloadResource = restApiResource.addResource('download');
  const downloadValidator = new RequestValidator(
    scope,
    'DownloadParamsValidator',
    {
      restApi: restApiResource.api,
      requestValidatorName: 'Download Params Validator',
      validateRequestParameters: true,
    }
  );

  downloadResource.addMethod('GET', new LambdaIntegration(downloadHandler), {
    requestValidator: downloadValidator,
    requestParameters: {
      'method.request.querystring.key': true,
      'method.request.querystring.resolution': false,
      'method.request.querystring.size': false,
      'method.request.querystring.position': false,
    },
  });
}

function getEnvSpecificHandlerConfig() {
  if (process.env.NODE_ENV === 'test') {
    return {
      externalModules: ['sharp'],
    };
  } else {
    return {
      nodeModules: ['sharp'],
      // linux based libs needs to be installed to lambda runtime, there for force build in docker for non-prod envs
      forceDockerBundling: true,
    };
  }
}
