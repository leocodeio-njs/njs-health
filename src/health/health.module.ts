// health.module.ts
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { PrometheusService } from './prometheus.service';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load environment variables - update with the path to your .env file
      envFilePath: ['.env.local', '.env'],
      // Add social media configuration variables
      validationSchema: Joi.object({
        // DB AND MEMORY
        ENABLE_DB_HEALTH: Joi.boolean().default(true).required(),
        ENABLE_MEMORY_HEALTH: Joi.boolean().default(true).required(),
        ENABLE_DISK_HEALTH: Joi.boolean().default(true).required(),
        EXTERNAL_DEPENDENCY_API_ENDPOINTS: Joi.object().default({}).optional(),
      }),
    }),
    TerminusModule.forRoot({
      logger: true,
      errorLogStyle: 'pretty',
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [HealthController],
  providers: [PrometheusService],
})
export class HealthModule {}
