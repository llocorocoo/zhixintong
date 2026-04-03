import { Module } from '@nestjs/common'
import { ReportController } from './report.controller'
import { ReportService } from './report.service'
import { CreditModule } from '../credit/credit.module'

@Module({
  imports: [CreditModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService]
})
export class ReportModule {}
