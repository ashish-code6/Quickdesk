import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean {

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (user.role !== "AGENT") {
      throw new ForbiddenException("Only Agent can access this API");
    }

    return true;

  }

}