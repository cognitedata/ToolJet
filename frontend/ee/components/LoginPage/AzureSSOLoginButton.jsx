import React from 'react';
import { buildURLWithQuery } from '@/_helpers/utils';

export default function AzureSSOLoginButton(props) {
  const randomString = (length) => {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const azureLogin = (e) => {
    e.preventDefault();
    const { clientId, tenantId } = props.configs;
    const authUrl = buildURLWithQuery(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`, {
      redirect_uri: `${window.public_config?.TOOLJET_HOST}/sso/azure${props.configId ? `/${props.configId}` : ''}`,
      response_type: 'id_token',
      scope: 'openid profile email',
      client_id: clientId,
      nonce: randomString(10), //for some security purpose
      response_mode: 'fragment',
    });
    window.location.href = authUrl;
  };

  return (
    <div data-cy="azure-tile">
      <div onClick={azureLogin} className="sso-button border-0 rounded-2">
        <img src="assets/images/onboardingassets/SSO/Azure.svg" data-cy="azure-sso-icon" />
        <span className="px-1 sso-info-text" data-cy="azure-sso-text">
          {props.text || 'Sign in with Azure'}
        </span>
      </div>
    </div>
  );
}
