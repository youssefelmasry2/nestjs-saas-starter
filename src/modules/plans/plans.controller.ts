import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PlansService } from "./plans.service";
import { Public } from "../../core/accessControl/decorator/common.decorator";

@ApiTags("Plans")
@Controller("plans")
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "List available subscription plans" })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(":slug")
  @Public()
  @ApiOperation({ summary: "Get plan by slug" })
  findBySlug(@Param("slug") slug: string) {
    return this.plansService.findBySlug(slug);
  }
}
