import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import Busboy from 'busboy';
import { promisify } from 'util';

/**
 * Upload files to s3 or return upload Url
 * @params returnSignedUrlOnly: boolean @default false
 */
export class S3Uploader {
  constructor(private s3: S3) {}
  async run(
    event: APIGatewayEvent
  ): Promise<{
    statusCode: number;
    body: string;
    headers?: unknown;
    isBase64Encoded: boolean;
  }> {
    const bucketName = process.env.BUCKET_NAME;

    if (!bucketName) {
      return this.encodedResponse({
        statusCode: 500,
        body: { message: 'Missing required environment variable: TABLE_NAME' },
      });
    }

    try {
      const bbParser = new Busboy({ headers: event.headers });
      const formData = new Map<
        string,
        {
          stream?: NodeJS.ReadableStream;
          fileName?: string;
          fieldName: string;
          encoding: string;
          mimeType: string;
          value?: unknown;
        }
      >();

      bbParser
        .on('file', (fieldName, file, fileName, encoding, mimeType) => {
          console.log('File received on field: ', fieldName);

          formData.set(fieldName, {
            stream: file,
            fileName,
            fieldName,
            encoding,
            mimeType,
          });
        })
        .on(
          'field',
          (
            fieldName,
            value,
            fieldNameTruncated,
            viaTruncated,
            encoding,
            mimeType
          ) => {
            formData.set(fieldName, {
              value: JSON.parse(value),
              mimeType,
              encoding,
              fieldName,
            });
          }
        )
        .on('finish', () => {
          if (!formData.get('s3Location')) {
            return this.encodedResponse({
              statusCode: 400,
              body: { message: `Missing required property: s3Location` },
            });
          }
          //TODO: upload files to s3
          return null;
        });

      await promisify(bbParser.end)();
      return this.encodedResponse({
        statusCode: 200,
        body: {
          success: true,
        },
      });
    } catch (err) {
      console.log('Error processing request: ', JSON.stringify(err));
      return this.encodedResponse({
        statusCode: 500,
        body: { message: 'Something went wrong!' },
      });
    }
  }

  private encodedResponse({
    statusCode = 200,
    body,
  }: {
    statusCode: number;
    body: unknown;
  }) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      isBase64Encoded: false,
    };
  }
}
