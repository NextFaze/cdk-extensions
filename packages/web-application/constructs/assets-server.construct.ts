import { IResource } from '@aws-cdk/aws-apigateway';
import { Certificate, ICertificate } from '@aws-cdk/aws-certificatemanager';
import { Distribution } from '@aws-cdk/aws-cloudfront';
import { IHostedZone } from '@aws-cdk/aws-route53';
import { Bucket, CorsRule, IBucket } from '@aws-cdk/aws-s3';
import { Construct, RemovalPolicy } from '@aws-cdk/core';
import { DOMAIN_NAME_REGISTRAR } from '../constants';
import { addAssetsServerApiResource } from '../facades/add-assets-server-api-resource';
import { addAssetsServerDistribution } from '../facades/add-assets-server-distribution';
import { addCnameRecords } from '../facades/add-cname-records';

export interface IAssetsServerProps {
  bucketConfig?: {
    /**
     * @default - New bucket is created and used as a storage for assets
     */
    useExisting?: Bucket | IBucket;
    /**
     * @default none - No cors rules are applied
     */
    corsRules?: CorsRule[];
  };
  /**
   * @default none No aliases are registered
   */
  aliases?: string[];
  domainNameRegistrar: DOMAIN_NAME_REGISTRAR;
  hostedZone: IHostedZone;
  restApiResource: IResource;
  /**
   * @default cloudfront Default cloudfront certificate '*.cloudfront.net'
   */
  certificate?: ICertificate | Certificate;
  /**
   * @default orphaned - resources will be orphaned, choose destroy to auto remove on destroy
   */
  removalPolicy?: RemovalPolicy;
}

export class AssetsServer extends Construct {
  readonly bucket: Bucket | IBucket;
  readonly distribution: Distribution;
  constructor(scope: Construct, id: string, props: IAssetsServerProps) {
    super(scope, id);
    const {
      bucketConfig,
      aliases = [],
      hostedZone,
      domainNameRegistrar,
      certificate,
      removalPolicy,
    } = props;

    if (aliases?.length && !certificate) {
      throw new Error(
        'Certificate must be supplied when using custom domain name!'
      );
    }
    if (!bucketConfig?.useExisting) {
      this.bucket = new Bucket(scope, 'OriginBucket', {
        versioned: true,
        cors: bucketConfig?.corsRules,
        removalPolicy,
      });
    } else {
      this.bucket = bucketConfig?.useExisting;
    }

    this.distribution = addAssetsServerDistribution(this, {
      s3BucketSource: this.bucket,
      certificate,
      aliases,
    });

    addAssetsServerApiResource(this, props, {
      s3Bucket: this.bucket,
      assetsPublicHost:
        aliases[0] ?? `https://${this.distribution.distributionDomainName}`,
    });

    addCnameRecords(this, {
      distribution: this.distribution,
      aliases,
      hostedZone,
      domainNameRegistrar,
    });
  }
}
