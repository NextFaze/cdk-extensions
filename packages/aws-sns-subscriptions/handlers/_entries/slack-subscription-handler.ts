import { SNSEvent } from 'aws-lambda';
import { SlackSubscriptionHandler } from '../slack-subscription-handler';

export const handler = (event: SNSEvent): Promise<unknown> =>
  new SlackSubscriptionHandler().run(event);
