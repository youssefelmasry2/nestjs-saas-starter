import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from "typeorm";
import { uuidv7 } from "uuidv7";
import { Subscription } from "../../subscriptions/entities/subscription.entity";

export interface PlanFeatures {
  maxSeats: number;
  apiCallsPerMonth: number;
  customDomain: boolean;
  prioritySupport: boolean;
}

@Entity("plans")
@Index(["slug"], { unique: true })
export class Plan {
  @PrimaryColumn("uuid")
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    name: "price_monthly",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  priceMonthly: number;

  @Column({
    name: "price_yearly",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  priceYearly: number;

  @Column({ type: "jsonb", default: {} })
  features: PlanFeatures;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({ name: "sort_order", default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}
