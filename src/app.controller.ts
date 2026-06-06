import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './core/accessControl/decorator/common.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }
}
