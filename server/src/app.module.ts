import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { CreditModule } from '@/modules/credit/credit.module';
import { ReportModule } from '@/modules/report/report.module';
import { ResumeModule } from '@/modules/resume/resume.module';
import { EnhancementModule } from '@/modules/enhancement/enhancement.module';

@Module({
  imports: [
    AuthModule,
    CreditModule,
    ReportModule,
    ResumeModule,
    EnhancementModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
