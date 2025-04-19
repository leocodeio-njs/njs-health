#### Health Module

```bash
pnpm add @nestjs/config @nestjs/terminus @nestjs/swagger @nestjs/axios prom-client @nestjs/typeorm
```

```typescript
// import helath module
import { HealthModule } from '@leocodeio-njs/njs-health-db';

// Add the module to the imports array of your main module
@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

#### Environment Variables

The health module uses the following environment variables to configure its behavior. You can set these in a `.env` file or directly in your environment.

- `ENABLE_MEMORY_HEALTH`: (Optional) Set to `true` to enable memory health checks (heap and RSS). Defaults to `false` if not set.
  ```env
  ENABLE_MEMORY_HEALTH=true
  ```
- `ENABLE_DISK_HEALTH`: (Optional) Set to `true` to enable disk space health checks. Defaults to `false` if not set.
  ```env
  ENABLE_DISK_HEALTH=true
  ```
- `ENABLE_DB_HEALTH`: (Optional) Set to `true` to enable database ping checks. Defaults to `false` if not set.
  ```env
  ENABLE_DB_HEALTH=true
  ```
- `EXTERNAL_DEPENDENCY_API_ENDPOINTS`: (Optional) A JSON string representing an array of external APIs to ping for readiness checks. Each object in the array should have a `name` and `url`.

  ```env
  EXTERNAL_DEPENDENCY_API_ENDPOINTS='[{"name": "AuthService", "url": "https://auth.example.com/health"},{"name": "PaymentGateway", "url": "https://payments.example.com/status"}]'
  ```

  EXTERNAL_DEPENDENCY_API_ENDPOINTS='[{"name": "AuthService", "url": "https://auth.example.com/health"},{"name": "PaymentGateway", "url": "https://payments.example.com/status"}]'
  ENABLE_DB_HEALTH=true
  ENABLE_MEMORY_HEALTH=true
  ENABLE_DISK_HEALTH=true
