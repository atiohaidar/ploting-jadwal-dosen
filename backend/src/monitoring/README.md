# Monitoring System

This application includes a comprehensive observability system with logging, metrics, health checks, and distributed tracing.

## Features

### 📊 **Metrics (Prometheus)**
- HTTP request metrics (count, duration, status codes)
- Database query metrics
- Memory and CPU usage
- Business metrics (users, login attempts)
- Custom metrics support

### 📝 **Logging (Winston)**
- Structured JSON logging
- Request correlation IDs
- Daily rotating log files
- Multiple log levels
- Error tracking with stack traces

### 🏥 **Health Checks**
- Database connectivity
- Memory usage
- Disk space
- Application uptime
- Comprehensive health endpoints

### 🔍 **Distributed Tracing (Jaeger)**
- Request tracing across services
- Performance monitoring
- Error correlation
- Custom tracing decorators

## Endpoints

### Health Checks
- `GET /monitoring/health` - Comprehensive health check
- `GET /monitoring/health/database` - Database health only
- `GET /monitoring/health/memory` - Memory health only
- `GET /monitoring/ping` - Simple ping/pong

### Metrics
- `GET /monitoring/metrics` - Prometheus metrics (text format)
- `GET /monitoring/metrics/json` - Metrics in JSON format

### Application Info
- `GET /monitoring/info` - Application information

## Configuration

### Environment Variables

```bash
# Logging
LOG_LEVEL=info  # debug, info, warn, error

# Jaeger Tracing
JAEGER_SERVICE_NAME=your-service-name
JAEGER_ENDPOINT=http://localhost:14268/api/traces
JAEGER_LOG_SPANS=false
JAEGER_SAMPLER_TYPE=const  # const, probabilistic, ratelimiting
JAEGER_SAMPLER_PARAM=1     # 1.0 = 100% sampling
```

### Log Files

Logs are stored in the `logs/` directory:
- `application-YYYY-MM-DD.log` - All logs
- `error-YYYY-MM-DD.log` - Error logs only

## Usage

### Using the Logger

```typescript
import { WinstonLoggerService } from './monitoring/logger/winston.service';

@Injectable()
export class YourService {
  constructor(private logger: WinstonLoggerService) {}

  someMethod() {
    this.logger.logRequest({
      method: 'GET',
      url: '/api/users',
      correlationId: '123-456-789',
    });

    this.logger.logAuth('login_success', 'user123');
  }
}
```

### Using Metrics

```typescript
import { PrometheusService } from './monitoring/metrics/prometheus.service';

@Injectable()
export class YourService {
  constructor(private prometheus: PrometheusService) {}

  async someDatabaseOperation() {
    const timer = this.prometheus.startDbQueryTimer('select', 'users');
    try {
      // Your database operation
      const result = await this.prisma.user.findMany();
      return result;
    } finally {
      timer(); // Record the duration
    }
  }
}
```

### Using Tracing

```typescript
import { Trace } from './monitoring/tracing/jaeger.config';

@Injectable()
export class YourService {
  @Trace('custom-operation')
  async tracedMethod() {
    // This method will be automatically traced
    return await this.doSomething();
  }
}
```

## Monitoring Setup

### 1. Prometheus

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'nestjs-app'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/monitoring/metrics'
```

### 2. Jaeger

Run Jaeger locally:

```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest
```

Access Jaeger UI at: http://localhost:16686

### 3. Grafana (Optional)

Import dashboards for visualizing metrics:
- Prometheus data source
- Jaeger data source for traces

## Best Practices

### Logging
- Use appropriate log levels (debug, info, warn, error)
- Include correlation IDs in all log entries
- Log errors with full stack traces
- Avoid logging sensitive information

### Metrics
- Use meaningful metric names and labels
- Keep cardinality low (avoid high-cardinality labels)
- Use histograms for measuring durations
- Use counters for events, gauges for current state

### Health Checks
- Keep health checks lightweight
- Use appropriate timeouts
- Include relevant diagnostic information
- Health checks should not depend on external services

### Tracing
- Use descriptive operation names
- Add relevant tags to spans
- Don't create too many spans (performance impact)
- Use baggage for cross-service data propagation

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check log level configuration
2. **Metrics not collected**: Verify Prometheus configuration
3. **Traces not showing**: Check Jaeger endpoint configuration
4. **Health checks failing**: Check database connectivity and resource usage

### Performance Considerations

- Logging has minimal performance impact when used correctly
- Metrics collection is lightweight but monitor cardinality
- Tracing can add latency - use sampling in production
- Health checks should be fast and not resource-intensive