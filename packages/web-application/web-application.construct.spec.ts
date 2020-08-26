import { Stack } from '@aws-cdk/core';
import { HostedZone } from '@aws-cdk/aws-route53';
import { DnsValidatedCertificate } from '@aws-cdk/aws-certificatemanager';
import {
  expect as expectCDK,
  countResources,
  haveResource,
  SynthUtils,
} from '@aws-cdk/assert';
import { DOMAIN_NAME_REGISTRAR } from './constants';
import { WebApplication } from './web-application.construct';
import { User } from '@aws-cdk/aws-iam';

describe('WebApplication', () => {
  let stack: Stack;

  describe('with AWS registrar', () => {
    beforeAll(() => {
      stack = new Stack();
      const hostedZone = new HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
      });
      new WebApplication(stack, 'WebApplication', {
        hostedZone,
        domainNameRegistrar: DOMAIN_NAME_REGISTRAR.AWS,
        aliases: ['app.example.com', 'www.example.com'],
        certificate: new DnsValidatedCertificate(stack, 'Certificate', {
          domainName: 'example.com',
          hostedZone,
          subjectAlternativeNames: ['*.example.com'],
        }),
      });
    });

    it('should match snapshot', () => {
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    it('should create required resources', () => {
      expectCDK(stack).to(countResources('AWS::S3::Bucket', 1));
      expectCDK(stack).to(countResources('AWS::CloudFront::Distribution', 1));
    });

    it('should create record sets for both aliases', () => {
      expectCDK(stack).to(countResources('AWS::Route53::RecordSet', 2));
      expectCDK(stack).to(
        haveResource('AWS::Route53::RecordSet', {
          Name: 'app.example.com.',
          Type: 'CNAME',
        })
      );
      expectCDK(stack).to(
        haveResource('AWS::Route53::RecordSet', {
          Name: 'www.example.com.',
          Type: 'CNAME',
        })
      );
    });
  });

  describe('with no registrar', () => {
    beforeAll(() => {
      stack = new Stack();
      const hostedZone = new HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
      });
      new WebApplication(stack, 'WebApplication', {
        hostedZone,
        aliases: ['app.example.com', 'www.example.com'],
        certificate: new DnsValidatedCertificate(stack, 'Certificate', {
          domainName: 'example.com',
          hostedZone,
          subjectAlternativeNames: ['*.example.com'],
        }),
      });
    });

    it('should match snapshot', () => {
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    it('should not create record sets', () => {
      expectCDK(stack).notTo(haveResource('AWS::Route53::RecordSet'));
    });
  });

  describe('with dynamic parameter', () => {
    beforeAll(() => {
      stack = new Stack();
      const hostedZone = new HostedZone(stack, 'HostedZone', {
        zoneName: 'example.com',
      });
      new WebApplication(stack, 'WebApplication', {
        hostedZone,
        aliases: ['app.example.com', 'www.example.com'],
        certificate: new DnsValidatedCertificate(stack, 'Certificate', {
          domainName: 'example.com',
          hostedZone,
          subjectAlternativeNames: ['*.example.com'],
        }),
        dynamicParameter: {
          applicationUser: new User(stack, 'User'),
          initialValue: JSON.stringify({}),
        },
      });
    });

    it('should match snapshot', () => {
      expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
    });

    it('should create config param and policy', () => {
      expectCDK(stack).to(haveResource('AWS::SSM::Parameter'));
      expectCDK(stack).to(
        haveResource('AWS::IAM::Policy', {
          PolicyDocument: {
            Statement: [
              {
                Action: [
                  'ssm:DescribeParameters',
                  'ssm:GetParameters',
                  'ssm:GetParameter',
                  'ssm:GetParameterHistory',
                ],
                Effect: 'Allow',
              },
            ],
          },
        })
      );
    });
  });
});
