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
import { Token } from "../../../core/accessControl/token/entity/tokens.entity";
import { TenantMember } from "../../tenants/entities/tenant-member.entity";

export enum UserRole {
  USER = "user",
  PLATFORM_ADMIN = "platform_admin",
}

@Entity("users")
@Index(["email"], { unique: true })
export class User {
  @PrimaryColumn("uuid")
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }

  @Column({ unique: true })
  email: string;

  @Column({ name: "full_name" })
  fullName: string;

  @Column({ name: "password_hash", select: false })
  passwordHash: string;

  @Column({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ name: "profile_image_url", nullable: true })
  profileImageUrl: string;

  @Column({ name: "is_verified", default: false })
  isVerified: boolean;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({ name: "last_login_at", type: "timestamp", nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => TenantMember, (member) => member.user)
  tenantMemberships: TenantMember[];
}
