import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { Public } from "../accessControl/decorator/common.decorator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: "Health check",
    description:
      "Liveness/readiness probe. Lives at GET /health (outside the /api/v1 prefix).",
  })
  check() {
    return this.health.check([() => this.db.pingCheck("database")]);
  }
}
