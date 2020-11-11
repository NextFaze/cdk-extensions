export abstract class BaseHandler {
  protected encodedResponse({
    statusCode = 200,
    body,
    headers,
  }: {
    statusCode: number;
    body: unknown;
    headers?: { [key: string]: string };
  }): {
    statusCode: number;
    headers: { 'Content-Type': string };
    body: string;
    isBase64Encoded: boolean;
  } {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
      isBase64Encoded: false,
    };
  }
}
