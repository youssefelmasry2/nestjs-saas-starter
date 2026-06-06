import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Subscription,
  SubscriptionStatus,
} from './entities/subscription.entity';
import { PlansService } from '../plans/plans.service';
import { ChangePlanDto } from './dto/subscriptions.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly plansService: PlansService,
  ) {}

  async createForTenant(tenantId: string, planSlug = 'free') {
    const plan = await this.plansService.findBySlug(planSlug);
    if (!plan) {
      throw new NotFoundException(`Plan "${planSlug}" not found`);
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 14);

    const subscription = this.subscriptionRepository.create({
      tenantId,
      planId: plan.id,
      status: SubscriptionStatus.TRIALING,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async getActiveSubscription(tenantId: string) {
    return this.subscriptionRepository.findOne({
      where: [
        { tenantId, status: SubscriptionStatus.ACTIVE },
        { tenantId, status: SubscriptionStatus.TRIALING },
      ],
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTenantSubscription(tenantId: string) {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }
    return subscription;
  }

  async changePlan(tenantId: string, dto: ChangePlanDto) {
    const plan = await this.plansService.findBySlug(dto.planSlug);
    if (!plan) {
      throw new NotFoundException(`Plan "${dto.planSlug}" not found`);
    }

    const current = await this.getActiveSubscription(tenantId);
    if (!current) {
      throw new NotFoundException('No active subscription found');
    }

    if (current.planId === plan.id) {
      throw new BadRequestException('Tenant is already on this plan');
    }

    current.planId = plan.id;
    current.status = SubscriptionStatus.ACTIVE;
    current.cancelAtPeriodEnd = false;

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    current.currentPeriodStart = new Date();
    current.currentPeriodEnd = periodEnd;

    return this.subscriptionRepository.save(current);
  }

  async cancelSubscription(tenantId: string) {
    const subscription = await this.getActiveSubscription(tenantId);
    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    subscription.cancelAtPeriodEnd = true;
    subscription.status = SubscriptionStatus.CANCELED;
    return this.subscriptionRepository.save(subscription);
  }
}
