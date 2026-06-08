import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from "@nestjs/common";

import { ApiOperation } from "@nestjs/swagger";

import { UsersService } from "./users.service";

import { CreateUserDto } from "./dto/users.dto";
import { UpdateUserDto } from "./dto/users.dto";
import { Roles } from "../../core/accessControl/decorator/roles.decorator";
import { AccessAuth } from "../../core/accessControl/decorator/common.decorator";
import { UserRole } from "./entity/users.entity";
import { RolesGuard } from "../../core/accessControl/guards/roles.guard";
import { JwtAuthGuard } from "../../core/accessControl/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ================= CREATE =================
  @Post()
  @AccessAuth()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: "Create user" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ================= GET ALL =================
  @Get()
  @AccessAuth()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: "Get all users will be removed " })
  findAll() {
    return this.usersService.findAll();
  }

  // ================= GET ONE =================
  @Get(":id")
  @AccessAuth()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: "Get user by id" })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  // ================= UPDATE =================
  @Patch(":id")
  @AccessAuth()
  @Roles(UserRole.PLATFORM_ADMIN)
  @ApiOperation({ summary: "Update user" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // ================= DELETE =================
  @Delete(":id")
  @AccessAuth()
  @Roles(UserRole.PLATFORM_ADMIN)
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
