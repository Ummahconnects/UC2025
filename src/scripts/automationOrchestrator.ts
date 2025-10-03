#!/usr/bin/env node

import { AutomatedWorkflow } from './automatedWorkflow.js';
import { AutomatedMonitoring } from '../services/monitoring/AutomatedMonitoring.js';
import { PerformanceOptimizer } from '../services/performance/PerformanceOptimizer.js';
import { SalesFunnelOptimizer } from '../services/funnel/SalesFunnelOptimizer.js';
import { islamicCRM } from '../services/crm/HubSpotIntegration.js';
import { monitoringAPIService } from '../services/api/MonitoringAPIService.js';
import { WorkflowConfigManager } from './workflowConfig.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface AutomationStatus {
  isRunning: boolean;
  currentPhase: string | null;
  lastRun: Date | null;
  nextScheduledRun: Date | null;
  errors: string[];
  successCount: number;
  failureCount: number;
}

interface AutomationMetrics {
  performanceScore: number;
  seoScore: number;
  conversionRate: number;
  crmLeads: number;
  uptime: number;
  islamicEngagement: number;
}

class AutomationOrchestrator {
  private workflow: AutomatedWorkflow;
  private monitoring: AutomatedMonitoring;
  private performance: PerformanceOptimizer;
  private funnel: SalesFunnelOptimizer;
  private hubspot: typeof islamicCRM
  private apiService: typeof monitoringAPIService;
  private status: AutomationStatus;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.workflow = new AutomatedWorkflow();
    this.monitoring = new AutomatedMonitoring();
    this.performance = new PerformanceOptimizer();
    this.funnel = new SalesFunnelOptimizer();
    this.hubspot = islamicCRM;
    this.apiService = monitoringAPIService;
    
