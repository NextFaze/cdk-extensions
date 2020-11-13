import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { BaseHandler } from './base-handler';
import mime from 'mime';

export class PreSignedUrlGenerator extends BaseHandler {
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

    if (!bucketName) {
      return this.encodedResponse({
        statusCode: 500,
        body: { message: 'Missing required environment variable: BUCKET_NAME' },
      });
    }

    const { key, expires } = event.queryStringParameters as {
      key: string;
      expires: string;
    };

    const uploadPostUrl = this.s3.createPresignedPost({
      // when no expiry is explicitly set, it is defaulted to 1 hour
      Expires: expires ? Number.parseInt(expires) : 3600,
      Bucket: bucketName,
      Fields: {
        key: key,
        'Content-Type': mime.getType(key),
      },
    });

    return this.encodedResponse({
      statusCode: 200,
      body: {
        ...uploadPostUrl,
      },
    });
  }
}
