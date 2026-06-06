import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entity/users.entity';
import { CreateUserDto } from './dto/users.dto';
import { UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // ================= CREATE USER =================
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: {
        phone: createUserDto.phone,
      },
    });

    if (existingUser) {
      throw new ConflictException('Phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      10,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    delete (user as any).password;

    return await this.usersRepository.save(user);
  }

  // ================= FIND ALL =================
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // ================= FIND ONE =================
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  // ================= FIND BY PHONE =================
  async findByPhone(phone: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { phone },
      select: [
        'id',
        'phone',
        'profileImageUrl',
        'fullName',
        'passwordHash',
        'role',
        'isVerified',
        'isActive',
      ],
    });
  }

  // ================= UPDATE USER =================
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return await this.usersRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  // ================= DELETE USER =================
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);

    await this.usersRepository.remove(user);
  }

  // ================= VALIDATE PASSWORD =================
  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(
      plainPassword,
      hashedPassword,
    );
  }
}