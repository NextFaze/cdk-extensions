import { WebClient } from '@slack/web-api';

export class SlackService {
  private webClient: WebClient;
  constructor(token: string) {
    this.webClient = new WebClient(token);
  }

  async getChannelIdByChannelName(
    name: string,
    types?: string,
    cursor = ''
  ): Promise<{ [key: string]: unknown; id: string; name: string } | undefined> {
    const response = await this.webClient.conversations.list({
      types,
      limit: 200,
      cursor,
    });

    if (!response.ok) {
      console.error(
        `Could not retrieve channel id.`,
        'Please request permissions for scope "channels:read:bot", and try again '
      );
      return;
    }

    const channels = response.channels as {
      id: string;
      name: string;
      [key: string]: unknown;
    }[];
    cursor = response.response_metadata?.next_cursor ?? '';

    const channel = channels?.find((channel) => channel.name === name);

    if (channel) {
      return channel;
    }

    if (cursor) {
      return this.getChannelIdByChannelName(name, types, cursor);
    }

    return;
  }
}
