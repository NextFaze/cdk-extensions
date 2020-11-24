import { SNSEvent } from 'aws-lambda';
import { BaseSNSHandler } from './base-sns-handler';
import { SSM } from 'aws-sdk';
import { ISlackConfigParam } from '../subscriptions/slack-subscription';
import { WebClient } from '@slack/web-api';
import { SlackService } from './slack.service';

export class SlackSubscriptionHandler extends BaseSNSHandler {
  private ssmClient: SSM;
  private webClient: WebClient;
  constructor() {
    super();
    this.ssmClient = new SSM({
      apiVersion: '2014-11-06',
    });
  }
  protected async runExec(event: SNSEvent): Promise<unknown> {
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
      channelId = (
        await slackService.getChannelIdByChannelName(channelName, channelTypes)
      )?.id;

      await this.ssmClient
        .putParameter({
          Name: configParamName,
          Value: JSON.stringify({ ...slackConfig, channelId }),
        })
        .promise();
    }

    const {
      Message,
      Subject,
      UnsubscribeUrl,
      Timestamp,
      MessageAttributes,
    } = this.getParsedEvent(event);

    // TODO: send message to slack using default template

    throw new Error('Method not implemented.');
  }

  // private resolveChannelIdFromName(
  //   name: string,
  //   types: string,
  //   cursor: string = ''
  // ) {
  //   const channelsResponse = await this.webClient.channels.list({
  //     types,
  //     limit: 200,
  //     cursor,
  //   });
  // }
}
