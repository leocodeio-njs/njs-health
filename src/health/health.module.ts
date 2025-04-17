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
        // Existing validation

        // APP PORT
        PORT: Joi.number().default(3000).required(),

        // DATABASE CONFIGURATION
        DB_HOST: Joi.string().default('localhost').required(),
        DB_USERNAME: Joi.string().default('postgres').required(),
        DB_PASSWORD: Joi.string().default('postgres').required(),
        DB_DATABASE: Joi.string().default('postgres').required(),
        DB_SCHEMA: Joi.string().default('test').required(),
        DB_PORT: Joi.number().default(5432).required(),

        //rate limit
        RATE_LIMIT_POINTS: Joi.number().default(100).required(),
        RATE_LIMIT_DURATION: Joi.number()
          .default(60 * 60)
          .required(), // Per hour
        RATE_LIMIT_BLOCK_DURATION: Joi.number()
          .default(5 * 60)
          .required(), // 5min block if exceeded

        // guards
        // apikey guard
        APP_KEY: Joi.string().default('apikey').required(),
        // acess token guard
        ACCESS_TOKEN_VALIDATION_URL: Joi.string()
          .default('http://localhost:3000/validate')
          .required(),
        AUTHORIZER_API_KEY: Joi.string().default('validkey1').required(),
        CLUSTER_CLIENT_ID: Joi.string().default('validclient1').required(),
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
