import { RestApi } from '@aws-cdk/aws-apigateway';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { HostedZone } from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';
import { RemovalPolicy, StackProps } from '@aws-cdk/core';
import {
  AssetsServer,
  DOMAIN_NAME_REGISTRAR,
  WebApplication,
} from '~/cdkx/web-application';

export interface IMyAwesomeSpaAppStackProps extends StackProps {
  certificateArn: string;
  zoneId: string;
  zoneName: string;
  webAliases: string[];
  cdnAliases: string[];
}

export class MyAwesomeSpaAppStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: IMyAwesomeSpaAppStackProps
  ) {
    super(scope, id, props);
    const { certificateArn, zoneId, zoneName, webAliases, cdnAliases } = props;

    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      certificateArn
    );

    const fazeBizZone = HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        hostedZoneId: zoneId,
        zoneName: zoneName,
      }
    );

    // web application
    new WebApplication(this, 'CDKXExampleSPAApp', {
      aliases: webAliases,
      certificate,
      hostedZone: fazeBizZone,
    });

    const myExistingApi = new RestApi(this, 'CDKXExampleApi', {
      // all all binary media types
      binaryMediaTypes: ['*/*'],
    });

    // assets server
    new AssetsServer(this, 'AssetsServer', {
      removalPolicy: RemovalPolicy.DESTROY,
      aliases: cdnAliases,
      certificate,
      domainNameRegistrar: DOMAIN_NAME_REGISTRAR.NONE,
      hostedZone: fazeBizZone,
      restApiResource: myExistingApi.root,
    });
  }
}
