import { ServicePrincipal } from '@aws-cdk/aws-iam';
import { Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import {
  ITopic,
  ITopicSubscription,
  SubscriptionProtocol,
  TopicSubscriptionConfig,
  SubscriptionFilter,
} from '@aws-cdk/aws-sns';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { Construct, Duration, Names } from '@aws-cdk/core';
import { pascalCase } from 'change-case';
import path from 'path';

export interface ISlackConfigParam {
  /**
   * @default channel Id will be resolved from given channel name
   */
  channelId?: string;
  channelName: string;
  /**
   * @default public_channel
   */
  channelTypes?: string;
  authToken: string;
}

/**
 * @param channelName Channel to send notification to
 * @param filterPolicy Optional filter policy to apply on sns target
 */
export interface ISlackSubscriptionProps {
  /**
   * @default - channel Id will be resolved from given channel name
   */
  channelId?: string;
  channelName: string;
  filterPolicy?: { [key: string]: SubscriptionFilter };
}

/**
 * @summary Configures required resources to enable sns -> slack notifications.
 * Supplied Auth token must have at least "chat:write:bot" scope. When channel id is not provided,
 * additional "channels:read"  "groups:read"  "im:read"  "mpim:read" scopes are required.
 * @see https://api.slack.com/scopes
 *
 */
export class SlackSubscription implements ITopicSubscription {
  constructor(private props: ISlackSubscriptionProps) {}

  bind(topic: ITopic): TopicSubscriptionConfig {
    const scope = this._resolveScopeFromTopic(topic);

    const configParam = new StringParameter(
      scope,
      pascalCase(`${this.props.channelName}-ConfigParameter`),
      {
        stringValue: JSON.stringify({
          channelId: this.props.channelId ?? '',
          channelName: this.props.channelName,
          channelType: 'public_channel',
          authToken: '',
        } as ISlackConfigParam),
        description: 'Slack configuration parameter',
      }
    );

    const slackHandler = new NodejsFunction(scope, 'Handler', {
      runtime: Runtime.NODEJS_12_X,
      // slightly increase duration in case we need to \
      // scan all slack channels to find the one we are looking for
      timeout: Duration.minutes(3),
      entry: path.resolve(
        __dirname,
        '../handlers/_entries/slack-subscription-handler.ts'
      ),
      description: 'Slack subscription Handler',
      environment: {
        CONFIG_PARAM: configParam.parameterName,
      },
    });

    // allow topic to invoke slack handler
    slackHandler.addPermission(
      `AllowInvoke:${Names.nodeUniqueId(topic.node)}`,
      {
        sourceArn: topic.topicArn,
        principal: new ServicePrincipal('sns.amazonaws.com'),
      }
    );

    configParam.grantRead(slackHandler);
    configParam.grantWrite(slackHandler);

    return {
      subscriberScope: slackHandler,
      subscriberId: topic.node.id,
      endpoint: slackHandler.functionArn,
      protocol: SubscriptionProtocol.LAMBDA,
      filterPolicy: this.props.filterPolicy,
    };
  }

  private _resolveScopeFromTopic(topic: ITopic): Construct {
    return topic.node.scope as Construct;
  }
}
