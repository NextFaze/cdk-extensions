import { Distribution } from '@aws-cdk/aws-cloudfront';
import { Bucket, CorsRule, IBucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import { addAssetsServerDistribution } from '../facades/add-assets-server-distribution';

export interface IAssetsServerProps {
  bucketConfig: {
    useExisting: Bucket | IBucket;
    corsRules: CorsRule[];
  };
  aliases: string[];
}

export class AssetsServer extends Construct {
  readonly bucket: Bucket | IBucket;
  readonly distribution: Distribution;
  constructor(scope: Construct, id: string, private props: IAssetsServerProps) {
    super(scope, id);

    const { bucketConfig, aliases } = props;
    if (!this.bucket) {
      this.bucket = new Bucket(scope, 'OriginBucket', {
        versioned: true,
        cors: bucketConfig.corsRules,
      });
    } else {
      this.bucket = bucketConfig.useExisting;
    }

    this.distribution = addAssetsServerDistribution(this, {
      s3BucketSource: this.bucket,
      aliases,
    });
  }
}
