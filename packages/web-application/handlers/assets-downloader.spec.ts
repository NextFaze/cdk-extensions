import { S3 } from 'aws-sdk';
import { AssetsDownloader } from './assets-downloader';
import { getSampleEvent } from './__test__/api-gateway-post-event';
import path from 'path';
import fs from 'fs';

describe('AssetsDownloader', () => {
  let assetsDownloader: AssetsDownloader;
  let s3Spy: {
    upload: jest.SpyInstance;
    getObject: jest.SpyInstance;
    headObject: jest.SpyInstance;
  };
  const pathToFile = path.resolve(__dirname, './__test__/assets/airplane.png');

  beforeEach(() => {
    process.env.BUCKET_NAME = 'test-bucket';
    process.env.ASSETS_PUBLIC_HOST = 'https://assets-distribution.com';

    s3Spy = {
      upload: jest.fn().mockReturnValue({
        promise: () =>
          ({
            Key: 'path-to-uploaded-location/file.png',
          } as S3.ManagedUpload.SendData),
      }),

      getObject: jest.fn().mockReturnValue({
        promise: () => ({
          Body: Buffer.from(fs.readFileSync(pathToFile).buffer),
        }),
      }),
      headObject: jest.fn().mockReturnValue({
        promise: jest.fn().mockRejectedValue({
          code: 'NoSuchKey',
        }),
      }),
    };
    assetsDownloader = new AssetsDownloader((s3Spy as unknown) as S3);
  });

  afterEach(() => {
    delete process.env.BUCKET_NAME;
    delete process.env.ASSETS_PUBLIC_HOST;
  });

  it('should not process download when missing bucket name', async () => {
    delete process.env.BUCKET_NAME;

    const response = await assetsDownloader.run(getSampleEvent());
    expect(response).toEqual({
      body: '{"message":"Missing required environment variable: BUCKET_NAME"}',
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      statusCode: 500,
    });
  });

  it('should not process download when missing public host', async () => {
    delete process.env.ASSETS_PUBLIC_HOST;

    const response = await assetsDownloader.run(getSampleEvent());
    expect(response).toEqual({
      body:
        '{"message":"Missing required environment variable: ASSETS_PUBLIC_HOST"}',
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      statusCode: 500,
    });
  });

  it('should error when not able to resolve file key', async () => {
    const response = await assetsDownloader.run(getSampleEvent());
    expect(response).toEqual({
      body: JSON.stringify({ message: 'Could not resolve file name.' }),
      headers: { 'Content-Type': 'application/json' },
      isBase64Encoded: false,
      statusCode: 500,
    });
  });

  it('should redirect to original file when no resolution is requested', async () => {
    const response = await assetsDownloader.run(
      getSampleEvent({
        pathParameters: { key: 'path/to/file.png' },
      })
    );
    expect(response).toEqual({
      body: '',
      headers: {
        'Content-Type': 'application/json',
        location: 'https://assets-distribution.com/path/to/file.png',
      },
      isBase64Encoded: false,
      statusCode: 301,
    });
  });

  jest.isolateModules(() => {
    it('should redirect to existing resolution if it already exists', async () => {
      s3Spy = {
        ...s3Spy,
        headObject: jest.fn().mockReturnValue({
          promise: jest.fn().mockResolvedValue({
            ETag: 'some etag',
          }),
        }),
      };

      assetsDownloader = new AssetsDownloader((s3Spy as unknown) as S3);
      const response = await assetsDownloader.run(
        getSampleEvent({
          pathParameters: { key: 'path/to/file.png' },
          queryStringParameters: {
            resolution: '350X350',
          },
        })
      );
      expect(response).toEqual({
        body: '',
        headers: {
          'Content-Type': 'application/json',
          location: 'https://assets-distribution.com/350X350/path/to/file.png',
        },
        isBase64Encoded: false,
        statusCode: 301,
      });
    });
  });

  jest.isolateModules(() => {
    it('should return 404 if no original image found at given location', async () => {
      s3Spy = {
        ...s3Spy,
        getObject: jest.fn().mockReturnValue({
          promise: jest.fn().mockRejectedValue({
            code: 'NoSuchKey',
          }),
        }),
      };

      assetsDownloader = new AssetsDownloader((s3Spy as unknown) as S3);
      const response = await assetsDownloader.run(
        getSampleEvent({
          pathParameters: { key: 'path/to/file.png' },
          queryStringParameters: {
            resolution: '350X350',
          },
        })
      );
      expect(response).toEqual({
        body: '',
        headers: {
          'Content-Type': 'application/json',
        },
        isBase64Encoded: false,
        statusCode: 404,
      });
    });
  });

  it('should create version for given resolution and redirect to it', async () => {
    const response = await assetsDownloader.run(
      getSampleEvent({
        pathParameters: { key: 'path/to/file.png' },
        queryStringParameters: {
          resolution: '350X350',
        },
      })
    );
    expect(response).toEqual({
      body: '',
      headers: {
        'Content-Type': 'application/json',
        location:
          'https://assets-distribution.com/path-to-uploaded-location/file.png',
      },
      isBase64Encoded: false,
      statusCode: 301,
    });
  });
});
