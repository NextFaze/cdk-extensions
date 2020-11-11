import { IResource } from '@aws-cdk/aws-apigateway';
import { Distribution } from '@aws-cdk/aws-cloudfront';
import { IHostedZone } from '@aws-cdk/aws-route53';
import { Bucket, CorsRule, IBucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import { DOMAIN_NAME_REGISTRAR } from '../constants';
import { addAssetsServerApiResource } from '../facades/add-assets-server-api-resource';
import { addAssetsServerDistribution } from '../facades/add-assets-server-distribution';
import { addCnameRecords } from '../facades/add-cname-records';

export interface IAssetsServerProps {
  bucketConfig?: {
    useExisting?: Bucket | IBucket;
    corsRules?: CorsRule[];
  };
  aliases: string[];
  domainNameRegistrar: DOMAIN_NAME_REGISTRAR;
  hostedZone: IHostedZone;
  restApiResource: IResource;
}

export class AssetsServer extends Construct {
  readonly bucket: Bucket | IBucket;
  readonly distribution: Distribution;
  constructor(scope: Construct, id: string, private props: IAssetsServerProps) {
    super(scope, id);

    const { bucketConfig, aliases, hostedZone, domainNameRegistrar } = props;
    if (!bucketConfig?.useExisting) {
      this.bucket = new Bucket(scope, 'OriginBucket', {
        versioned: true,
        cors: bucketConfig?.corsRules,
      });
    } else {
      this.bucket = bucketConfig?.useExisting;
    }

    this.distribution = addAssetsServerDistribution(this, {
      s3BucketSource: this.bucket,
      aliases,
    });

    addAssetsServerApiResource(this, props, {
      s3Bucket: this.bucket,
      assetsPublicHost:
        aliases[0] ?? `http://${this.distribution.distributionDomainName}`,
    });

    addCnameRecords(this, {
      distribution: this.distribution,
      aliases,
      hostedZone,
      domainNameRegistrar,
    });
  }
}
