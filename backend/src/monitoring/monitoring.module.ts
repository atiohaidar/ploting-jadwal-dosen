import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';

// Logger
import { WinstonLoggerService } from './logger/winston.service';
import { CorrelationIdMiddleware } from './logger/correlation-id.middleware';

// Metrics
import { PrometheusService } from './metrics/prometheus.service';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import {
    DatabaseHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
    ApplicationHealthIndicator,
} from './metrics/health-check.service';

// Tracing
import { JaegerService } from './tracing/jaeger.config';

// Controller
import { MonitoringController } from './monitoring.controller';

// Prisma for health checks
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
    imports: [
        TerminusModule,
        PrismaModule,
    ],
    providers: [
        // Logger
        {
            provide: 'LoggerService',
            useClass: WinstonLoggerService,
        },
        WinstonLoggerService,
        CorrelationIdMiddleware,

        // Metrics
        PrometheusService,
        {
            provide: APP_INTERCEPTOR,
            useClass: MetricsInterceptor,
        },
        DatabaseHealthIndicator,
        MemoryHealthIndicator,
        DiskHealthIndicator,
        ApplicationHealthIndicator,

        // Tracing
        JaegerService,
    ],
    controllers: [MonitoringController],
    exports: [
        WinstonLoggerService,
        CorrelationIdMiddleware,
        PrometheusService,
        JaegerService,
        'LoggerService',
    ],
})
export class MonitoringModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        // Apply correlation ID middleware to all routes
        consumer.apply(CorrelationIdMiddleware).forRoutes('*');
    }
}