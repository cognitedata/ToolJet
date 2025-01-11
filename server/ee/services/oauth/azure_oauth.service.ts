import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import UserResponse from './models/user_response';

@Injectable()
export class AzureOAuthService {
  private createClient(tenantId: string): jwksClient.JwksClient {
    return jwksClient({
      jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      cache: false,
    });
  }

  private getKey(client: jwksClient.JwksClient, header: any, callback: any) {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err);
      } else {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      }
    });
  }

  #extractDetailsFromPayload(payload: any): UserResponse {
    const email = payload.email || payload.upn;
    const userSSOId = payload.sub;
    const firstName = payload.given_name;
    const lastName = payload.family_name;

    return { userSSOId, firstName, lastName, email, sso: 'cdf_azure' };
  }

  private normalizeConfig(configs: any): any {
    const normalizedConfigs = { ...configs };
    if (configs.tenant_id && !configs.tenantId) {
      normalizedConfigs.tenantId = configs.tenant_id;
    }
    return normalizedConfigs;
  }

  async signIn(token: string, configs: any): Promise<UserResponse> {
    const normalizedConfigs = this.normalizeConfig(configs);
    const client = this.createClient(normalizedConfigs.tenantId);
    console.log('foo10');
    console.log(normalizedConfigs);

    return new Promise((resolve, reject) => {
      jwt.verify(token, this.getKey.bind(this, client), { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          reject(new UnauthorizedException(err.message || 'Unauthorized'));
        } else {
          const payload = decoded as any;
          const userDetails = this.#extractDetailsFromPayload(payload);
          resolve(userDetails);
        }
      });
    });
  }
}
