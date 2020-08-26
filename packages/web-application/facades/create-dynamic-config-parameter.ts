import { WebApplication } from '../web-application.construct';
import {
  StringParameter,
  ParameterTier,
  ParameterType,
} from '@aws-cdk/aws-ssm';

export function createDynamicConfigParameter(
  this: WebApplication
): StringParameter | undefined {
  const { dynamicParameter, aliases } = this.props;
  if (!dynamicParameter) {
    return;
  }

  const param = new StringParameter(this, 'ConfigParameter', {
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
