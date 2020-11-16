import { S3 } from 'aws-sdk';
import { PreSignedUrlGenerator } from './pre-signed-url-generator';
import { getSampleEvent } from './__test__/api-gateway-post-event';

describe('PreSignedUrlGenerator', () => {
  let preSignedUrlGen: PreSignedUrlGenerator;
  let s3Spy: { createPresignedPost: jest.SpyInstance };
  beforeEach(() => {
    process.env.BUCKET_NAME = 'test-bucket';
    s3Spy = {
      createPresignedPost: jest.fn().mockReturnValue({
        url: 'https://some-s3-post-signed-url',
        fields: [],
      }),
    };
    preSignedUrlGen = new PreSignedUrlGenerator((s3Spy as unknown) as S3);
  });

  afterEach(() => {
    delete process.env.BUCKET_NAME;
  });

  it('should not generate url when bucket name can not be resolved', async () => {
    // when bucket name env is missing
    delete process.env.BUCKET_NAME;

    const response = await preSignedUrlGen.run(
      getSampleEvent({
        queryStringParameters: {
          key: 'path-to-file',
        },
      })
    );

    expect(response).toEqual({
      body: '{"message":"Missing required environment variable: BUCKET_NAME"}',
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      statusCode: 500,
    });
  });

  it('should not generate url when bucket name can not be resolved', async () => {
    const response = await preSignedUrlGen.run(
      getSampleEvent({
        queryStringParameters: {
          key: 'path-to-file.png',
        },
      })
    );

    expect(s3Spy.createPresignedPost).toHaveBeenCalledTimes(1);
    expect(s3Spy.createPresignedPost).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Conditions: [['content-length-range', 1, 104857600]],
      Expires: 3600,
      Fields: {
        'Content-Type': 'image/png',
        key: 'path-to-file.png',
      },
    });

    expect(response).toEqual({
      body: '{"url":"https://some-s3-post-signed-url","fields":[]}',
      headers: {
        'Content-Type': 'application/json',
      },
      isBase64Encoded: false,
      statusCode: 200,
    });
  });
});
