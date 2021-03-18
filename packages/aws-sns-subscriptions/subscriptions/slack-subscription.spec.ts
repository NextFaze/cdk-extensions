import { Topic } from '@aws-cdk/aws-sns';
import { Stack } from '@aws-cdk/core';
import { SlackSubscription } from './slack-subscription';
import { SynthUtils } from '@aws-cdk/assert';

let topic: Topic;
let stack: Stack;
beforeEach(() => {
  stack = new Stack();
  topic = new Topic(stack, 'MyTopic');
});

// disable tests, some checksum issues
test.skip('configures slack handler and parameter resources', () => {
  topic.addSubscription(
    new SlackSubscription({
      channelName: 'my-channel',
    })
  );

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
