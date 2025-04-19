import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
} from '@nestjs/swagger';
import { PrometheusService } from './prometheus.service';
import { Public } from '../common/decorators/api/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private readonly configService: ConfigService,
    private readonly prometheusService: PrometheusService,
  ) {}

  @Public()
  @Get('/liveness')
  @HealthCheck()
  @ApiSecurity({ security: [] }) // Disable security for liveness check
  @ApiOperation({ summary: 'Check if the application is alive' })
  @ApiResponse({
    status: 200,
    description: 'Application is alive and responding to requests',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not responding properly',
  })
  async checkLiveness() {
    const checks = [];

    // Memory checks
    if (this.configService.get<boolean>('ENABLE_MEMORY_HEALTH')) {
      checks.push(() =>
        this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      ); // 150MB
      checks.push(() => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024)); // 150MB
    }

    // Disk check
    if (this.configService.get<boolean>('ENABLE_DISK_HEALTH')) {
      checks.push(() =>
        this.disk.checkStorage('disk_space', {
          thresholdPercent: 0.9, // 90% threshold
          path: '/',
        }),
      );
    }

    // Database check
    if (this.configService.get<boolean>('ENABLE_DB_HEALTH')) {
      checks.push(() => this.db.pingCheck('database'));
    }

    // Ensure there's at least one check, otherwise Terminus throws an error
    if (checks.length === 0) {
      checks.push(() => Promise.resolve({ default: { status: 'up' } }));
    }

    const healthCheck = await this.health.check(checks);

    // Record metrics for monitoring
    this.prometheusService.recordHealthCheck('liveness', healthCheck.status);
    return healthCheck;
  }

  @Public()
  @Get('/readiness')
  @HealthCheck()
  @ApiSecurity({ security: [] }) // Disable security for readiness check
  @ApiOperation({
    summary: 'Check if the application is ready to accept traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready to accept traffic',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready to accept traffic',
  })
  async checkReadiness() {
    const checks = [];

    // Database health check
    if (this.configService.get<boolean>('ENABLE_DB_HEALTH')) {
      checks.push(() => this.db.pingCheck('database', { timeout: 3000 }));
    }

    // External dependencies health checks (if configured)
    checks.push(...this.getExternalHealthChecks());

    // Ensure there's at least one check if specific checks might be disabled
    if (checks.length === 0) {
      // Add a default check or handle the case where no checks are enabled
      checks.push(() => Promise.resolve({ default: { status: 'up' } }));
    }

    const healthCheck = await this.health.check(checks);

    // Record metrics for monitoring
    this.prometheusService.recordHealthCheck('readiness', healthCheck.status);

    return healthCheck;
  }

  private getExternalHealthChecks() {
    // [
    //   { "name": "AuthService", "url": "https://auth.example.com/health" },
    //   { "name": "PaymentGateway", "url": "https://payments.example.com/status" },
    //   { "name": "InventoryAPI", "url": "http://inventory-api.internal:8080/healthz" }
    // ]
    const externalApis = this.configService.get<string>(
      'EXTERNAL_DEPENDENCY_API_ENDPOINTS',
    );
    if (!externalApis) return [];

    try {
      // Ensure externalApis is treated as a string before parsing
      const apis: { name: string; url: string }[] = JSON.parse(externalApis);
      if (!Array.isArray(apis)) {
        console.error(
          'EXTERNAL_DEPENDENCY_API_ENDPOINTS is not a valid JSON array.',
        );
        return [];
      }
      return apis.map(
        (api) => () =>
          this.http.pingCheck(`external_api_${api.name}`, api.url, {
            timeout: 5000,
          }),
      );
    } catch (error) {
      console.error(
        'Failed to parse EXTERNAL_DEPENDENCY_API_ENDPOINTS configuration:',
        error,
      );
      return [];
    }
  }
}
