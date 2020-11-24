import { Topic } from '@aws-cdk/aws-sns';
import { App, Stack, StackProps } from '@aws-cdk/core';
import { SlackSubscription } from '~/cdkx/aws-sns-subscriptions/subscriptions/slack-subscription';

export type ISubscriptionStackProps = StackProps;

export class SubscriptionStack extends Stack {
  constructor(scope: App, id: string, props: ISubscriptionStackProps) {
    super(scope, id, props);

    const testTopic = new Topic(this, 'Topic');
    const slackSubscription = new SlackSubscription({
      channelName: 'test-channel',
    });

    testTopic.addSubscription(slackSubscription);
  }
}
