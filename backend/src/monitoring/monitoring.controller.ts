import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrometheusService } from './metrics/prometheus.service';
import { DatabaseHealthIndicator } from './metrics/health-check.service';
import { MemoryHealthIndicator } from './metrics/health-check.service';
import { DiskHealthIndicator } from './metrics/health-check.service';
import { ApplicationHealthIndicator } from './metrics/health-check.service';

@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(
    private health: HealthCheckService,
    private prometheus: PrometheusService,
    private dbHealth: DatabaseHealthIndicator,
    private memoryHealth: MemoryHealthIndicator,
    private diskHealth: DiskHealthIndicator,
    private appHealth: ApplicationHealthIndicator,
  ) {}

  @Get('health')
  @ApiOperation({
    summary: 'Comprehensive health check',
    description: 'Checks the health of all system components including database, memory, disk, and application',
  })
  @ApiResponse({
    status: 200,
    description: 'All services are healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        details: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                responseTime: { type: 'string', example: '5ms' },
              },
            },
            memory: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
                heapUsed: { type: 'string', example: '50MB' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 503, description: 'One or more services are unhealthy' })
  @HealthCheck()
  async checkHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.dbHealth.isHealthy('database'),
      () => this.memoryHealth.isHealthy('memory'),
      () => this.diskHealth.isHealthy('disk'),
      () => this.appHealth.isHealthy('application'),
    ]);
  }

  @Get('health/database')
  @ApiOperation({
    summary: 'Database health check',
    description: 'Checks database connectivity and response time',
  })
  @HealthCheck()
  async checkDatabaseHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.dbHealth.isHealthy('database'),
    ]);
  }

  @Get('health/memory')
  @ApiOperation({
    summary: 'Memory health check',
    description: 'Checks memory usage and availability',
  })
  @HealthCheck()
  async checkMemoryHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.memoryHealth.isHealthy('memory'),
    ]);
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Prometheus metrics',
    description: 'Returns application metrics in Prometheus format',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics data in Prometheus format',
    content: {
      'text/plain': {
        schema: { type: 'string' },
      },
    },
  })
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.prometheus.getMetrics();
  }

  @Get('metrics/json')
  @ApiOperation({
    summary: 'Metrics in JSON format',
    description: 'Returns application metrics in JSON format for easier consumption',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics data in JSON format',
    schema: {
      type: 'object',
      properties: {
        http_requests_total: {
          type: 'object',
          description: 'HTTP request counters',
        },
        db_query_duration_seconds: {
          type: 'object',
          description: 'Database query duration histograms',
        },
        memory_usage_bytes: {
          type: 'object',
          description: 'Memory usage gauges',
        },
      },
    },
  })
  async getMetricsJson(): Promise<any> {
    const metrics = await this.prometheus.getMetrics();
    // In a real implementation, you'd parse the Prometheus format
    // For now, return a simplified JSON structure
    return {
      status: 'metrics_endpoint_available',
      timestamp: new Date().toISOString(),
      format: 'prometheus_text_format',
      metrics_length: metrics.length,
      note: 'Use /monitoring/metrics for full Prometheus format',
    };
  }

  @Get('info')
  @ApiOperation({
    summary: 'Application information',
    description: 'Returns basic application information and version details',
  })
  @ApiResponse({
    status: 200,
    description: 'Application information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'backend' },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        uptime: { type: 'string', example: '2h 30m' },
        nodeVersion: { type: 'string', example: 'v18.17.0' },
        timestamp: { type: 'string', example: '2025-09-21T14:30:00.000Z' },
      },
    },
  })
  getAppInfo(): any {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    return {
      name: process.env.npm_package_name || 'ploting-jadwal-dosen-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: `${uptimeHours}h ${uptimeMinutes}m`,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ping')
  @ApiOperation({
    summary: 'Simple ping/pong health check',
    description: 'Basic connectivity check that returns pong',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is responding',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'pong' },
        timestamp: { type: 'string', example: '2025-09-21T14:30:00.000Z' },
      },
    },
  })
  ping(): any {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}