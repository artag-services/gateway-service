import { IsUrl, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateScrapingTaskDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  type?: 'simple' | 'login' | 'search' | 'login+search' | 'extract';

  @IsOptional()
  @IsObject()
  instructions?: Record<string, any>;

  @IsOptional()
  @IsString()
  userId?: string;
}
