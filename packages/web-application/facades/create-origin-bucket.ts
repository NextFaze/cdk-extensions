import {
  WebApplication,
  IWebApplicationProps,
} from '../constructs/web-application.construct';
import { Bucket } from '@aws-cdk/aws-s3';

export function createOriginBucket(
  scope: WebApplication,
  props: IWebApplicationProps
): Bucket {
  const { defaultRootObject, errorRootObject } = props;
  return new Bucket(scope, 'OriginBucket', {
    websiteIndexDocument: defaultRootObject || 'index.html',
    websiteErrorDocument: errorRootObject || 'index.html',
  });
}
