import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { HealthService } from './health.service';

@Module({
  imports: [
    TerminusModule.forRoot({
      logger: false,
    }),
    HttpModule,
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
