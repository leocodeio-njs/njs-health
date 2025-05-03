import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrometheusService } from './health/prometheus.service';

@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [AppService, PrometheusService],
})
export class AppModule {}
