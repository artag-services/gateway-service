import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

export enum ScrapingStrategy {
  AUTO = 'auto',
  EXTRACT = 'extract',
  SEARCH = 'search',
  LOGIN_THEN_EXTRACT = 'login_then_extract',
  LOGIN_THEN_SEARCH = 'login_then_search',
  CUSTOM_FLOW = 'custom_flow',
}

export class LoginConfigDto {
  @IsString() @IsNotEmpty() usernameSelector!: string
  @IsString() @IsNotEmpty() passwordSelector!: string
  @IsString() @IsNotEmpty() submitSelector!: string
  @IsString() @IsNotEmpty() username!: string
  @IsString() @IsNotEmpty() password!: string
  @IsString() @IsOptional() sessionKey?: string
  @IsString() @IsOptional() successSelector?: string
}

export class SearchConfigDto {
  @IsString() @IsNotEmpty() query!: string
  @IsString() @IsNotEmpty() inputSelector!: string
  @IsString() @IsNotEmpty() submitSelector!: string
  @IsString() @IsOptional() waitForSelector?: string
  @IsInt() @IsOptional() @Min(0) waitMs?: number
}

export class OutputConfigDto {
  @IsArray() @IsOptional() @IsString({ each: true }) targets?: Array<'event' | 'notion' | 'whatsapp' | 'email'>
  @IsObject() @IsOptional() notion?: { parentPageId: string; title?: string; icon?: string }
  @IsObject() @IsOptional() whatsapp?: { to: string }
  @IsObject() @IsOptional() email?: { to: string[]; subject?: string }
}

export class PerformanceConfigDto {
  @IsOptional() blockResources?: boolean
  @IsInt() @IsOptional() @Min(0) cacheTtlMs?: number
  @IsInt() @IsOptional() @Min(1000) timeoutMs?: number
}

export class LifecycleConfigDto {
  @IsInt() @IsOptional() @Min(60_000) expiresAfterMs?: number
  @IsObject() @IsOptional() metadata?: Record<string, unknown>
}

/**
 * Request body for POST /api/v1/scraping/tasks.
 * Pattern: fire-and-forget. Gateway returns 202 with the assigned `jobId`;
 * client subscribes to SSE topic `scraping:<jobId>` to receive completion.
 */
export class CreateScrapingTaskDto {
  @IsUrl() @IsNotEmpty() url!: string

  @IsString() @IsOptional() userId?: string

  @IsEnum(ScrapingStrategy) strategy!: ScrapingStrategy

  @IsObject() @IsOptional() selectors?: Record<string, unknown>

  @ValidateNested() @Type(() => SearchConfigDto) @IsOptional() search?: SearchConfigDto

  @ValidateNested() @Type(() => LoginConfigDto) @IsOptional() login?: LoginConfigDto

  @IsArray() @IsOptional() flow?: Array<Record<string, unknown>>

  @ValidateNested() @Type(() => OutputConfigDto) @IsOptional() output?: OutputConfigDto

  @ValidateNested() @Type(() => PerformanceConfigDto) @IsOptional() performance?: PerformanceConfigDto

  @ValidateNested() @Type(() => LifecycleConfigDto) @IsOptional() lifecycle?: LifecycleConfigDto
}
