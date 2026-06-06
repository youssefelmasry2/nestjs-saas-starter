import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { User } from '../../users/entity/users.entity';
import { Tenant } from './tenant.entity';

export enum TenantMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('tenant_members')
@Index(['tenantId', 'userId'], { unique: true })
export class TenantMember {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.tenantMemberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: TenantMemberRole, default: TenantMemberRole.MEMBER })
  role: TenantMemberRole;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
