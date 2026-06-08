import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString } from "class-validator";

export class ChangePlanDto {
  @ApiProperty({ example: "pro", enum: ["free", "pro", "enterprise"] })
  @IsString()
  @IsIn(["free", "pro", "enterprise"])
  planSlug: string;
}
