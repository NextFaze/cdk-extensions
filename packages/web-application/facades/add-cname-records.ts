import { CnameRecord, IHostedZone } from '@aws-cdk/aws-route53';
import { pascalCase } from 'change-case';
import { DOMAIN_NAME_REGISTRAR } from '../constants';
import { IDistribution } from '@aws-cdk/aws-cloudfront';
import { Construct } from '@aws-cdk/core';

export function addCnameRecords(
  scope: Construct,
  {
    distribution,
    aliases,
    domainNameRegistrar,
    hostedZone,
  }: {
    distribution: IDistribution;
    aliases: string[];
    domainNameRegistrar?: DOMAIN_NAME_REGISTRAR;
    hostedZone?: IHostedZone;
  }
): void {
  if (domainNameRegistrar === DOMAIN_NAME_REGISTRAR.AWS) {
    if (!hostedZone) {
      throw new Error(
        'Missing required hosted zone configuration for AWS domain registrar.'
      );
    }
    aliases.forEach((alias): void => {
      new CnameRecord(scope, pascalCase(`${alias}CnameRecord`), {
        zone: hostedZone,
        recordName: alias,
        domainName: distribution.distributionDomainName,
      });
    });
  }
}
