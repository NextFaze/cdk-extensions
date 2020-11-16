import {
  WebApplication,
  IWebApplicationProps,
} from '../constructs/web-application.construct';
import { Bucket } from '@aws-cdk/aws-s3';

export function createOriginBucket(
  scope: WebApplication,
  props: IWebApplicationProps
): Bucket {
  const { defaultRootObject, errorRootObject, removalPolicy } = props;
  return new Bucket(scope, 'OriginBucket', {
    removalPolicy,
    versioned: true,
    websiteIndexDocument: defaultRootObject || 'index.html',
    websiteErrorDocument: errorRootObject || 'index.html',
  });
}
