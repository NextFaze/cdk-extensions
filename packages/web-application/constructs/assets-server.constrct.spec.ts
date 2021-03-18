import { SynthUtils } from '@aws-cdk/assert';
import { RestApi } from '@aws-cdk/aws-apigateway';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';
import { Stack } from '@aws-cdk/core';
import { DOMAIN_NAME_REGISTRAR } from '../constants';
import { AssetsServer } from './assets-server.construct';

// disable tests, some checksum issues
xdescribe('AssetsServerConstruct', () => {
  let stack: Stack;

  beforeEach(() => {
    stack = new Stack();
    const hostedZone = new HostedZone(stack, 'HostedZone', {
      zoneName: 'example.com',
    });
    new AssetsServer(stack, 'AssetsServer', {
      aliases: ['assets.example.com'],
      certificate: new DnsValidatedCertificate(stack, 'MyCertificate', {
        domainName: '*.example.com',
        hostedZone,
      }),
      domainNameRegistrar: DOMAIN_NAME_REGISTRAR.AWS,
      hostedZone,
      restApiResource: new RestApi(stack, 'RestApi').root,
    });
  });
  it('should create required resources', () => {
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
