import { APIGatewayProxyEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { AssetsUploader } from './assets-uploader';

const s3 = new S3();
const assetsUploader = new AssetsUploader(s3);

export const assetsUploaderHandler: (
  event: APIGatewayProxyEvent
) => Promise<{
  statusCode: number;
  body: string;
  headers?: unknown;
  isBase64Encoded: boolean;
}> = assetsUploader.run.bind(assetsUploader);
