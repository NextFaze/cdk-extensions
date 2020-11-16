import { s3 } from '../commons';
import { PreSignedUrlGenerator } from '../pre-signed-url-generator';

const preSignedPostUrlGen = new PreSignedUrlGenerator(s3);
export const handler: Function = preSignedPostUrlGen.run.bind(
  preSignedPostUrlGen
);
