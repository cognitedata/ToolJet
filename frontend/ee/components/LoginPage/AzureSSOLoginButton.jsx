import React from 'react';
import { buildURLWithQuery } from '@/_helpers/utils';

export default function AzureSSOLoginButton(props) {
  const randomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const azureLogin = (e) => {
    e.preventDefault();
    props.setSignupOrganizationDetails && props.setSignupOrganizationDetails();
    props.setRedirectUrlToCookie && props.setRedirectUrlToCookie();
    console.log(props.configs);

    const { client_id, tenant_id, enable_cdf_access, cdf_cluster } = props.configs;
    let scope = 'openid profile email';
    let response_type = 'id_token';

    if (enable_cdf_access) {
      scope += ` https://${cdf_cluster}.cognitedata.com/user_impersonation`;
      response_type += ' token';
    }

    const initialAuthUrl = buildURLWithQuery(`https://login.microsoftonline.com/${tenant_id}/oauth2/v2.0/authorize`, {
      client_id,
      response_type,
      redirect_uri: `${window.public_config?.TOOLJET_HOST}${window.public_config?.SUB_PATH ?? '/'}sso/cdf_azure${
        props.configId ? `/${props.configId}` : ''
      }`,
      scope,
      response_mode: 'fragment',
      nonce: randomString(10),
      state: randomString(10),
    });
    window.location.href = initialAuthUrl;
  };

  return (
    <div data-cy="azure-tile">
      <div onClick={azureLogin} className="sso-button border-0 rounded-2">
        <img src="assets/images/onboardingassets/SSO/Azure.svg" data-cy="azure-sso-icon" />
        <span className="px-1 sso-info-text" data-cy="azure-sso-text">
          {`${props.buttonText} Microsoft`}
        </span>
      </div>
    </div>
  );
}
