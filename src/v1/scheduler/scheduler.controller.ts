import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { SchedulerService } from './scheduler.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/**
 * HTTP entry point for scheduled tasks. Every request is forwarded to the
 * scheduler microservice via RabbitMQ — the gateway itself never opens an
 * HTTP connection to the scheduler. See SchedulerService for the contracts.
 */
@Controller('v1/schedules')
export class SchedulerController {
  constructor(private readonly scheduler: SchedulerService) {}

  @Get()
  list() {
    return this.scheduler.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.scheduler.get(id);
  }

  @Get(':id/runs')
  runs(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.scheduler.runs(id, limit ? parseInt(limit, 10) : undefined);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.scheduler.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.scheduler.update(id, dto);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string) {
    return this.scheduler.pause(id);
  }

  @Post(':id/resume')
  resume(@Param('id') id: string) {
    return this.scheduler.resume(id);
  }

  @Post(':id/trigger')
  @HttpCode(HttpStatus.ACCEPTED)
  trigger(@Param('id') id: string) {
    return this.scheduler.triggerNow(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.ACCEPTED)
  remove(@Param('id') id: string) {
    return this.scheduler.remove(id);
  }
}
