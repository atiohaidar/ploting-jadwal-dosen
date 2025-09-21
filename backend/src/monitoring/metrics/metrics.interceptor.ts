import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrometheusService } from '../metrics/prometheus.service';
import { WinstonLoggerService } from '../logger/winston.service';
import { getRequestContext } from '../logger/correlation-id.middleware';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    private prometheus: PrometheusService,
    private logger: WinstonLoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.originalUrl || request.url;
    const route = this.getRoutePattern(request);

    // Start timing
    const startTime = Date.now();
    const timer = this.prometheus.startHttpRequestTimer(method, route);

    // Increment in-progress counter
    this.prometheus.incrementHttpRequestsInProgress(method, route);

    // Log request
    this.logger.logRequest({
      method,
      url,
      userAgent: request.get('User-Agent'),
      ip: request.ip || request.connection.remoteAddress,
      correlationId: getRequestContext().correlationId,
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode || 200;

        // Record metrics
        timer({ status_code: statusCode });
        this.prometheus.incrementHttpRequests(method, route, statusCode);
        this.prometheus.decrementHttpRequestsInProgress(method, route);

        // Log response
        this.logger.logResponse({
          method,
          url,
          statusCode,
          duration,
          correlationId: getRequestContext().correlationId,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Record error metrics
        timer({ status_code: statusCode });
        this.prometheus.incrementHttpRequests(method, route, statusCode);
        this.prometheus.decrementHttpRequestsInProgress(method, route);

        // Log error
        this.logger.logError(error, {
          method,
          url,
          statusCode,
          duration,
          correlationId: getRequestContext().correlationId,
        });

        throw error;
      })
    );
  }

  private getRoutePattern(request: any): string {
    // Try to get the route pattern from Express
    if (request.route && request.route.path) {
      return request.route.path;
    }

    // Fallback to URL without query parameters
    const url = request.originalUrl || request.url;
    return url.split('?')[0];
  }
}