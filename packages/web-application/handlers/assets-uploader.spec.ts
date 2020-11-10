import { S3 } from 'aws-sdk';
import { AssetsUploader } from './assets-uploader';
import { getSampleEvent } from './__test__/api-gateway-post-event';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';

describe('AssetsUploader', () => {
  let assetsUploader: AssetsUploader;
  let s3Spy: { upload: jest.SpyInstance };
  beforeEach(() => {
    process.env.BUCKET_NAME = 'test-bucket';
    s3Spy = {
      upload: jest.fn().mockReturnValue({
        promise: () =>
          ({
            Location: 'https://path-to-uploaded-location',
          } as S3.ManagedUpload.SendData),
      }),
    };
    assetsUploader = new AssetsUploader((s3Spy as unknown) as S3);
  });

  afterEach(() => {
    delete process.env.BUCKET_NAME;
  });

  it('should not process upload when required envs are missing', async () => {
    // when bucket name env is missing
    delete process.env.BUCKET_NAME;

    const response = await assetsUploader.run(getSampleEvent());
    expect(response).toEqual({
      body: '{"message":"Missing required environment variable: TABLE_NAME"}',
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      statusCode: 500,
    });
  });

  it('should not process upload with empty body', async () => {
    const response = await assetsUploader.run(getSampleEvent());
    expect(response).toEqual({
      body: '{"message":"Cannot upload process request with empty body"}',
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      statusCode: 400,
    });
  });

  it('should not upload to bucket when missing required body params', async () => {
    const form = new FormData();
    const headers = form.getHeaders();
    const pathToFile = path.resolve(
      __dirname,
      './__test__/assets/airplane.png'
    );

    form.append('file', fs.readFileSync(pathToFile));

    const sampleEvent = getSampleEvent<string>(
      form.getBuffer().toString('base64'),
      true,
      {
        ...headers,
      }
    );
    const response = await assetsUploader.run(sampleEvent);

    expect(response).toEqual({
      body: JSON.stringify({ message: 'Missing required property: s3Prefix' }),
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      statusCode: 400,
    });

    expect(s3Spy.upload).toHaveBeenCalledTimes(0);
  });

  it('should upload files to given destination', async () => {
    // mock
    s3Spy = {
      upload: jest.fn().mockReturnValue({
        promise: () =>
          ({
            Location: 'https://path-to-uploaded-location',
          } as S3.ManagedUpload.SendData),
      }),
    };
    assetsUploader = new AssetsUploader((s3Spy as unknown) as S3);

    const form = new FormData();
    const headers = form.getHeaders();
    const pathToFile = path.resolve(
      __dirname,
      './__test__/assets/airplane.png'
    );
    const fileBuffer = fs.readFileSync(pathToFile);

    form.append('file', fileBuffer, {
      filename: 'plane.png',
    });
    form.append('s3Prefix', 'path/to/bucket');

    const sampleEvent = getSampleEvent<string>(
      form.getBuffer().toString('base64'),
      true,
      {
        ...headers,
      }
    );
    const response = await assetsUploader.run(sampleEvent);
    expect(response).toEqual({
      body: '{"location":"https://path-to-uploaded-location"}',
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      statusCode: 200,
    });
    expect(s3Spy.upload).toHaveBeenCalledTimes(1);
    expect(s3Spy.upload).toHaveBeenCalledWith({
      Body: fileBuffer,
      Bucket: 'test-bucket',
      ContentEncoding: '7bit',
      ContentType: 'image/png',
      Key: 'path/to/bucket/plane.png',
    });
  });

  it('should upload multiple files to given destination', async () => {
    const form = new FormData();
    const headers = form.getHeaders();
    const pathToFile = path.resolve(
      __dirname,
      './__test__/assets/airplane.png'
    );

    form.append('file', fs.readFileSync(pathToFile), {
      filename: 'plane.png',
    });
    form.append('file2', fs.readFileSync(pathToFile), {
      filename: 'another-plane.jpg',
    });
    form.append('s3Prefix', 'path/to/bucket');

    const sampleEvent = getSampleEvent<string>(
      form.getBuffer().toString('base64'),
      true,
      {
        ...headers,
      }
    );
    const response = await assetsUploader.run(sampleEvent);
    expect(response).toEqual({
      body:
        '[{"location":"https://path-to-uploaded-location"},{"location":"https://path-to-uploaded-location"}]',
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      statusCode: 200,
    });

    expect(s3Spy.upload).toHaveBeenCalledTimes(2);
  });
});
