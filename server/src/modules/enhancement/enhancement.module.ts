import { Module } from '@nestjs/common'
import { EnhancementController } from './enhancement.controller'
import { EnhancementService } from './enhancement.service'

@Module({
  controllers: [EnhancementController],
  providers: [EnhancementService],
  exports: [EnhancementService]
})
export class EnhancementModule {}
