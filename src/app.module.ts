import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { PrometheusService } from './health/prometheus.service';

@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [
    AppService,
    PrometheusService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: PerformanceInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
