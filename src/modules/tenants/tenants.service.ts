import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant } from "./entities/tenant.entity";
import {
  TenantMember,
  TenantMemberRole,
} from "./entities/tenant-member.entity";
import {
  CreateTenantDto,
  UpdateTenantDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
} from "./dto/tenants.dto";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { UsersService } from "../users/users.service";

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantMember)
    private readonly tenantMemberRepository: Repository<TenantMember>,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersService: UsersService,
  ) {}

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = this.slugify(base);
    let suffix = 0;

    while (await this.tenantRepository.findOne({ where: { slug } })) {
      suffix += 1;
      slug = `${this.slugify(base)}-${suffix}`;
    }

    return slug;
  }

  async createWithOwner(userId: string, name: string) {
    const slug = await this.uniqueSlug(name);

    const tenant = await this.tenantRepository.save(
      this.tenantRepository.create({ name, slug }),
    );

    await this.tenantMemberRepository.save(
      this.tenantMemberRepository.create({
        tenantId: tenant.id,
        userId,
        role: TenantMemberRole.OWNER,
      }),
    );

    await this.subscriptionsService.createForTenant(tenant.id, "free");

    return tenant;
  }

  async create(userId: string, dto: CreateTenantDto) {
    return this.createWithOwner(userId, dto.name);
  }

  async findUserTenants(userId: string) {
    const memberships = await this.tenantMemberRepository.find({
      where: { userId },
      relations: ["tenant"],
      order: { joinedAt: "ASC" },
    });

    return memberships.map((m) => ({
      id: m.tenant.id,
      name: m.tenant.name,
      slug: m.tenant.slug,
      isActive: m.tenant.isActive,
      createdAt: m.tenant.createdAt,
      updatedAt: m.tenant.updatedAt,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async findOne(tenantId: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }
    return tenant;
  }

  async update(tenantId: string, dto: UpdateTenantDto) {
    const tenant = await this.findOne(tenantId);
    if (dto.name) {
      tenant.name = dto.name;
    }
    return this.tenantRepository.save(tenant);
  }

  async getMembers(tenantId: string) {
    return this.tenantMemberRepository.find({
      where: { tenantId },
      relations: ["user"],
      order: { joinedAt: "ASC" },
    });
  }

  async inviteMember(
    tenantId: string,
    dto: InviteMemberDto,
    actorRole: TenantMemberRole,
  ) {
    if (actorRole === TenantMemberRole.MEMBER) {
      throw new ForbiddenException("Only owners and admins can invite members");
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(
        "User not found. They must register before being invited.",
      );
    }

    const existing = await this.tenantMemberRepository.findOne({
      where: { tenantId, userId: user.id },
    });
    if (existing) {
      throw new ConflictException("User is already a member of this tenant");
    }

    const role = dto.role ?? TenantMemberRole.MEMBER;
    if (role === TenantMemberRole.OWNER) {
      throw new BadRequestException("Cannot invite someone as owner");
    }

    const subscription =
      await this.subscriptionsService.getActiveSubscription(tenantId);

    if (subscription && subscription.plan.features.maxSeats > 0) {
      const memberCount = await this.tenantMemberRepository.count({
        where: { tenantId },
      });
      if (memberCount >= subscription.plan.features.maxSeats) {
        throw new ForbiddenException(
          "Seat limit reached for current plan. Upgrade to add more members.",
        );
      }
    }

    return this.tenantMemberRepository.save(
      this.tenantMemberRepository.create({
        tenantId,
        userId: user.id,
        role,
      }),
    );
  }

  async updateMemberRole(
    tenantId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    actorRole: TenantMemberRole,
  ) {
    if (actorRole !== TenantMemberRole.OWNER) {
      throw new ForbiddenException("Only owners can change member roles");
    }

    const member = await this.tenantMemberRepository.findOne({
      where: { id: memberId, tenantId },
    });
    if (!member) {
      throw new NotFoundException("Member not found");
    }
    if (member.role === TenantMemberRole.OWNER) {
      throw new BadRequestException("Cannot change owner role");
    }
    if (dto.role === TenantMemberRole.OWNER) {
      throw new BadRequestException("Use transfer ownership to assign owner");
    }

    member.role = dto.role;
    return this.tenantMemberRepository.save(member);
  }

  async removeMember(
    tenantId: string,
    memberId: string,
    actorUserId: string,
    actorRole: TenantMemberRole,
  ) {
    const member = await this.tenantMemberRepository.findOne({
      where: { id: memberId, tenantId },
    });
    if (!member) {
      throw new NotFoundException("Member not found");
    }
    if (member.role === TenantMemberRole.OWNER) {
      throw new BadRequestException("Cannot remove the tenant owner");
    }
    if (
      actorRole === TenantMemberRole.MEMBER &&
      member.userId !== actorUserId
    ) {
      throw new ForbiddenException("Members can only remove themselves");
    }

    await this.tenantMemberRepository.remove(member);
    return { success: true };
  }

  async getMembership(userId: string, tenantId: string) {
    return this.tenantMemberRepository.findOne({
      where: { userId, tenantId },
      relations: ["tenant"],
    });
  }
}
