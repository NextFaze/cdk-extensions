import { S3 } from 'aws-sdk';
import { AssetsUploader } from './assets-uploader';
import { getSampleEvent } from './__test__/api-gateway-post-event';
import fs from 'fs';
import FormData from 'form-data';

describe('AssetsUploader', () => {
  let assetsUploader: AssetsUploader;
  let s3Spy: jest.SpyInstance;
  beforeEach(() => {
    s3Spy = jest.fn().mockReturnValue({
      upload: () => ({ promise: () => ({}) }),
    });
    assetsUploader = new AssetsUploader((s3Spy as unknown) as S3);
  });

  it('should not process upload when required envs are missing', async () => {
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
    process.env.BUCKET_NAME = 'test-bucket';

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

  fit('should not upload to bucket when missing required body params', async () => {
    process.env.BUCKET_NAME = 'test-bucket';

    const form = new FormData();
    const headers = form.getHeaders();
    form.append('file', fs.createReadStream('__test__/assets/airplane.png'));

    const response = await assetsUploader.run(
      getSampleEvent<Buffer>(Buffer.from(form.toString()), { ...headers })
    );

    expect(response).toEqual({
      body: JSON.stringify({ success: true }),
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      statusCode: 200,
    });
  });
});
