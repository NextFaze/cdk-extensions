import {
  WebApplication,
  IWebApplicationProps,
} from '../web-application.construct';
import {
  CloudFrontWebDistribution,
  ViewerProtocolPolicy,
  ViewerCertificate,
  OriginAccessIdentity,
} from '@aws-cdk/aws-cloudfront';
import { Bucket } from '@aws-cdk/aws-s3';

export function createCloudfrontWebDistribution(
  scope: WebApplication,
  props: IWebApplicationProps,
  {
    s3BucketSource,
    originAccessIdentity,
    viewerCertificate,
  }: {
    s3BucketSource: Bucket;
    originAccessIdentity: OriginAccessIdentity;
    viewerCertificate: ViewerCertificate;
  }
): CloudFrontWebDistribution {
  const { defaultRootObject, cloudfrontPriceClass, aliases } = props;

  return new CloudFrontWebDistribution(scope, 'CloudFrontWebDistribution', {
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource,
          originAccessIdentity,
        },
        behaviors: [
          {
            isDefaultBehavior: true,
            forwardedValues: {
              queryString: true,
              cookies: {
                forward: 'none',
              },
            },
          },
        ],
      },
    ],
    errorConfigurations: [
      // routes will be handled by SPA, so redirect to default page path
      {
        errorCode: 404,
        responsePagePath: `/${defaultRootObject || 'index.html'}`,
        responseCode: 200,
      },
    ],
    comment: `Cloudfront Distribution for ${aliases[0]}`,
    priceClass: cloudfrontPriceClass,
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    viewerCertificate,
  });
}
