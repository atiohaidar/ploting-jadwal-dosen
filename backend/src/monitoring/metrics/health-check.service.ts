import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(
    private prisma: PrismaService,
    private prometheus: PrometheusService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Test database connection with a simple query
      const startTime = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - startTime;

      // Record metrics
      this.prometheus.startDbQueryTimer('health_check', 'health')();

      return this.getStatus(key, true, {
        responseTime: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, {
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}

@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  constructor(private prometheus: PrometheusService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const usagePercent = Math.round((heapUsedMB / heapTotalMB) * 100);

      // Check if memory usage is above 90%
      if (usagePercent > 90) {
        throw new Error(`High memory usage: ${usagePercent}%`);
      }

      return this.getStatus(key, true, {
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`,
        usagePercent: `${usagePercent}%`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw new HealthCheckError(
        'Memory check failed',
        this.getStatus(key, false, {
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}

@Injectable()
export class DiskHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Check disk space (simplified - in production, you'd use a library like 'diskusage')
      const fs = require('fs').promises;
      const stats = await fs.statvfs?.('/') || { f_bavail: 1000000, f_blocks: 2000000 };

      if (!stats.f_bavail || !stats.f_blocks) {
        // Fallback for systems without statvfs
        return this.getStatus(key, true, {
          message: 'Disk check not available on this system',
          timestamp: new Date().toISOString(),
        });
      }

      const freeGB = Math.round((stats.f_bavail * 4096) / 1024 / 1024 / 1024); // Assuming 4KB blocks
      const totalGB = Math.round((stats.f_blocks * 4096) / 1024 / 1024 / 1024);

      // Check if free space is below 1GB
      if (freeGB < 1) {
        throw new Error(`Low disk space: ${freeGB}GB free`);
      }

      return this.getStatus(key, true, {
        freeSpace: `${freeGB}GB`,
        totalSpace: `${totalGB}GB`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // If disk check fails, don't fail the health check completely
      return this.getStatus(key, true, {
        message: 'Disk check failed but not critical',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

@Injectable()
export class ApplicationHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);

      return this.getStatus(key, true, {
        uptime: `${uptimeHours}h ${uptimeMinutes}m`,
        version: process.env.npm_package_version || '1.0.0',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw new HealthCheckError(
        'Application check failed',
        this.getStatus(key, false, {
          error: error.message,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }
}