import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Default hideout' })
  @Get()
  defaultGet(): string {
    return this.appService.getDefaultHideout();
  }

  @ApiOperation({ summary: 'Default hideout' })
  @Post()
  defaultPost(): string {
    return this.appService.getDefaultHideout();
  }
}
