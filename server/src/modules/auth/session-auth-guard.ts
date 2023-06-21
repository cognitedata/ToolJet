import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SessionAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<any> {
    let user;
    const request = context.switchToHttp().getRequest();
    console.log(`SessionAuthGuard!!! cookie ${request?.cookies['tj_auth_token']}`);
    request.isGetUserSession = true;
    if (request?.cookies['tj_auth_token']) {
      try {
        user = await super.canActivate(context);
      } catch (err) {
        return false;
      }
      console.log(`SessionAuthGuard!!! Success ${user}`);
      return user;
    }
    return false;
  }
}
