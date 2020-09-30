import { StringParameter } from '@aws-cdk/aws-ssm';
import { Construct } from '@aws-cdk/core';
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
  hostedZone: IHostedZone;
  certificate: ICertificate | IRequestCertificateProps;
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
}

export class WebApplication extends Construct {
  configParameter: StringParameter | undefined;
  constructor(
    scope: Construct,
    id: string,
    protected props: IWebApplicationProps
  ) {
    super(scope, id);

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

    addCnameRecords(this, props, { distribution });
  }
}
