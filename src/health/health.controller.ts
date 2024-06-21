import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('HealthCheck')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('findServer')
  async findServer() {
    return this.healthService.findServer();
  }

  @Get('check')
  checkResponse() {
    return this.healthService.checkResponse();
  }
}
