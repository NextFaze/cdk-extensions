import { SNSEvent } from 'aws-lambda';
import { BaseSNSHandler } from './base-sns-handler';
import { SSM } from 'aws-sdk';
import { ISlackConfigParam } from '../subscriptions/slack-subscription';
import { SlackService } from './slack.service';
import { SlackBlocksBuilder } from './slack-blocks-builder';

export interface ISlackSNSMessage {
  message: string;
  subject: string;
  unsubscribeUrl: string;
  timestamp: string;
  messageId: string;
  topicArn: string;
}

export class SlackSubscriptionHandler extends BaseSNSHandler {
  private ssmClient: SSM;
  constructor() {
    super();
    this.ssmClient = new SSM({
      apiVersion: '2014-11-06',
    });
  }
  async runExec(event: SNSEvent): Promise<{ success: boolean } | undefined> {
    const configParamName = process.env.CONFIG_PARAM;

    if (!configParamName) {
      console.error(`Missing required config parameter.`);
      return;
    }

    const rawParamValue = await this.ssmClient
      .getParameter({
        Name: configParamName,
      })
      .promise();

    if (!rawParamValue.Parameter?.Value) {
      console.error(
        `Could not resolve parameter "${configParamName}" from store.`
      );
      return;
    }

    const slackConfig = JSON.parse(
      rawParamValue.Parameter.Value
    ) as ISlackConfigParam;

    const { authToken, channelName, channelTypes } = slackConfig;
    let { channelId } = slackConfig;

    if (!authToken) {
      console.error(
        `Auth Token is required for sending notifications to slack, refer to https://api.slack.com/bot-users`
      );
      return;
    }

    const slackService = new SlackService(authToken);
    if (!channelId) {
      // if no channel id is provided, find one and save it back in param store,
      // so subsequent runs do not need to fetch it from slack api again

      const resolvedChannelId = await slackService.getChannelIdByChannelName(
        channelName,
        channelTypes
      );

      if (!resolvedChannelId) {
        console.warn(
          `Could not resolve channel id for channel ${channelId}, message will to first channel matching ${channelName}.`
        );
      }

      if (resolvedChannelId) {
        channelId = resolvedChannelId.id;
        await this.ssmClient
          .putParameter({
            Name: configParamName,
            Value: JSON.stringify({ ...slackConfig, channelId }),
            Overwrite: true,
          })
          .promise();
      }
    }

    const {
      Message,
      Subject,
      UnsubscribeUrl,
      Timestamp,
      MessageId,
      TopicArn,
    } = this.getParsedEvent(event);
    const subject =
      !Subject || Subject === 'null' ? 'New Notification' : Subject;

    const defaultMessageTemplate = new SlackBlocksBuilder(
      channelName
    ).getDefaultTemplate({
      subject,
      message: Message,
      messageId: MessageId,
      timestamp: Timestamp,
      topicArn: TopicArn,
      unsubscribeUrl: UnsubscribeUrl,
    });

    const postMessageResponse = await slackService.webClient.chat.postMessage({
      token: authToken,
      channel: channelId ?? channelName,
      text: subject,
      blocks: defaultMessageTemplate,
    });

    if (!postMessageResponse.ok) {
      console.error(
        'Could Not post notification to slack',
        'Please request permissions for scope "chat:write:bot", and make sure bot is in the channel.'
      );
      return this.bail(postMessageResponse.error);
    }

    return { success: true };
  }
}
