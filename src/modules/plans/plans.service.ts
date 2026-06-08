import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Plan } from "./entities/plan.entity";

const DEFAULT_PLANS: Partial<Plan>[] = [
  {
    name: "Free",
    slug: "free",
    description: "For individuals and small teams getting started",
    priceMonthly: 0,
    priceYearly: 0,
    sortOrder: 0,
    features: {
      maxSeats: 3,
      apiCallsPerMonth: 1000,
      customDomain: false,
      prioritySupport: false,
    },
  },
  {
    name: "Pro",
    slug: "pro",
    description: "For growing teams that need more capacity",
    priceMonthly: 29,
    priceYearly: 290,
    sortOrder: 1,
    features: {
      maxSeats: 10,
      apiCallsPerMonth: 50000,
      customDomain: true,
      prioritySupport: false,
    },
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    description: "For large organizations with advanced needs",
    priceMonthly: 99,
    priceYearly: 990,
    sortOrder: 2,
    features: {
      maxSeats: -1,
      apiCallsPerMonth: -1,
      customDomain: true,
      prioritySupport: true,
    },
  },
];

@Injectable()
export class PlansService implements OnModuleInit {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async onModuleInit() {
    for (const plan of DEFAULT_PLANS) {
      const exists = await this.planRepository.findOne({
        where: { slug: plan.slug },
      });
      if (!exists) {
        await this.planRepository.save(this.planRepository.create(plan));
      }
    }
  }

  findAll() {
    return this.planRepository.find({
      where: { isActive: true },
      order: { sortOrder: "ASC" },
    });
  }

  findBySlug(slug: string) {
    return this.planRepository.findOne({ where: { slug, isActive: true } });
  }

  findOne(id: string) {
    return this.planRepository.findOne({ where: { id, isActive: true } });
  }
}
