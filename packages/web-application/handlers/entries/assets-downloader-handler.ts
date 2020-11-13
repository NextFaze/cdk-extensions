import { AssetsDownloader } from '../assets-downloader';
import { s3 } from '../commons';

const assetsDownloader = new AssetsDownloader(s3);
export const handler: Function = assetsDownloader.run.bind(assetsDownloader);
