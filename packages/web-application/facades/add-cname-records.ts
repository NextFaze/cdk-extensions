import { WebApplication } from '../web-application.construct';
import { CnameRecord } from '@aws-cdk/aws-route53';
import { pascalCase } from 'change-case';
import { DOMAIN_NAME_REGISTRAR } from '../constants';
import { CloudFrontWebDistribution } from '@aws-cdk/aws-cloudfront';

export function addCnameRecords(
  this: WebApplication,
  { distribution }: { distribution: CloudFrontWebDistribution }
): void {
  const { aliases, domainNameRegistrar, hostedZone } = this.props;

  if (domainNameRegistrar === DOMAIN_NAME_REGISTRAR.AWS) {
    aliases.forEach((alias) => {
      new CnameRecord(this, pascalCase(`${alias}CnameRecord`), {
        zone: hostedZone,
        recordName: alias,
        domainName: distribution.domainName,
      });
    });
  }
}
