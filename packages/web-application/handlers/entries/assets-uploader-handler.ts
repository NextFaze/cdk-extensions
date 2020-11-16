import { AssetsUploader } from '../assets-uploader';
import { s3 } from '../commons';

const assetsUploader = new AssetsUploader(s3);
export const handler: Function = assetsUploader.run.bind(assetsUploader);
