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
      const { parsedBody } = await this.parseFormData(event);

      if (!parsedBody) {
        throw new Error('No body after parsing.');
      }

      if (!parsedBody.s3Prefix) {
        this.encodedResponse({
          statusCode: 400,
          body: { message: `Missing required property: s3Prefix` },
        });
      }

      // TODO: validate and upload files to s3
      // const s3UploadPromises = [] as Promise<S3.ManagedUpload.SendData>[];
      // for (const [, data] of parsedBody) {
      //   if (!data.stream) {
      //     return;
      //   }
      //   console.log('Uploading File: ', data.fileName || data.fieldName);
      //   // upload each file to s3
      //   s3UploadPromises.push(
      //     this.s3
      //       .upload({
      //         Bucket: bucketName,
      //         Key: `${formData.get('s3Prefix')}/${
      //           data.fileName || data.fieldName
      //         }`,
      //         ContentType: data.mimeType,
      //         Body: data.stream,
      //         ContentEncoding: data.encoding,
      //       })
      //       .promise()
      //   );
      // }
      // return Promise.all(s3UploadPromises);
      return this.encodedResponse({
        statusCode: 200,
        body: {},
      });
    } catch (err) {
      console.log('Error processing request: ', err);
      return this.encodedResponse({
        statusCode: 500,
        body: { message: 'Something went wrong!' },
      });
    }
  }

  parseFormData(
    event: APIGatewayEvent & {
      parsedBody?: {
        [key: string]: {
          stream?: NodeJS.ReadableStream;
          fileName?: string;
          fieldName: string;
          encoding: string;
          mimeType: string;
          value?: unknown;
        };
      };
    }
  ): Promise<typeof event> {
    const busboy = new Busboy({
      headers: {
        'content-type':
          event.headers['Content-Type'] || event.headers['content-type'],
      },
    });

    const result = {} as {
      [field: string]: {
        data?: Buffer;
        fileName?: string;
        fieldName: string;
        encoding: string;
        mimeType: string;
        value?: unknown;
        isBinary?: boolean;
      };
    };

    return new Promise((resolve, reject) => {
      busboy
        .on('file', (fieldName, file, fileName, encoding, mimeType) => {
          console.log('File received on field: ', fieldName);
          let fileData: Buffer;
          file.on('data', (data: Buffer) => {
            fileData = data;
          });

          file.on('end', () => {
            result[fieldName] = {
              data: fileData,
              fileName,
              fieldName,
              encoding,
              mimeType,
              isBinary: true,
            };
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
            result[fieldName] = {
              value,
              mimeType,
              encoding,
              fieldName,
            };
          }
        )
        .on('error', (err: unknown) => {
          console.error(err);
          reject(err);
        })

        .on('finish', () => {
          event.parsedBody = result;
          resolve(event);
        });

      busboy.write(
        event.body || '',
        event.isBase64Encoded ? 'base64' : 'binary'
      );
      busboy.end();
    });
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
