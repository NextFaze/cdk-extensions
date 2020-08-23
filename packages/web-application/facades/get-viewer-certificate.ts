import {
  DnsValidatedCertificate,
  ICertificate,
} from '@aws-cdk/aws-certificatemanager';
import {
  WebApplication,
  IRequestCertificateProps,
} from '../web-application.construct';
import {
  ViewerCertificate,
  SSLMethod,
  SecurityPolicyProtocol,
} from '@aws-cdk/aws-cloudfront';

export function getViewerCertificate(this: WebApplication): ViewerCertificate {
  const { certificate, hostedZone, aliases } = this.props;

  let viewerCertificate = certificate as ICertificate;
  if (!isICertificate(certificate)) {
    viewerCertificate = new DnsValidatedCertificate(this, 'ViewerCertificate', {
      domainName: certificate.domainName,
      hostedZone: hostedZone,
      // cloudfront require the region to be us-east-1 as of 2020, Aug 23.
      region: 'us-east-1',
    });
  }

  return ViewerCertificate.fromAcmCertificate(viewerCertificate, {
    aliases,
    securityPolicy: SecurityPolicyProtocol.TLS_V1_2_2019,
    sslMethod: SSLMethod.SNI,
  });
}

/**
 * Checks if given certificates is of type ICertificate
 * @param certificate
 */
function isICertificate(
  certificate: ICertificate | IRequestCertificateProps
): certificate is ICertificate {
  return (certificate as ICertificate).certificateArn !== undefined;
}
