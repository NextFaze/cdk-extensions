import { SNSEvent, SNSMessage } from 'aws-lambda';

export abstract class BaseSNSHandler {
  protected abstract runExec(event: SNSEvent): Promise<unknown>;

  async run(event: SNSEvent): Promise<unknown> {
    try {
      return this.runExec(event);
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
