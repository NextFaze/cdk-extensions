import { SNSEvent, SNSMessage } from 'aws-lambda';

export abstract class BaseSNSHandler {
  abstract runExec(event: SNSEvent): unknown;

  run(event: SNSEvent): ReturnType<this['runExec']> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.runExec(event) as any;
    } catch (err) {
      // when unable to send notification via slack
      console.error(err);
      throw err;
    }
  }

  protected bail<Error>(error?: Error): { success: boolean; error?: Error } {
    if (error) {
      console.error(error);
      return { success: false, error };
    }
    return { success: false };
  }

  protected getParsedEvent(event: SNSEvent): SNSMessage {
    // there will always be one record in event as per current api spec
    return event.Records[0]?.Sns;
  }
}
