import { Module } from '@nestjs/common'
import { QueryClient } from './query.client'
import { QueryController } from './query.controller'

/**
 * The only place in the gateway that talks HTTP to another service.
 * Calls Sync Service's `/internal/query/*` for all cross-service reads.
 */
@Module({
  controllers: [QueryController],
  providers: [QueryClient],
  exports: [QueryClient],
})
export class QueryModule {}
