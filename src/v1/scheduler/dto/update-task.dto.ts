import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ScheduleType } from './create-task.dto';

export enum TaskStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ScheduleType)
  @IsOptional()
  scheduleType?: ScheduleType;

  @IsString()
  @IsOptional()
  cronExpression?: string;

  @IsInt()
  @IsOptional()
  @Min(1000)
  intervalMs?: number;

  @IsString()
  @IsOptional()
  runAt?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  targetExchange?: string;

  @IsString()
  @IsOptional()
  targetRoutingKey?: string;

  @IsObject()
  @IsOptional()
  payload?: Record<string, unknown>;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsInt()
  @IsOptional()
  @Min(0)
  maxRetries?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  retryBackoffMs?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  maxLatenessMs?: number;
}
