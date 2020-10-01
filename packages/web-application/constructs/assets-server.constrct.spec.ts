import { SynthUtils } from '@aws-cdk/assert';
import { HostedZone } from '@aws-cdk/aws-route53';
import { Stack } from '@aws-cdk/core';
import { DOMAIN_NAME_REGISTRAR } from '../constants';
import { AssetsServer } from './assets-server.construct';

describe('AssetsServerConstruct', () => {
  let stack: Stack;

  beforeEach(() => {
    stack = new Stack();
    new AssetsServer(stack, 'AssetsServer', {
      aliases: ['assets.example.com'],
      domainNameRegistrar: DOMAIN_NAME_REGISTRAR.AWS,
      hostedZone: new HostedZone(stack, 'HostedZone', {
        zoneName: 'Test',
      }),
    });
  });
  it('should create required resources', () => {
    expect(SynthUtils.synthesize(stack).template).toMatchSnapshot();
  });
});
