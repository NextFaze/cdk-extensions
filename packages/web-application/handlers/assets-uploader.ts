import { APIGatewayEvent } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import Busboy from 'busboy';
import { BaseHandler } from './base-handler';

export interface IUploadSuccessBody {
  location: string;
  key: string;
  bucket: string;
  eTag: string;
}

/**
 * Upload files to s3 or return upload Url
 * @params returnSignedUrlOnly: boolean @default false
 */
export class AssetsUploader extends BaseHandler {
  constructor(private s3: S3) {
    super();
  }
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
        body: { message: 'Missing required environment variable: BUCKET_NAME' },
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

      if (!parsedBody.fields?.s3Prefix) {
        return this.encodedResponse({
          statusCode: 400,
          body: { message: `Missing required property: s3Prefix` },
        });
      }

      const s3UploadPromises = [] as Promise<S3.ManagedUpload.SendData>[];

      for (const fileKey in parsedBody?.files) {
        const currentFile = parsedBody?.files[fileKey];
        if (!currentFile?.data) {
          return this.encodedResponse({
            statusCode: 400,
            body: `Unable to parse binary ${currentFile.fileName}`,
          });
        }

        const filePublicName = currentFile.fileName ?? currentFile.fieldName;
        console.log('Uploading File: ', filePublicName);

        // upload each file to s3
        s3UploadPromises.push(
          this.s3
            .upload({
              Bucket: bucketName,
              Key: `${parsedBody.fields.s3Prefix}/${filePublicName}`,
              ContentType: currentFile.mimeType,
              Body: currentFile.data,
              ContentEncoding: currentFile.encoding,
            })
            .promise()
        );
      }
      const response = await Promise.all(s3UploadPromises);

      const responseToReturn = response.map((returnedItem) => ({
        location: returnedItem.Location,
        key: returnedItem.Key,
        bucket: returnedItem.Bucket,
        eTag: returnedItem.ETag,
      })) as IUploadSuccessBody[];

      return this.encodedResponse({
        statusCode: 200,
        body:
          responseToReturn.length > 1 ? responseToReturn : responseToReturn[0],
      });
    } catch (err) {
      console.log('Error processing request: ', err);
      return this.encodedResponse({
        statusCode: 500,
        body: { message: err.message ?? 'Something went wrong!' },
      });
    }
  }

  parseFormData(
    event: APIGatewayEvent & {
      parsedBody?: {
        files: {
          [key: string]: {
            data?: Buffer;
            fileName?: string;
            fieldName: string;
            encoding: string;
            mimeType: string;
            value?: unknown;
          };
        };
        fields: { [fieldName: string]: unknown };
      };
    }
  ): Promise<typeof event> {
    const busboy = new Busboy({
      headers: {
        'content-type':
          event.headers['Content-Type'] || event.headers['content-type'],
      },
    });

    const result = {
      files: {},
      fields: {},
    } as {
      files: {
        [fileName: string]: {
          data?: Buffer;
          fileName?: string;
          fieldName: string;
          encoding: string;
          mimeType: string;
          value?: unknown;
          isBinary?: boolean;
        };
      };
      fields: {
        [fieldName: string]: unknown;
      };
    };

    return new Promise((resolve, reject) => {
      busboy
        .on('file', (fieldName, file, fileName, encoding, mimeType) => {
          let fileData: Buffer;
          file.on('data', (data: Buffer) => {
            fileData = data;
          });

          file.on('end', () => {
            result.files[fieldName] = {
              data: fileData,
              fileName,
              fieldName,
              encoding,
              mimeType,
              isBinary: true,
            };
          });
        })
        .on('field', (fieldName, value) => {
          result.fields[fieldName] = value;
        })
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
}
