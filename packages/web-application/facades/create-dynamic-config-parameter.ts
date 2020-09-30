import {
  WebApplication,
  IWebApplicationProps,
} from '../constructs/web-application.construct';
import {
  StringParameter,
  ParameterTier,
  ParameterType,
} from '@aws-cdk/aws-ssm';

export function createDynamicConfigParameter(
  scope: WebApplication,
  props: IWebApplicationProps
): StringParameter | undefined {
  const { dynamicParameter, aliases } = props;
  if (!dynamicParameter) {
    return;
  }

  const param = new StringParameter(scope, 'ConfigParameter', {
    stringValue: dynamicParameter.initialValue,
    tier: ParameterTier.INTELLIGENT_TIERING,
    description: `Dynamic Config Parameter for ${aliases[0]}`,
    allowedPattern: dynamicParameter.allowedPattern,
    type: ParameterType.STRING,
    parameterName: dynamicParameter.parameterName,
  });

  param.grantRead(dynamicParameter.applicationUser);
  return param;
}
