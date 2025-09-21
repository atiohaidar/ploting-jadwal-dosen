import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createNamespace, getNamespace } from 'cls-hooked';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
    private readonly namespace = 'request-context';

    constructor() {
        // Don't create namespace in test environment to avoid keeping process alive
        if (process.env.NODE_ENV !== 'test') {
            if (!getNamespace(this.namespace)) {
                createNamespace(this.namespace);
            }
        }
    }

    use(req: Request, res: Response, next: NextFunction) {
        // Skip correlation ID handling in test environment
        if (process.env.NODE_ENV === 'test') {
            return next();
        }

        const namespace = getNamespace(this.namespace);

        if (namespace) {
            // Generate or get correlation ID
            const correlationId = req.headers['x-correlation-id'] as string || uuidv4();

            // Set correlation ID in namespace
            namespace.run(() => {
                namespace.set('correlationId', correlationId);
                namespace.set('requestId', correlationId);
                namespace.set('startTime', Date.now());

                // Add correlation ID to response headers
                res.setHeader('x-correlation-id', correlationId);

                // Store request details in namespace for logging
                namespace.set('method', req.method);
                namespace.set('url', req.originalUrl);
                namespace.set('userAgent', req.get('User-Agent'));
                namespace.set('ip', this.getClientIp(req));

                next();
            });
        } else {
            next();
        }
    }

    private getClientIp(req: Request): string {
        // Check for forwarded headers first (for proxies/load balancers)
        const forwarded = req.headers['x-forwarded-for'] as string;
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }

        // Check other proxy headers
        const realIp = req.headers['x-real-ip'] as string;
        if (realIp) {
            return realIp;
        }

        // Fall back to connection remote address
        return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
    }
}

// Helper function to get correlation ID from current context
export function getCorrelationId(): string | undefined {
    const namespace = getNamespace('request-context');
    return namespace?.get('correlationId');
}

// Helper function to get request context
export function getRequestContext(): {
    correlationId?: string;
    requestId?: string;
    startTime?: number;
    method?: string;
    url?: string;
    userAgent?: string;
    ip?: string;
} {
    const namespace = getNamespace('request-context');
    if (!namespace) return {};

    return {
        correlationId: namespace.get('correlationId'),
        requestId: namespace.get('requestId'),
        startTime: namespace.get('startTime'),
        method: namespace.get('method'),
        url: namespace.get('url'),
        userAgent: namespace.get('userAgent'),
        ip: namespace.get('ip'),
    };
}