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
import { TenantMember } from "./tenant-member.entity";
import { Subscription } from "../../subscriptions/entities/subscription.entity";

@Entity("tenants")
@Index(["slug"], { unique: true })
export class Tenant {
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

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => TenantMember, (member) => member.tenant)
  members: TenantMember[];

  @OneToMany(() => Subscription, (subscription) => subscription.tenant)
  subscriptions: Subscription[];
}
