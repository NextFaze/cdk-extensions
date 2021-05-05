import { StringParameter } from '@aws-cdk/aws-ssm';
import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { IHostedZone } from '@aws-cdk/aws-route53';
import { PriceClass } from '@aws-cdk/aws-cloudfront';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';
import { DOMAIN_NAME_REGISTRAR } from '../constants';
import { createOriginAccessIdentity } from '../facades/create-origin-access-identity';
import { createOriginBucket } from '../facades/create-origin-bucket';
import { createCloudfrontWebDistribution } from '../facades/create-cloudfront-web-distribution';
import { getViewerCertificate } from '../facades/get-viewer-certificate';
import { addCnameRecords } from '../facades/add-cname-records';
import { createDynamicConfigParameter } from '../facades/create-dynamic-config-parameter';
import { User } from '@aws-cdk/aws-iam';

export interface IRequestCertificateProps {
  domainName: string;
}

export interface IWebApplicationProps {
  aliases: string[];
  certificate: ICertificate | IRequestCertificateProps;
  hostedZone?: IHostedZone;
  domainNameRegistrar?: DOMAIN_NAME_REGISTRAR;
  defaultRootObject?: string;
  errorRootObject?: string;
  cloudfrontPriceClass?: PriceClass;
  dynamicParameter?: {
    applicationUser: User;
    parameterName?: string;
    initialValue: string;
    allowedPattern?: string;
  };
  /**
   * @default orphaned - resources will be orphaned, choose destroy to auto remove on destroy
   */
  removalPolicy?: RemovalPolicy;
}

export class WebApplication extends Construct {
  configParameter: StringParameter | undefined;
  constructor(scope: Construct, id: string, props: IWebApplicationProps) {
    super(scope, id);

    const { aliases, hostedZone, domainNameRegistrar } = props;

    const originBucket = createOriginBucket(this, props);
    const identity = createOriginAccessIdentity(this, props);
    originBucket.grantRead(identity);

    const viewerCertificate = getViewerCertificate(this, props);
    const distribution = createCloudfrontWebDistribution(this, props, {
      s3BucketSource: originBucket,
      originAccessIdentity: identity,
      viewerCertificate,
    });

    this.configParameter = createDynamicConfigParameter(this, props);

    addCnameRecords(this, {
      distribution,
      aliases,
      hostedZone,
      domainNameRegistrar,
    });
  }
}
