# AWS SNS Subscription extensions

## Subscription targets

### Slack Subscription

#### Get it from npm

```shell
npm install @cdkx/aws-sns-subscriptions --save // using npm

yarn add @cdkx/aws-sns-subscriptions // using yarn
```

#### Getting Started

Add a SNS Topic to your stack

```typescript
import { Topic } from '@aws-cdk/aws-sns';

// create topic
const myTopic = new Topic(this, 'MyTopic');
```

Add an slack bot enabled subscription to your topic.

```typescript
import { SlackSubscription } from '@cdkx/aws-sns-subscriptions';

// add slack subscription to alongside with other subscription targets
myTopic.addSubscription(
  new SlackSubscription({
    channelName: 'my-channel',
  })
);
```

#### Add Token to parameter

_Once stack has deployed, a new System Parameter resources will be made available. There add a slack bot oAuth token next to property `authToken`._

Required Scopes for these token depend of level of context provided to subscription target.
When `channelId` is provided, OAuthToken will only need `chat:write:bot`. But if no `channelId` is preset, channel id will be resolved from slack api and to do that OAuth token will need additional
`channels:read`, `groups:read`, `im:read`, `mpim:read` scopes.
