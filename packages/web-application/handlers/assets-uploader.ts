import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import Busboy from 'busboy';

/**
 * Upload files to s3 or return upload Url
 * @params returnSignedUrlOnly: boolean @default false
 */
export class AssetsUploader {
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

    if (!event.body) {
      return this.encodedResponse({
        statusCode: 400,
        body: { message: 'Cannot upload process request with empty body' },
      });
    }

    try {
      const bbParser = new Busboy({
        headers: {
          'content-type':
            event.headers['Content-Type'] || event.headers['content-type'],
        },
      });

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

      return new Promise((resolve, reject) => {
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
            if (!formData.get('s3Prefix')) {
              return this.encodedResponse({
                statusCode: 400,
                body: { message: `Missing required property: s3Prefix` },
              });
            }

            const s3UploadPromises = [] as Promise<S3.ManagedUpload.SendData>[];
            for (const [, data] of formData) {
              if (!data.stream) {
                return;
              }

              console.log('Uploading File: ', data.fileName || data.fieldName);
              // upload each file to s3
              s3UploadPromises.push(
                this.s3
                  .upload({
                    Bucket: bucketName,
                    Key: `${formData.get('s3Prefix')}/${
                      data.fileName || data.fieldName
                    }`,
                    ContentType: data.mimeType,
                    Body: data.stream,
                    ContentEncoding: data.encoding,
                  })
                  .promise()
              );
            }
            return Promise.all(s3UploadPromises);
          });

        bbParser.on('finish', () => {
          console.log('Successfully processed all files!');
          // return resolve(
          //   this.encodedResponse({
          //     statusCode: 200,
          //     body: {
          //       success: true,
          //     },
          //   })
          // );
        });

        bbParser.write(event.body || '', (err) => {
          if (err) {
            return reject(err);
          }
        });
        bbParser.end();
      });
    } catch (err) {
      console.log('Error processing request: ', err);
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
