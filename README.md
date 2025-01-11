#### Health Module

```bash
pnpm add @nestjs/config @nestjs/terminus @nestjs/swagger @nestjs/axios prom-client @nestjs/typeorm
```

```typescript
// import helath module
import { HealthModule } from './hea.module';

// Add the module to the imports array of your main module
@Module({
  imports: [HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```
