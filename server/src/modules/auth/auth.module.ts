import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ReportModule } from '../report/report.module'
import { CreditModule } from '../credit/credit.module'
import { ResumeModule } from '../resume/resume.module'

@Module({
  imports: [ReportModule, CreditModule, ResumeModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
