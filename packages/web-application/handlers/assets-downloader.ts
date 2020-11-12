import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { BaseHandler } from './base-handler';
import sharp from 'sharp';

type CssSize = 'contain' | 'cover' | 'fill' | 'inside' | 'outside';

export class AssetsDownloader extends BaseHandler {
  constructor(private s3: S3) {
    super();
  }

  async run(
    event: APIGatewayEvent
  ): Promise<{
    statusCode: number;
    headers: { 'Content-Type': string };
    body: string;
    isBase64Encoded: boolean;
  }> {
    const bucketName = process.env.BUCKET_NAME;
    const assetPublicHost = process.env.ASSETS_PUBLIC_HOST;

    if (!bucketName) {
      return this.encodedResponse({
        statusCode: 500,
        body: { message: 'Missing required environment variable: BUCKET_NAME' },
      });
    }
    if (!assetPublicHost) {
      return this.encodedResponse({
        statusCode: 500,
        body: {
          message: 'Missing required environment variable: ASSETS_PUBLIC_HOST',
        },
      });
    }

    const { size = 'cover', position = 'center', resolution } =
      (event.queryStringParameters as {
        size: CssSize;
        position: string;
        resolution: string;
      }) ?? {};

    const key = event.pathParameters?.key ?? '';

    if (!key) {
      return this.encodedResponse({
        statusCode: 500,
        body: {
          message: 'Could not resolve file name.',
        },
      });
    }

    // if original file requested redirect to it
    if (!resolution) {
      return this.encodedResponse({
        // permanent redirect
        statusCode: 301,
        body: '',
        headers: {
          location: `${assetPublicHost}/${key}`,
        },
      });
    }

    try {
      const existingVersion = await this.s3
        .headObject({
          Bucket: bucketName,
          Key: `${resolution}/${key}`,
        })
        .promise();

      if (existingVersion) {
        return this.encodedResponse({
          // permanent redirect to exiting resolution
          statusCode: 301,
          body: '',
          headers: {
            location: `${assetPublicHost}/${resolution}/${key}`,
          },
        });
      }
    } catch (err) {
      // if file some unknown error was thrown, rethrow
      if (err.code !== 'NoSuchKey') {
        throw err;
      }
    }

    // when height or width is set to null, sharp auto assumes width/height
    const [width, height] = resolution
      .toUpperCase()
      .split('X')
      .map((seg) => (seg !== 'AUTO' ? Number.parseInt(seg) : null));

    let originalFile: S3.GetObjectOutput;
    try {
      originalFile = await this.s3
        .getObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
    } catch (err) {
      if (err.code !== 'NoSuchKey') {
        throw err;
      }
      return this.encodedResponse({
        statusCode: 404,
        body: '',
      });
    }

    try {
      if (!originalFile?.Body) {
        throw new Error(
          `Could not load original file from ${bucketName}, tried key ${key}`
        );
      }

      const resizedImage = await sharp(originalFile.Body as Buffer)
        .resize(width, height, {
          position,
          fit: size,
        })
        .toBuffer();

      const uploadedResizedImage = await this.s3
        .upload({
          Bucket: bucketName,
          Key: `${resolution}/${key}`,
          Body: resizedImage,
          ContentDisposition: originalFile.ContentDisposition,
          CacheControl: originalFile.CacheControl,
          ContentEncoding: originalFile.ContentEncoding,
          ContentType: originalFile.ContentType,
          Metadata: originalFile.Metadata,
        })
        .promise();

      return this.encodedResponse({
        // permanent redirect to new uploaded image
        statusCode: 301,
        body: '',
        headers: {
          location: `${assetPublicHost}/${uploadedResizedImage.Key}`,
        },
      });
    } catch (err) {
      console.log('Error processing request: ', err);
      return this.encodedResponse({
        statusCode: 500,
        body: { message: err.message ?? 'Something went wrong!' },
      });
    }
  }
}
