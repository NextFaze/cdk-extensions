import { Blocks, Elements, Message } from 'slack-block-builder';
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
  }: ISlackSNSMessage): string {
    return Message()
      .channel(this.channelName)
      .text(subject)
      .blocks(
        // title
        Blocks.Section({
          text: subject,
        }),
        Blocks.Section({
          text: message,
        }),
        Blocks.Section({
          text: `*Timestamp:*\n${timestamp}\n*Message Id:*\n${messageId}\n*Topic:*\n${topicArn}`,
        }),
        Blocks.Divider(),
        Blocks.Actions().elements(
          Elements.Button({ text: 'Unsubscribe' }).url(unsubscribeUrl).danger()
        )
      )
      .asUser()
      .buildToJSON();
  }
}
