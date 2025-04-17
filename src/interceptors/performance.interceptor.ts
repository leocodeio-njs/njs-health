import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from '../health/prometheus.service';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly slowThreshold = 1000; // 1 second

  constructor(private readonly prometheusService: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;

          // Record metrics
          this.prometheusService.recordResponseTime(method, url, duration);

          // Log slow requests
          if (duration > this.slowThreshold) {
            this.logger.warn(
              `Slow request detected: ${method} ${url} took ${duration}ms`,
              {
                method,
                url,
                duration,
                threshold: this.slowThreshold,
              },
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.prometheusService.recordResponseTime(
            method,
            url,
            duration,
            true,
          );
        },
      }),
    );
  }
}
