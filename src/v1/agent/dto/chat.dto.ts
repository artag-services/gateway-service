import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  message!: string

  @IsString()
  @IsOptional()
  conversationId?: string

  @IsString()
  @IsOptional()
  userId?: string

  @IsBoolean()
  @IsOptional()
  enableStreaming?: boolean
}
