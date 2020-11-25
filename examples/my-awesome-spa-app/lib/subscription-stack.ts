import { Topic } from '@aws-cdk/aws-sns';
import { App, Stack, StackProps } from '@aws-cdk/core';
import { SlackSubscription } from '~/cdkx/aws-sns-subscriptions';

export type ISubscriptionStackProps = StackProps;

export class SubscriptionStack extends Stack {
  constructor(scope: App, id: string, props: ISubscriptionStackProps) {
    super(scope, id, props);

    //new topic
    const testTopic = new Topic(this, 'Topic');

    const slackSubscription = new SlackSubscription({
      channelName: 'random',
    });

    // use slack subscription same as you would any other type of subscriptions
    testTopic.addSubscription(slackSubscription);
  }
}
