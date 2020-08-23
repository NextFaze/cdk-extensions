import { WebApplication } from '../web-application.construct';
import { Bucket } from '@aws-cdk/aws-s3';

export function createOriginBucket(this: WebApplication): Bucket {
  const { defaultRootObject, errorRootObject } = this.props;
  return new Bucket(this, 'OriginBucket', {
    websiteIndexDocument: defaultRootObject || 'index.html',
    websiteErrorDocument: errorRootObject || 'index.html',
  });
}
