import {
  WebApplication,
  IWebApplicationProps,
} from '../constructs/web-application.construct';
import { OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';

export function createOriginAccessIdentity(
  scope: WebApplication,
  props: IWebApplicationProps
): OriginAccessIdentity {
  return new OriginAccessIdentity(scope, 'OriginAccessIdentity', {
    comment: `Origin Access Identity for ${
      props.aliases[0] || 'Web Application'
    }`,
  });
}
