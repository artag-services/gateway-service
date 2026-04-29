import { Module } from '@nestjs/common'
import { RabbitMQModule } from '../../rabbitmq/rabbitmq.module'
import { RequestResponseManager } from '../../identity/services/request-response.manager'
import { AgentResponseListener } from '../../agent/services/agent-response.listener'
import { AgentService } from './agent.service'
import { AgentController } from './agent.controller'

@Module({
  imports: [RabbitMQModule],
  providers: [RequestResponseManager, AgentResponseListener, AgentService],
  controllers: [AgentController],
  exports: [AgentService],
})
export class AgentModule {}
