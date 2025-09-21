import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { register, collectDefaultMetrics, Gauge, Counter, Histogram, Summary } from 'prom-client';

@Injectable()
export class PrometheusService implements OnModuleInit, OnModuleDestroy {
  private registry = register;
  private metricsInterval: NodeJS.Timeout | null = null;

  // HTTP request metrics
  private httpRequestsTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private httpRequestsInProgress: Gauge<string>;

  // Database metrics
  private dbConnectionsTotal: Counter<string>;
  private dbQueryDuration: Histogram<string>;
  private dbConnectionsActive: Gauge<string>;

  // Business metrics
  private usersTotal: Gauge<string>;
  private activeUsers: Gauge<string>;
  private loginAttemptsTotal: Counter<string>;
  private loginFailuresTotal: Counter<string>;

  // System metrics
  private memoryUsage: Gauge<string>;
  private cpuUsage: Gauge<string>;

  constructor() {
    // Clear registry in test environment to avoid conflicts
    if (process.env.NODE_ENV === 'test') {
      this.registry = new (require('prom-client')).Registry();
      this.registry.setDefaultLabels({ service: 'test' });
    }

    this.initializeMetrics();
  }

  private initializeMetrics() {
    // HTTP Metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsInProgress = new Gauge({
      name: 'http_requests_in_progress',
      help: 'Number of HTTP requests currently in progress',
      labelNames: ['method', 'route'],
      registers: [this.registry],
    });

    // Database Metrics
    this.dbConnectionsTotal = new Counter({
      name: 'db_connections_total',
      help: 'Total number of database connections',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    // Business Metrics
    this.usersTotal = new Gauge({
      name: 'users_total',
      help: 'Total number of registered users',
      labelNames: ['role'],
      registers: [this.registry],
    });

    this.activeUsers = new Gauge({
      name: 'active_users',
      help: 'Number of currently active users',
      registers: [this.registry],
    });

    this.loginAttemptsTotal = new Counter({
      name: 'login_attempts_total',
      help: 'Total number of login attempts',
      registers: [this.registry],
    });

    this.loginFailuresTotal = new Counter({
      name: 'login_failures_total',
      help: 'Total number of failed login attempts',
      registers: [this.registry],
    });

    // System Metrics
    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Current memory usage in bytes',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.cpuUsage = new Gauge({
      name: 'cpu_usage_percent',
      help: 'Current CPU usage percentage',
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Collect default metrics (CPU, memory, event loop lag, etc.)
    if (process.env.NODE_ENV !== 'test') {
      collectDefaultMetrics({ register: this.registry, prefix: 'nodejs_' });
    }

    // Start collecting custom system metrics
    this.startSystemMetricsCollection();
  }

  onModuleDestroy() {
    // Clear the metrics collection interval
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  private startSystemMetricsCollection() {
    // Don't start metrics collection in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // Update system metrics every 30 seconds
    this.metricsInterval = setInterval(() => {
      this.updateSystemMetrics();
    }, 30000);

    // Initial update
    this.updateSystemMetrics();
  }

  private updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);

    // CPU usage (simplified - in production, you'd want more detailed metrics)
    const cpuUsage = process.cpuUsage();
    const totalCpuTime = cpuUsage.user + cpuUsage.system;
    this.cpuUsage.set(totalCpuTime / 1000000); // Convert to seconds
  }

  // HTTP Metrics Methods
  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  startHttpRequestTimer(method: string, route: string) {
    return this.httpRequestDuration.startTimer({ method, route });
  }

  incrementHttpRequestsInProgress(method: string, route: string) {
    this.httpRequestsInProgress.inc({ method, route });
  }

  decrementHttpRequestsInProgress(method: string, route: string) {
    this.httpRequestsInProgress.dec({ method, route });
  }

  // Database Metrics Methods
  incrementDbConnections(type: string = 'pool') {
    this.dbConnectionsTotal.inc({ type });
  }

  startDbQueryTimer(operation: string, table?: string) {
    return this.dbQueryDuration.startTimer({ operation, table: table || 'unknown' });
  }

  setActiveDbConnections(count: number) {
    this.dbConnectionsActive.set(count);
  }

  // Business Metrics Methods
  setUsersTotal(count: number, role: string = 'all') {
    this.usersTotal.set({ role }, count);
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  incrementLoginAttempts() {
    this.loginAttemptsTotal.inc();
  }

  incrementLoginFailures() {
    this.loginFailuresTotal.inc();
  }

  // Utility Methods
  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getRegistry() {
    return this.registry;
  }

  // Custom metric creation helper
  createCounter(name: string, help: string, labelNames?: string[]): Counter<string> {
    return new Counter({ name, help, labelNames });
  }

  createGauge(name: string, help: string, labelNames?: string[]): Gauge<string> {
    return new Gauge({ name, help, labelNames });
  }

  createHistogram(name: string, help: string, labelNames?: string[], buckets?: number[]): Histogram<string> {
    return new Histogram({ name, help, labelNames, buckets });
  }

  createSummary(name: string, help: string, labelNames?: string[]): Summary<string> {
    return new Summary({ name, help, labelNames });
  }
}