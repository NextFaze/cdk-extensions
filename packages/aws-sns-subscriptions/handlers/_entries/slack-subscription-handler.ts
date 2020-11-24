import { SNSEvent } from 'aws-lambda';

export const handler = (event: SNSEvent): void => {
  console.log('SNS Event Received: ', JSON.stringify(event));
};
