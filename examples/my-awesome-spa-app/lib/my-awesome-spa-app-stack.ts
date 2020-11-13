import { RestApi } from '@aws-cdk/aws-apigateway';
import { HostedZone } from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';
import { AssetsServer, DOMAIN_NAME_REGISTRAR } from '~/cdkx/web-application';

export class MyAwesomeSpaAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myExistingApi = new RestApi(this, 'CDKXExampleApi', {
      // all all binary media types
      binaryMediaTypes: ['*/*'],
    });

    new AssetsServer(this, 'AssetsServer', {
      domainNameRegistrar: DOMAIN_NAME_REGISTRAR.NONE,
      hostedZone: HostedZone.fromHostedZoneAttributes(
        this,
        'FazeBizHostedZone',
        {
          hostedZoneId: 'Z02030431TZS61SLO9X1N',
          zoneName: 'faze.biz',
        }
      ),
      restApiResource: myExistingApi.root,
    });
  }
}
