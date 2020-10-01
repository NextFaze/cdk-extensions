import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from '@aws-cdk/aws-cloudfront';
import { S3Origin } from '@aws-cdk/aws-cloudfront-origins';
import { Bucket, IBucket } from '@aws-cdk/aws-s3';
import { AssetsServer } from '../constructs/assets-server.construct';

export function addAssetsServerDistribution(
  scope: AssetsServer,
  {
    s3BucketSource,
    aliases,
  }: { s3BucketSource: Bucket | IBucket; aliases: string[] }
): Distribution {
  const originAccessIdentity = new OriginAccessIdentity(
    scope,
    'AccessIdentity',
    {
      comment: `Auto generated access identity for ${aliases[0]}`,
    }
  );

  s3BucketSource.grantRead(originAccessIdentity);

  return new Distribution(scope, 'Distribution', {
    defaultBehavior: {
      compress: true,
      origin: new S3Origin(s3BucketSource),
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    },
    domainNames: aliases,
    comment: 'Auto generated distribution for static assets',
  });
}