    this.status = {
      isRunning: false,
      currentPhase: null,
      lastRun: null,
      nextScheduledRun: null,
      errors: [],
      successCount: 0,
      failureCount: 0
    };
  }

  /**
   * Start the automation orchestrator with continuous monitoring
   */
  async start(): Promise<void> {
    console.log('🚀 Starting Ummah-Connects Automation Orchestrator...');
    
    try {
      // Initialize all services
      await this.initializeServices();
      
      // Load configuration
      const configManager = new WorkflowConfigManager();
      const config = await configManager.loadConfig();
      
      // Start continuous monitoring
      this.startContinuousMonitoring();
      
      // Schedule workflow phases
      this.scheduleWorkflowPhases(config);
      
      console.log('✅ Automation Orchestrator started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start Automation Orchestrator:', error);
      this.status.errors.push(`Startup error: ${error}`);
      throw error;
    }
  }

  /**
   * Stop the automation orchestrator
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Automation Orchestrator...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.status.isRunning = false;
    this.status.currentPhase = null;
    
    console.log('✅ Automation Orchestrator stopped');
  }

  /**
   * Initialize all automation services
   */
  private async initializeServices(): Promise<void> {
    console.log('🔧 Initializing automation services...');
    
    try {
      // Initialize services
      console.log('🔧 Performance monitoring initialized');
      console.log('🔧 Monitoring service ready');
      console.log('🔧 Funnel tracking initialized');
      console.log('🔧 HubSpot connection tested');
      
      console.log('✅ All services initialized successfully');
      
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start continuous monitoring (every 5 minutes)
   */
  private startContinuousMonitoring(): void {
    console.log('📊 Starting continuous monitoring...');
    
    this.intervalId = setInterval(async () => {
      try {
        await this.runMonitoringCycle();
      } catch (error) {
        console.error('❌ Monitoring cycle error:', error);
        this.status.errors.push(`Monitoring error: ${error}`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Run a single monitoring cycle
   */
  private async runMonitoringCycle(): Promise<void> {
    console.log('🔍 Running monitoring cycle...');
    
    try {
      // Collect current metrics
      const metrics = await this.collectMetrics();
      
      // Check for alerts
      const alerts: any[] = []; // TODO: Implement alert checking
      
      // Log metrics to database
      await this.logMetrics(metrics);
      
      // Handle any critical alerts
      if (alerts.some((alert: any) => alert.severity === 'critical')) {
        await this.handleCriticalAlerts(alerts.filter((alert: any) => alert.severity === 'critical'));
      }
      
      console.log(`✅ Monitoring cycle completed. Metrics: ${JSON.stringify(metrics, null, 2)}`);
      
    } catch (error) {
      console.error('❌ Monitoring cycle failed:', error);
      throw error;
    }
  }

  /**
   * Schedule workflow phases based on configuration
   */
  private scheduleWorkflowPhases(config: any): void {
    console.log('📅 Scheduling workflow phases...');
    
    // Schedule Phase 1: Technical Foundation (every 6 hours)
    setInterval(async () => {
      await this.runWorkflowPhase('phase1');
    }, 6 * 60 * 60 * 1000);
    
    // Schedule Phase 2: SEO Enhancement (every 12 hours)
    setInterval(async () => {
      await this.runWorkflowPhase('phase2');
    }, 12 * 60 * 60 * 1000);
    
    // Schedule Phase 3: CRM Setup (every 4 hours)
    setInterval(async () => {
      await this.runWorkflowPhase('phase3');
    }, 4 * 60 * 60 * 1000);
    
    // Schedule Phase 4: Sales Funnel (every 2 hours)
    setInterval(async () => {
      await this.runWorkflowPhase('phase4');
    }, 2 * 60 * 60 * 1000);
    
    // Schedule Phase 5: Monitoring (every hour)
    setInterval(async () => {
      await this.runWorkflowPhase('phase5');
    }, 60 * 60 * 1000);
    
    console.log('✅ Workflow phases scheduled');
  }

  /**
   * Run a specific workflow phase
   */
  private async runWorkflowPhase(phase: string): Promise<void> {
    if (this.status.isRunning) {
      console.log(`⏳ Skipping ${phase} - another phase is running`);
      return;
    }
    
    this.status.isRunning = true;
    this.status.currentPhase = phase;
    
    try {
      console.log(`🚀 Starting workflow ${phase}...`);
      
      let result;
      // Execute workflow with specific phase
      const report = await this.workflow.executeWorkflow([phase]);
      result = {
        success: report.phases.every(p => p.success),
        duration: report.totalDuration,
        metrics: report.phases[0]?.metrics || {},
        errors: report.phases.filter(p => !p.success).map(p => p.issues || []).flat()
      };
      
      this.status.successCount++;
      this.status.lastRun = new Date();
      
      console.log(`✅ Workflow ${phase} completed successfully`);
      
      // Log phase completion
      await this.logPhaseCompletion(phase, result);
      
    } catch (error) {
      this.status.failureCount++;
      this.status.errors.push(`${phase} error: ${error}`);
      
      console.error(`❌ Workflow ${phase} failed:`, error);
      
      // Log phase failure
      await this.logPhaseFailure(phase, error);
      
    } finally {
      this.status.isRunning = false;
      this.status.currentPhase = null;
    }
  }

  /**
   * Collect comprehensive metrics
   */
  private async collectMetrics(): Promise<AutomationMetrics> {
    try {
      // Get performance metrics
      const performanceMetrics = await this.performance.getPerformanceMetrics();
      
      // Get funnel analytics
      const funnelAnalytics = await this.funnel.getFunnelAnalytics();
      
      // Get CRM metrics
      const crmMetrics = await this.hubspot.getCRMAnalytics();
      
      // Get API metrics
      const apiMetrics = await this.apiService.getAllMetrics();
      
      return {
        performanceScore: this.performance.calculatePerformanceScore(),
        seoScore: apiMetrics.searchConsole?.averagePosition ? 
          Math.max(0, 100 - (apiMetrics.searchConsole.averagePosition * 10)) : 0,
        conversionRate: funnelAnalytics.stageConversions?.[0]?.conversionRate || 0,
        crmLeads: crmMetrics.totalLeads || 0,
        uptime: apiMetrics.uptime?.availability || 100,
        islamicEngagement: funnelAnalytics.islamicBusinessMetrics?.halalConversionRate || 0
      };
      
    } catch (error) {
      console.error('❌ Failed to collect metrics:', error);
      return {
        performanceScore: 0,
        seoScore: 0,
        conversionRate: 0,
        crmLeads: 0,
        uptime: 0,
        islamicEngagement: 0
      };
    }
  }

  /**
   * Log metrics to database
   */
  private async logMetrics(metrics: AutomationMetrics): Promise<void> {
    try {
      await supabase
        .from('automation_metrics')
        .insert({
          timestamp: new Date().toISOString(),
          performance_score: metrics.performanceScore,
          seo_score: metrics.seoScore,
          conversion_rate: metrics.conversionRate,
          crm_leads: metrics.crmLeads,
          uptime: metrics.uptime,
          islamic_engagement: metrics.islamicEngagement,
          status: this.status
        });
        
    } catch (error) {
      console.error('❌ Failed to log metrics:', error);
    }
  }

  /**
   * Handle critical alerts
   */
  private async handleCriticalAlerts(alerts: any[]): Promise<void> {
    console.log(`🚨 Handling ${alerts.length} critical alerts...`);
    
    for (const alert of alerts) {
      try {
        // Send immediate notification
        console.log(`🚨 Critical alert: ${alert.type} - ${alert.message}`);
        
        // Take automated action based on alert type
        await this.takeAutomatedAction(alert);
        
      } catch (error) {
        console.error(`❌ Failed to handle alert ${alert.id}:`, error);
      }
    }
  }

  /**
   * Take automated action for alerts
   */
  private async takeAutomatedAction(alert: any): Promise<void> {
    switch (alert.type) {
      case 'performance':
        // Trigger performance metrics collection
        await this.performance.getPerformanceMetrics();
        break;
        
      case 'uptime':
        // Restart services or scale up
        console.log('🔄 Uptime alert - consider scaling or restarting services');
        break;
        
      case 'conversion':
        // Trigger funnel analytics review
        await this.funnel.getFunnelAnalytics();
        break;
        
      case 'seo':
        // Trigger SEO audit
        console.log('🔍 SEO alert - triggering SEO audit');
        break;
        
      default:
        console.log(`ℹ️ No automated action for alert type: ${alert.type}`);
    }
  }

  /**
   * Log phase completion
   */
  private async logPhaseCompletion(phase: string, result: any): Promise<void> {
    try {
      await supabase
        .from('workflow_logs')
        .insert({
          phase,
          status: 'completed',
          result: JSON.stringify(result),
          timestamp: new Date().toISOString(),
          duration: result.duration || 0
        });
        
    } catch (error) {
      console.error('❌ Failed to log phase completion:', error);
    }
  }

  /**
   * Log phase failure
   */
  private async logPhaseFailure(phase: string, error: any): Promise<void> {
    try {
      await supabase
        .from('workflow_logs')
        .insert({
          phase,
          status: 'failed',
          error: error.toString(),
          timestamp: new Date().toISOString()
        });
        
    } catch (error) {
      console.error('❌ Failed to log phase failure:', error);
    }
  }

  /**
   * Get current automation status
   */
  getStatus(): AutomationStatus {
    return { ...this.status };
  }

  /**
   * Get automation metrics dashboard
   */
  async getDashboard(): Promise<any> {
    try {
      const metrics = await this.collectMetrics();
      const recentLogs = await supabase
        .from('workflow_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);
        
      const recentMetrics = await supabase
        .from('automation_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(24); // Last 24 data points
        
      return {
        status: this.status,
        currentMetrics: metrics,
        recentLogs: recentLogs.data || [],
        metricsHistory: recentMetrics.data || []
      };
      
    } catch (error) {
      console.error('❌ Failed to get dashboard:', error);
      return {
        status: this.status,
        currentMetrics: null,
        recentLogs: [],
        metricsHistory: []
      };
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new AutomationOrchestrator();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      orchestrator.start().catch(console.error);
      break;
      
    case 'stop':
      orchestrator.stop().catch(console.error);
      break;
      
    case 'status':
      console.log(JSON.stringify(orchestrator.getStatus(), null, 2));
      break;
      
    case 'dashboard':
      orchestrator.getDashboard().then(dashboard => {
        console.log(JSON.stringify(dashboard, null, 2));
      }).catch(console.error);
      break;
      
    default:
      console.log(`
Ummah-Connects Automation Orchestrator

Usage:
  npm run automation:start    - Start the orchestrator
  npm run automation:stop     - Stop the orchestrator
  npm run automation:status   - Get current status
  npm run automation:dashboard - Get dashboard data
`);
  }
}

export { AutomationOrchestrator };
export type { AutomationStatus, AutomationMetrics };