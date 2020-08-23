import { WebApplication } from '../web-application.construct';
import { OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';

export function createOriginAccessIdentity(
  this: WebApplication
): OriginAccessIdentity {
  return new OriginAccessIdentity(this, 'OriginAccessIdentity', {
    comment: `Origin Access Identity for ${
      this.props.aliases[0] || 'Web Application'
    }`,
  });
}
