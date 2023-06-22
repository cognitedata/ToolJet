import { Injectable } from '@nestjs/common';
import UserResponse from './models/user_response';

@Injectable()
export class CDFAzureOAuthService {
  constructor() {}

  #extractDetailsFromPayload(payload: any): UserResponse {
    const email = payload.email;
    const userSSOId = payload.oid;
    const [firstName, lastName] = payload.name.split(' ');

    return { userSSOId, firstName, lastName, email, sso: 'cdf_azure' };
  }

  async signIn(id_token: string, configs: any): Promise<UserResponse> {
    try {
      const jose = require('jose');
      const JWKS = jose.createRemoteJWKSet(
        new URL(`https://login.microsoftonline.com/${configs.tenantId}/discovery/v2.0/keys`)
      );

      const payload = await jose.jwtVerify(id_token, JWKS);
      return this.#extractDetailsFromPayload(payload.payload);
    } catch (error) {
      throw new Error('Token verification failed: ' + error);
    }
  }
}
