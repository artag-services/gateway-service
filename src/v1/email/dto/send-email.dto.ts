import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendEmailDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsEmail({}, { each: true })
  to!: string[];

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  cc?: string[];

  @IsArray()
  @IsOptional()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  replyTo?: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsOptional()
  html?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
