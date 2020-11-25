import {
  ActionsBlock,
  Block,
  ContextBlock,
  DividerBlock,
  FileBlock,
  HeaderBlock,
  ImageBlock,
  InputBlock,
  SectionBlock,
} from '@slack/web-api';
import { ISlackSNSMessage } from './slack-subscription-handler';

export class SlackBlocksBuilder {
  constructor(private channelName: string) {}
  getDefaultTemplate({
    subject,
    message,
    timestamp,
    topicArn,
    messageId,
    unsubscribeUrl,
  }: ISlackSNSMessage): (
    | ImageBlock
    | Block
    | ContextBlock
    | ActionsBlock
    | DividerBlock
    | SectionBlock
    | InputBlock
    | FileBlock
    | HeaderBlock
  )[] {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${subject}*`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`\`${message}\`\`\``,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Timestamp:*\n${timestamp}\n*Message Id:*\n${messageId}\n*Topic:*\n${topicArn}`,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Unsubscribe',
              emoji: true,
            },
            style: 'danger',
            url: unsubscribeUrl,
          },
        ],
      },
    ];
  }
}
