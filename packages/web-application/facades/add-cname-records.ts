import {
  WebApplication,
  IWebApplicationProps,
} from '../constructs/web-application.construct';
import { CnameRecord } from '@aws-cdk/aws-route53';
import { pascalCase } from 'change-case';
import { DOMAIN_NAME_REGISTRAR } from '../constants';
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront';

export function addCnameRecords(
  scope: WebApplication,
  props: IWebApplicationProps,
  { distribution }: { distribution: CloudFrontWebDistribution }
): void {
  const { aliases, domainNameRegistrar, hostedZone } = props;

  if (domainNameRegistrar === DOMAIN_NAME_REGISTRAR.AWS) {
    aliases.forEach((alias) => {
      new CnameRecord(scope, pascalCase(`${alias}CnameRecord`), {
        zone: hostedZone,
        recordName: alias,
        domainName: distribution.domainName,
      });
    });
  }
}
