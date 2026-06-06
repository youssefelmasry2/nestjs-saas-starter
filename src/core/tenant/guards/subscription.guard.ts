import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRES_SUBSCRIPTION_KEY } from '../decorators/tenant.decorator';
import { SubscriptionsService } from '../../../modules/subscriptions/subscriptions.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresSubscription = this.reflector.getAllAndOverride<boolean>(
      REQUIRES_SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiresSubscription) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.tenant?.id ?? request.user?.tenantId;

    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const subscription =
      await this.subscriptionsService.getActiveSubscription(tenantId);

    if (!subscription) {
      throw new ForbiddenException(
        'An active subscription is required for this action',
      );
    }

    request.subscription = subscription;
    return true;
  }
}
