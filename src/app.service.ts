import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'بسم الله الرحمن الرحيم';
  }
}
