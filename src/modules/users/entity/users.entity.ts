import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Token } from '../../../core/accessControl/token/entity/tokens.entity';

// ==================== USERS ====================
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}


@Entity('users')
@Index(['phone'], { unique: true })
export class User {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }


  @Column({ unique: true})
  phone: string;

 
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'password_hash' , select: false })
  passwordHash: string;

  @Column({ enum: UserRole, default: UserRole.USER })
  role: UserRole;

  
  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;



  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // // Relations

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
  // @OneToMany(() => Vehicle, (vehicle) => vehicle.owner)
  // vehicles: Vehicle[];

  // @OneToMany(() => PartRequest, (request) => request.carOwner)
  // partRequests: PartRequest[];

  // @OneToMany(() => Order, (order) => order.carOwner)
  // ordersAsCarOwner: Order[];

  // @OneToMany(() => Review, (review) => review.reviewer)
  // givenReviews: Review[];

  // @OneToMany(() => Review, (review) => review.reviewee)
  // receivedReviews: Review[];

  // @OneToMany(() => Notification, (notification) => notification.user)
  // notifications: Notification[];
}