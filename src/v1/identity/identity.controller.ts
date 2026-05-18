import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { IdentityService } from './identity.service';
import { ResolveIdentityDto, MergeUsersDto, UpdateAISettingsDto } from './dto';

/**
 * Identity API — writes + the cross-service aggregate report.
 *
 * User reads have moved to the unified read model:
 *   GET /v1/query/users
 *   GET /v1/query/users/:userId             (unified profile with identities[])
 *   GET /v1/query/users/:userId/conversations
 *   GET /v1/query/users/:userId/emails
 *   GET /v1/query/users/:userId/scraping-tasks
 *
 * `GET /v1/identity/report` stays here for now — it's an on-the-fly
 * aggregate (counts per channel etc.) that doesn't fit cleanly into the
 * read model. Future: move into sync as a precomputed view.
 */
@Controller('v1/identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  /**
   * Resolve or create a user identity (Fire-and-forget).
   * POST /api/v1/identity/resolve
   * Body: { channel, channelUserId, displayName?, phone?, email?, username?, ... }
   */
  @Post('resolve')
  @HttpCode(HttpStatus.ACCEPTED)
  async resolveIdentity(@Body() dto: ResolveIdentityDto): Promise<any> {
    return this.identityService.resolveIdentity(dto);
  }

  /** Merge two users (Fire-and-forget). */
  @Post('merge')
  @HttpCode(HttpStatus.ACCEPTED)
  async mergeUsers(@Body() dto: MergeUsersDto): Promise<any> {
    return this.identityService.mergeUsers(dto);
  }

  /** Soft delete (Fire-and-forget). */
  @Delete('users/:userId')
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteUser(@Param('userId') userId: string): Promise<any> {
    if (!userId) throw new BadRequestException('userId is required');
    return this.identityService.deleteUser(userId);
  }

  /** Toggle AI per user (Fire-and-forget). */
  @Patch('users/:userId/ai-settings')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateAISettings(
    @Param('userId') userId: string,
    @Body() dto: UpdateAISettingsDto,
  ): Promise<any> {
    if (!userId) throw new BadRequestException('userId is required');
    return this.identityService.updateAISettings(userId, dto);
  }

  /**
   * On-the-fly aggregate report: totals, per-channel breakdown, etc.
   * Not in the read model because it's a computed roll-up.
   */
  @Get('report')
  async getReport(): Promise<any> {
    return this.identityService.getReport();
  }
}
