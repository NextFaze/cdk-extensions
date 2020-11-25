// init before any other imports
const ssmMock = jest.fn().mockReturnValue({
  getParameter: jest.fn(),
  putParameter: jest.fn(),
});

const slackServiceMock = jest.fn().mockReturnValue({
  webClient: {
    chat: {
      postMessage: jest.fn(),
    },
  },
  getChannelIdByChannelName: jest.fn(),
});

jest.mock('aws-sdk', () => ({
  SSM: ssmMock,
}));
jest.mock('./slack.service', () => ({ SlackService: slackServiceMock }));

import { ISlackConfigParam } from '../subscriptions/slack-subscription';
import { SlackSubscriptionHandler } from './slack-subscription-handler';
import { getMockSnsEvent } from './__test__/get-mock-sns-event';

let subHandler: SlackSubscriptionHandler;
beforeEach(() => {
  process.env.CONFIG_PARAM = '/path/to/config/param';
  subHandler = new SlackSubscriptionHandler();
});

afterEach(() => {
  slackServiceMock().getChannelIdByChannelName.mockClear();
  slackServiceMock().webClient.chat.postMessage.mockClear();
  delete process.env.CONFIG_PARAM;
});

test('does not send notification when missing required params', async () => {
  delete process.env.CONFIG_PARAM;
  ssmMock().getParameter.mockReturnValue({
    promise: () => ({}),
  });

  const response = await subHandler.run(getMockSnsEvent());
  expect(ssmMock().getParameter).not.toHaveBeenCalled();
  expect(response).toBeUndefined();
});

test('does not send notification when no auth token is provided', async () => {
  ssmMock().getParameter.mockReturnValue({
    promise: () => ({
      Parameter: {
        Value: JSON.stringify({
          channelId: '',
        } as ISlackConfigParam),
      },
    }),
  });

  const response = await subHandler.run(getMockSnsEvent());
  expect(response).toBeUndefined();
});

test('sends notification with channel id', async () => {
  ssmMock().getParameter.mockReturnValue({
    promise: () => ({
      Parameter: {
        Value: JSON.stringify({
          channelId: '1234',
          authToken: 'SECURE_AUTH_TOKEN',
          channelName: 'random',
          channelTypes: 'public_channel',
        } as ISlackConfigParam),
      },
    }),
  });

  slackServiceMock().webClient.chat.postMessage.mockReturnValue({
    ok: true,
  });

  const response = await subHandler.run(getMockSnsEvent());
  expect(slackServiceMock().getChannelIdByChannelName).not.toHaveBeenCalled();
  expect(response).toEqual({
    success: true,
  });
});

test('sends notification with resolved channel id and also updates ssm parameter for avoid future runs to have to fetch channelId', async () => {
  ssmMock().getParameter.mockReturnValue({
    promise: () => ({
      Parameter: {
        Value: JSON.stringify({
          channelId: '',
          authToken: 'SECURE_AUTH_TOKEN',
          channelName: 'random',
          channelTypes: 'public_channel',
        } as ISlackConfigParam),
      },
    }),
  });

  ssmMock().putParameter.mockReturnValue({
    promise: () => ({}),
  });
  slackServiceMock().getChannelIdByChannelName.mockReturnValue({
    id: '1234',
  });
  slackServiceMock().webClient.chat.postMessage.mockReturnValue({
    ok: true,
  });

  const response = await subHandler.run(getMockSnsEvent());
  expect(ssmMock().putParameter).toHaveBeenCalledTimes(1);
  expect(ssmMock().putParameter).toHaveBeenCalledWith({
    Name: '/path/to/config/param',
    Overwrite: true,
    Value:
      '{"channelId":"1234","authToken":"SECURE_AUTH_TOKEN","channelName":"random","channelTypes":"public_channel"}',
  });
  expect(slackServiceMock().getChannelIdByChannelName).toHaveBeenCalledTimes(1);
  expect(slackServiceMock().getChannelIdByChannelName).toHaveBeenCalledWith(
    'random',
    'public_channel'
  );
  expect(slackServiceMock().webClient.chat.postMessage).toHaveBeenCalledTimes(
    1
  );
  expect(slackServiceMock().webClient.chat.postMessage).toHaveBeenCalledWith({
    blocks: [
      {
        text: {
          text: '*TestInvoke*',
          type: 'mrkdwn',
        },
        type: 'section',
      },
      {
        text: {
          text: '````Hello from SNS!```',
          type: 'mrkdwn',
        },
        type: 'section',
      },
      {
        text: {
          text: `*Timestamp:*
2019-01-02T12:45:07.000Z
*Message Id:*
95df01b4-ee98-5cb9-9903-4c221d41eb5e
*Topic:*
arn:aws:sns:us-east-2:123456789012:sns-lambda`,
          type: 'mrkdwn',
        },
        type: 'section',
      },
      {
        type: 'divider',
      },
      {
        elements: [
          {
            style: 'danger',
            text: {
              emoji: true,
              text: 'Unsubscribe',
              type: 'plain_text',
            },
            type: 'button',
            url:
              'https://sns.us-east-2.amazonaws.com/?Action=Unsubscribe&amp;SubscriptionArn=arn:aws:sns:us-east-2:123456789012:test-lambda:21be56ed-a058-49f5-8c98-aedd2564c486',
          },
        ],
        type: 'actions',
      },
    ],
    channel: '1234',
    text: 'TestInvoke',
    token: 'SECURE_AUTH_TOKEN',
  });

  expect(response).toEqual({
    success: true,
  });
});

test('sends notification with channel name if fails to resolve channelId', async () => {
  ssmMock().getParameter.mockReturnValue({
    promise: () => ({
      Parameter: {
        Value: JSON.stringify({
          channelId: '',
          authToken: 'SECURE_AUTH_TOKEN',
          channelName: 'random',
          channelTypes: 'public_channel',
        } as ISlackConfigParam),
      },
    }),
  });

  slackServiceMock().getChannelIdByChannelName.mockReturnValue();

  slackServiceMock().webClient.chat.postMessage.mockReturnValue({
    ok: true,
  });

  const response = await subHandler.run(getMockSnsEvent());
  expect(slackServiceMock().getChannelIdByChannelName).toHaveBeenCalledTimes(1);
  expect(slackServiceMock().getChannelIdByChannelName).toHaveBeenCalledWith(
    'random',
    'public_channel'
  );
  expect(slackServiceMock().webClient.chat.postMessage).toHaveBeenCalledTimes(
    1
  );
  expect(response).toEqual({
    success: true,
  });
});
