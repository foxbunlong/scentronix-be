import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getDefaultHideout(): string {
    return 'Welcome to Healthcheck Service';
  }
}
