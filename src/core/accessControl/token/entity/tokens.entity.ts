import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../../../modules/users/entity/users.entity";

@Entity("tokens")
@Index(["userId"])
export class Token {
  @PrimaryColumn("uuid")
  sessionId: string;

  @Column({ name: "user_id" })
  userId: string;

  @ManyToOne(() => User, (user: User) => user.tokens, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "hash_refresh_token" })
  hashRefreshToken: string;

  @Column({ name: "expires_at" })
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
