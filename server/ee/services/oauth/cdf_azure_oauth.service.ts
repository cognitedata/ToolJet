import { Injectable } from '@nestjs/common';
import { AuthenticationResult, PublicClientApplication } from '@azure/msal-node';
import UserResponse from './models/user_response';

@Injectable()
export class CDFAzureOAuthService {
  #publicClientApplication: PublicClientApplication;

  constructor() {
    // Initializing PublicClientApplication with empty configuration, real values are set on signIn
    this.#publicClientApplication = new PublicClientApplication({
      auth: {
        clientId: '',
        clientSecret: '',
        authority: '',
      },
    });
  }

  #extractDetailsFromPayload(idTokenClaims: any): UserResponse {
    const email = idTokenClaims.emails[0];
    const userSSOId = idTokenClaims.oid;

    const firstName = idTokenClaims.given_name;
    const lastName = idTokenClaims.family_name;

    return { userSSOId, firstName, lastName, email, sso: 'cdf_azure' };
  }

  async signIn(token: string, configs: any): Promise<UserResponse> {
    console.log('Signing in!!!');
    this.#publicClientApplication = new PublicClientApplication({
      auth: {
        clientId: configs.clientId,
        clientSecret: configs.clientSecret,
        authority: `https://login.microsoftonline.com/${configs.tenantId}`,
      },
    });

    const response: AuthenticationResult = await this.#publicClientApplication.acquireTokenByCode({
      code: token,
      scopes: ['openid', 'profile', `${configs.cdfBaseUrl}/user_impersonation`],
      redirectUri: configs.redirectUri,
    });

    return this.#extractDetailsFromPayload(response.idTokenClaims);
  }
}
