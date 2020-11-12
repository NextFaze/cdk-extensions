import { S3 } from 'aws-sdk';
import { AssetsDownloader } from './assets-downloader';
import { AssetsUploader } from './assets-uploader';

// something changed

const s3 = new S3();
const assetsUploader = new AssetsUploader(s3);
const assetsDownloader = new AssetsDownloader(s3);

export const assetsUploaderHandler: Function = assetsUploader.run.bind(
  assetsUploader
);

export const assetsDownloaderHandler: Function = assetsDownloader.run.bind(
  assetsDownloader
);
