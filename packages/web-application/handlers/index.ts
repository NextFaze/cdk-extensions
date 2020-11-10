import { S3 } from 'aws-sdk';
import { AssetsUploader } from './assets-uploader';

console.log('Bundling handler...');

const s3 = new S3();
const assetsUploader = new AssetsUploader(s3);

export const assetsUploaderHandler: Function = assetsUploader.run.bind(
  assetsUploader
);
