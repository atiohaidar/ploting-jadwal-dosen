import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');
import { getNamespace } from 'cls-hooked';

export interface LogContext {
    correlationId?: string;
    userId?: string;
    requestId?: string;
    method?: string;
    url?: string;
    userAgent?: string;
    ip?: string;
    duration?: number;
    statusCode?: number;
    [key: string]: any;
}

@Injectable()
export class WinstonLoggerService implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const correlationId = this.getCorrelationId();
                    const logEntry = {
                        timestamp,
                        level,
                        message,
                        correlationId,
                        ...meta,
                    };
                    return JSON.stringify(logEntry);
                })
            ),
            transports: [
                // Console transport for development
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple(),
                        winston.format.printf(({ timestamp, level, message, correlationId }) => {
                            const cid = correlationId ? `[${correlationId}]` : '';
                            return `${timestamp} ${level} ${cid} ${message}`;
                        })
                    ),
                }),

                // File transport for all logs
                new DailyRotateFile({
                    filename: 'logs/application-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    ),
                }),

                // Separate file for errors
                new DailyRotateFile({
                    filename: 'logs/error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    ),
                }),
            ],
        });
    }

    private getCorrelationId(): string | undefined {
        const namespace = getNamespace('request-context');
        return namespace?.get('correlationId');
    }

    log(message: string, context?: LogContext) {
        this.logger.info(message, context);
    }

    error(message: string, trace?: string, context?: LogContext) {
        this.logger.error(message, { trace, ...context });
    }

    warn(message: string, context?: LogContext) {
        this.logger.warn(message, context);
    }

    debug(message: string, context?: LogContext) {
        this.logger.debug(message, context);
    }

    verbose(message: string, context?: LogContext) {
        this.logger.verbose(message, context);
    }

    // Custom logging methods for different scenarios
    logRequest(context: LogContext) {
        this.logger.info('HTTP Request', {
            type: 'request',
            ...context,
        });
    }

    logResponse(context: LogContext) {
        this.logger.info('HTTP Response', {
            type: 'response',
            ...context,
        });
    }

    logError(error: Error, context?: LogContext) {
        this.logger.error('Application Error', {
            type: 'error',
            error: error.message,
            stack: error.stack,
            ...context,
        });
    }

    logDatabase(query: string, duration: number, context?: LogContext) {
        this.logger.info('Database Query', {
            type: 'database',
            query,
            duration,
            ...context,
        });
    }

    logAuth(action: string, userId?: string, context?: LogContext) {
        this.logger.info('Authentication Event', {
            type: 'auth',
            action,
            userId,
            ...context,
        });
    }
}