import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram } from 'prom-client';

@Injectable()
export class PrometheusService {
  private readonly registry: Registry;
  private readonly healthCheckCounter: Counter;
  private readonly responseTimeHistogram: Histogram;

  constructor() {
    this.registry = new Registry();

    this.healthCheckCounter = new Counter({
      name: 'health_check_status',
      help: 'Health check status counter',
      labelNames: ['type', 'status'],
      registers: [this.registry],
    });

    this.responseTimeHistogram = new Histogram({
      name: 'http_request_duration_ms',
      help: 'HTTP request duration in milliseconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
      registers: [this.registry],
    });
  }

  recordHealthCheck(type: string, status: string): void {
    this.healthCheckCounter.labels(type, status).inc();
  }

  recordResponseTime(
    method: string, 
    path: string, 
    duration: number,
    isError: boolean = false
  ): void {
    this.responseTimeHistogram
      .labels(method, path, isError ? 'error' : 'success')
      .observe(duration);
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}