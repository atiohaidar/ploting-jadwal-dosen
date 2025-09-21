import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as opentracing from 'opentracing';
import * as jaeger from 'jaeger-client';
import { tap, catchError } from 'rxjs/operators';

// Extend the global interface to include our tracer
declare global {
    var tracer: opentracing.Tracer;
}

@Injectable()
export class JaegerService implements OnModuleInit, OnModuleDestroy {
    private tracer: opentracing.Tracer;

    onModuleInit() {
        // Don't initialize Jaeger in test environment
        if (process.env.NODE_ENV === 'test') {
            // Create a no-op tracer for tests
            this.tracer = new opentracing.Tracer();
            global.tracer = this.tracer;
            return;
        }

        this.initializeTracer();
    }

    onModuleDestroy() {
        // Close tracer connections if available
        if (this.tracer && typeof (this.tracer as any).close === 'function') {
            (this.tracer as any).close();
        }
    }

    private initializeTracer() {
        const config = {
            serviceName: process.env.JAEGER_SERVICE_NAME || 'ploting-jadwal-dosen-backend',
            reporter: {
                collectorEndpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
                logSpans: process.env.JAEGER_LOG_SPANS === 'true' || false,
            },
            sampler: {
                type: process.env.JAEGER_SAMPLER_TYPE || 'const',
                param: parseFloat(process.env.JAEGER_SAMPLER_PARAM || '1'),
            },
        };

        const options = {
            tags: {
                'service.version': process.env.npm_package_version || '1.0.0',
                'service.environment': process.env.NODE_ENV || 'development',
            },
        };

        this.tracer = jaeger.initTracer(config, options);

        // Make tracer globally available
        global.tracer = this.tracer;

        console.log('Jaeger tracing initialized');
    }

    getTracer(): opentracing.Tracer {
        return this.tracer;
    }

    startSpan(operationName: string, options?: opentracing.SpanOptions): opentracing.Span {
        return this.tracer.startSpan(operationName, options);
    }

    inject(span: opentracing.Span, format: string, carrier: any): void {
        this.tracer.inject(span, format as any, carrier);
    }

    extract(format: string, carrier: any): opentracing.SpanContext | null {
        return this.tracer.extract(format as any, carrier);
    }

    close(): void {
        // Jaeger tracer doesn't have a close method, but we can log
        console.log('Jaeger tracing service closed');
    }
}

// Tracing decorator for methods
export function Trace(operationName?: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        const className = target.constructor.name;

        descriptor.value = function (...args: any[]) {
            const tracer = global.tracer;
            if (!tracer) {
                return method.apply(this, args);
            }

            const spanName = operationName || `${className}.${propertyKey}`;
            const span = tracer.startSpan(spanName);

            try {
                // Add method metadata
                span.setTag('component', 'nestjs');
                span.setTag('class', className);
                span.setTag('method', propertyKey);

                // Add correlation ID if available
                const correlationId = this.getCorrelationId?.() || global.getCorrelationId?.();
                if (correlationId) {
                    span.setTag('correlation.id', correlationId);
                }

                const result = method.apply(this, args);

                // Handle promises
                if (result && typeof result.then === 'function') {
                    return result
                        .then((res: any) => {
                            span.setTag('success', true);
                            span.finish();
                            return res;
                        })
                        .catch((error: any) => {
                            span.setTag('error', true);
                            span.setTag('error.message', error.message);
                            span.log({ event: 'error', error: error.message, stack: error.stack });
                            span.finish();
                            throw error;
                        });
                }

                span.setTag('success', true);
                span.finish();
                return result;
            } catch (error) {
                span.setTag('error', true);
                span.setTag('error.message', error.message);
                span.log({ event: 'error', error: error.message, stack: error.stack });
                span.finish();
                throw error;
            }
        };
    };
}

// HTTP tracing interceptor
export function createTracingInterceptor() {
    return {
        intercept(context: any, next: any) {
            const tracer = global.tracer;
            if (!tracer) {
                return next.handle();
            }

            const request = context.switchToHttp().getRequest();
            const span = tracer.startSpan(`${request.method} ${request.route?.path || request.url}`);

            // Add HTTP metadata
            span.setTag('http.method', request.method);
            span.setTag('http.url', request.url);
            span.setTag('component', 'http');

            // Add correlation ID
            const correlationId = request.headers['x-correlation-id'];
            if (correlationId) {
                span.setTag('correlation.id', correlationId);
            }

            return next.handle().pipe(
                tap(() => {
                    span.setTag('http.status_code', context.switchToHttp().getResponse().statusCode);
                    span.finish();
                }),
                catchError((error) => {
                    span.setTag('error', true);
                    span.setTag('http.status_code', error.status || 500);
                    span.log({ event: 'error', message: error.message });
                    span.finish();
                    throw error;
                })
            );
        },
    };
}