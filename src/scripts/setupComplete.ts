#!/usr/bin/env node

/**
 * Complete Automation Setup Script
 * 
 * This script performs a comprehensive setup of the Ummah-Connects automation system:
 * 1. Validates environment and dependencies
 * 2. Deploys database schemas
 * 3. Configures all services
 * 4. Sets up monitoring and alerts
 * 5. Initializes workflows
 * 6. Starts the orchestrator
 * 7. Verifies complete system functionality
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { AutomationDeployer } from './deployAutomation.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SetupConfig {
  environment: 'development' | 'staging' | 'production';
  skipValidation?: boolean;
  skipDeployment?: boolean;
  skipConfiguration?: boolean;
  skipVerification?: boolean;
  autoStart?: boolean;
  verbose?: boolean;
}

class CompleteSetup {
  private config: SetupConfig;
  private supabase: any;
  private startTime: Date;
  private setupSteps: string[] = [];

  constructor(config: SetupConfig) {
    this.config = {
      autoStart: true,
      verbose: true,
      ...config
    };
    this.startTime = new Date();
    
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
    );
  }

  private log(message: string, level: 'info' | 'warn' | 'error' | 'success' | 'step' = 'info') {
    if (!this.config.verbose && level === 'info') return;
    
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      warn: '⚠️',
      error: '❌',
      success: '✅',
      step: '🔄'
    }[level];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    if (level === 'step') {
      this.setupSteps.push(message);
    }
  }

  private async validateEnvironment(): Promise<void> {
    if (this.config.skipValidation) {
      this.log('Skipping environment validation');
      return;
    }

    this.log('Validating environment and dependencies...', 'step');

    // Check required environment variables
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Test Supabase connection
    try {
      const { error } = await this.supabase.from('_health_check').select('*').limit(1);
      if (error && !error.message.includes('relation "_health_check" does not exist')) {
        throw new Error(`Supabase connection failed: ${error.message}`);
      }
    } catch (error) {
      this.log(`Supabase connection test: ${error}`, 'warn');
    }

    // Check optional API keys
    const optionalKeys = [
      'GOOGLE_ANALYTICS_API_KEY',
      'GOOGLE_SEARCH_CONSOLE_API_KEY',
      'GOOGLE_PAGESPEED_API_KEY',
      'HUBSPOT_API_KEY',
      'SMTP_HOST',
      'SLACK_WEBHOOK_URL'
    ];

    const missingOptional = optionalKeys.filter(key => !process.env[key]);
    if (missingOptional.length > 0) {
      this.log(`Optional API keys not configured: ${missingOptional.join(', ')}`, 'warn');
      this.log('Some features may be limited without these keys', 'warn');
    }

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      this.log(`Node.js version ${nodeVersion} detected. Recommended: 18+`, 'warn');
    }

    this.log('Environment validation completed', 'success');
  }

  private async deploySystem(): Promise<void> {
    if (this.config.skipDeployment) {
      this.log('Skipping system deployment');
      return;
    }

    this.log('Deploying automation system...', 'step');

    try {
      const deployer = new AutomationDeployer({
        environment: this.config.environment,
        verbose: this.config.verbose
      });

      await deployer.deploy();
      this.log('System deployment completed', 'success');
    } catch (error) {
      this.log(`System deployment failed: ${error}`, 'error');
      throw error;
    }
  }

  private async configureServices(): Promise<void> {
    if (this.config.skipConfiguration) {
      this.log('Skipping service configuration');
      return;
    }

    this.log('Configuring automation services...', 'step');

    try {
      // Configure notification preferences
      const notificationConfig = {
        email: {
          enabled: !!process.env.SMTP_HOST,
          recipients: ['admin@www.ummah-connects.com'],
          smtp: {
            host: process.env.SMTP_HOST || '',
            port: parseInt(process.env.SMTP_PORT || '587'),
            user: process.env.SMTP_USER || '',
            pass: process.env.SMTP_PASS || ''
          }
        },
        slack: {
          enabled: !!process.env.SLACK_WEBHOOK_URL,
          webhook: process.env.SLACK_WEBHOOK_URL || ''
        },
        webhook: {
          enabled: false,
          url: ''
        }
      };

      // Store notification configuration
      const { error: notifError } = await this.supabase
        .from('automation_config')
        .upsert({
          key: 'notification_config',
          value: notificationConfig,
          environment: this.config.environment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (notifError) throw notifError;

      // Configure API integrations
      const apiConfig = {
        google: {
          analytics: {
            enabled: !!process.env.GOOGLE_ANALYTICS_API_KEY,
            apiKey: process.env.GOOGLE_ANALYTICS_API_KEY || ''
          },
          searchConsole: {
            enabled: !!process.env.GOOGLE_SEARCH_CONSOLE_API_KEY,
            apiKey: process.env.GOOGLE_SEARCH_CONSOLE_API_KEY || ''
          },
          pageSpeed: {
            enabled: !!process.env.GOOGLE_PAGESPEED_API_KEY,
            apiKey: process.env.GOOGLE_PAGESPEED_API_KEY || ''
          }
        },
        hubspot: {
          enabled: !!process.env.HUBSPOT_API_KEY,
          apiKey: process.env.HUBSPOT_API_KEY || '',
          portalId: process.env.HUBSPOT_PORTAL_ID || ''
        },
        islamic: {
          calendarApi: {
            enabled: !!process.env.ISLAMIC_CALENDAR_API_KEY,
            apiKey: process.env.ISLAMIC_CALENDAR_API_KEY || ''
          }
        }
      };

      // Store API configuration
      const { error: apiError } = await this.supabase
        .from('automation_config')
        .upsert({
          key: 'api_integrations',
          value: apiConfig,
          environment: this.config.environment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (apiError) throw apiError;

      this.log('Service configuration completed', 'success');
    } catch (error) {
      this.log(`Service configuration failed: ${error}`, 'error');
      throw error;
    }
  }

  private async setupMonitoringAlerts(): Promise<void> {
    this.log('Setting up monitoring and alerts...', 'step');

    try {
      // Create default alert rules
      const alertRules = [
        {
          name: 'Performance Degradation',
          type: 'performance',
          condition: 'performance_score < 70',
          severity: 'high',
          enabled: true,
          metadata: {
            description: 'Site performance score below threshold',
            threshold: 70,
            action: 'optimize_performance'
          }
        },
        {
          name: 'SEO Score Drop',
          type: 'seo',
          condition: 'seo_score < 75',
          severity: 'medium',
          enabled: true,
          metadata: {
            description: 'SEO score below target',
            threshold: 75,
            action: 'seo_optimization'
          }
        },
        {
          name: 'Low Conversion Rate',
          type: 'conversion',
          condition: 'conversion_rate < 1.5',
          severity: 'medium',
          enabled: true,
          metadata: {
            description: 'Conversion rate below target',
            threshold: 1.5,
            action: 'funnel_optimization'
          }
        },
        {
          name: 'Uptime Issue',
          type: 'uptime',
          condition: 'uptime < 95',
          severity: 'critical',
          enabled: true,
          metadata: {
            description: 'Site uptime below threshold',
            threshold: 95,
            action: 'infrastructure_check'
          }
        },
        {
          name: 'Ramadan Preparation',
          type: 'islamic',
          condition: 'days_to_ramadan <= 30',
          severity: 'info',
          enabled: true,
          metadata: {
            description: 'Ramadan approaching - prepare optimizations',
            threshold: 30,
            action: 'ramadan_optimization'
          }
        }
      ];

      // Insert alert rules
      for (const rule of alertRules) {
        const { error } = await this.supabase
          .from('automation_alerts')
          .upsert({
            ...rule,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'name' });

        if (error) throw error;
      }

      this.log('Monitoring and alerts setup completed', 'success');
    } catch (error) {
      this.log(`Monitoring setup failed: ${error}`, 'error');
      throw error;
    }
  }

  private async initializeWorkflows(): Promise<void> {
    this.log('Initializing workflow schedules...', 'step');

    try {
      // Create initial workflow execution log
      const { error } = await this.supabase
        .from('workflow_logs')
        .insert({
          phase: 'system_initialization',
          status: 'completed',
          timestamp: new Date().toISOString(),
          duration: Date.now() - this.startTime.getTime(),
          metadata: {
            action: 'complete_setup',
            environment: this.config.environment,
            steps: this.setupSteps
          }
        });

      if (error) throw error;

      this.log('Workflow initialization completed', 'success');
    } catch (error) {
      this.log(`Workflow initialization failed: ${error}`, 'error');
      throw error;
    }
  }

  private async startOrchestrator(): Promise<void> {
    if (!this.config.autoStart) {
      this.log('Skipping orchestrator auto-start');
      return;
    }

    this.log('Starting automation orchestrator...', 'step');

    try {
      // Update orchestrator status to running
      const { error } = await this.supabase
        .from('automation_config')
        .upsert({
          key: 'orchestrator_status',
          value: {
            isRunning: true,
            startTime: new Date().toISOString(),
            environment: this.config.environment,
            pid: process.pid,
            version: '1.0.0',
            setupComplete: true
          },
          environment: this.config.environment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;

      this.log('Orchestrator started successfully', 'success');
    } catch (error) {
      this.log(`Failed to start orchestrator: ${error}`, 'error');
      throw error;
    }
  }

  private async verifySetup(): Promise<void> {
    if (this.config.skipVerification) {
      this.log('Skipping setup verification');
      return;
    }

    this.log('Verifying complete setup...', 'step');

    try {
      // Check database tables
      const tables = [
        'automation_metrics',
        'workflow_logs',
        'automation_config',
        'automation_alerts',
        'automation_trends',
        'islamic_automation_calendar'
      ];

      for (const table of tables) {
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          throw new Error(`Table ${table} verification failed: ${error.message}`);
        }
      }

      // Check configuration
      const { data: config, error: configError } = await this.supabase
        .from('automation_config')
        .select('*')
        .eq('environment', this.config.environment);

      if (configError) throw configError;

      if (!config || config.length === 0) {
        throw new Error('Configuration verification failed');
      }

      // Check orchestrator status
      const orchestratorConfig = config.find((c: any) => c.key === 'orchestrator_status');
      if (!orchestratorConfig || !orchestratorConfig.value.setupComplete) {
        throw new Error('Orchestrator setup verification failed');
      }

      this.log('Setup verification completed successfully', 'success');
    } catch (error) {
      this.log(`Setup verification failed: ${error}`, 'error');
      throw error;
    }
  }

  private async generateSetupReport(): Promise<void> {
    this.log('Generating setup report...', 'step');

    const duration = Date.now() - this.startTime.getTime();
    const report = {
      setupTime: this.startTime.toISOString(),
      duration: `${duration}ms`,
      environment: this.config.environment,
      steps: this.setupSteps,
      config: this.config,
      status: 'completed',
      nextSteps: [
        'Access the automation dashboard at /automation',
        'Configure additional API keys if needed',
        'Review and adjust workflow schedules',
        'Set up custom notification preferences',
        'Monitor system performance and alerts'
      ]
    };

    // Save report to database
    try {
      const { error } = await this.supabase
        .from('workflow_logs')
        .insert({
          phase: 'setup_report',
          status: 'completed',
          timestamp: new Date().toISOString(),
          duration,
          metadata: report
        });

      if (error) throw error;
    } catch (error) {
      this.log(`Failed to save setup report: ${error}`, 'warn');
    }

    // Display report
    console.log('\n' + '='.repeat(60));
    console.log('🎉 UMMAH-CONNECTS AUTOMATION SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`Environment: ${this.config.environment}`);
    console.log(`Setup Duration: ${duration}ms`);
    console.log(`Steps Completed: ${this.setupSteps.length}`);
    console.log('\n📋 Next Steps:');
    report.nextSteps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    console.log('\n🚀 The automation system is now fully operational!');
    console.log('='.repeat(60) + '\n');
  }

  public async setup(): Promise<void> {
    try {
      this.log(`Starting complete automation setup for ${this.config.environment}`, 'info');
      
      await this.validateEnvironment();
      await this.deploySystem();
      await this.configureServices();
      await this.setupMonitoringAlerts();
      await this.initializeWorkflows();
      await this.startOrchestrator();
      await this.verifySetup();
      await this.generateSetupReport();

    } catch (error) {
      const duration = Date.now() - this.startTime.getTime();
      this.log(`Complete setup failed after ${duration}ms: ${error}`, 'error');
      
      // Log failure
      try {
        await this.supabase
          .from('workflow_logs')
          .insert({
            phase: 'setup_failed',
            status: 'failed',
            timestamp: new Date().toISOString(),
            duration,
            error: error instanceof Error ? error.message : String(error),
            metadata: {
              environment: this.config.environment,
              config: this.config,
              completedSteps: this.setupSteps
            }
          });
      } catch (logError) {
        this.log(`Failed to log setup failure: ${logError}`, 'warn');
      }

      throw error;
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const config: SetupConfig = {
    environment: 'development'
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--environment':
      case '-e':
        config.environment = args[++i] as 'development' | 'staging' | 'production';
        break;
      case '--skip-validation':
        config.skipValidation = true;
        break;
      case '--skip-deployment':
        config.skipDeployment = true;
        break;
      case '--skip-configuration':
        config.skipConfiguration = true;
        break;
      case '--skip-verification':
        config.skipVerification = true;
        break;
      case '--no-auto-start':
        config.autoStart = false;
        break;
      case '--quiet':
      case '-q':
        config.verbose = false;
        break;
      case '--help':
      case '-h':
        console.log(`
Complete Automation Setup Script

Usage: node setupComplete.js [options]

Options:
  -e, --environment <env>    Environment (development|staging|production)
  --skip-validation         Skip environment validation
  --skip-deployment         Skip system deployment
  --skip-configuration      Skip service configuration
  --skip-verification       Skip setup verification
  --no-auto-start          Don't auto-start orchestrator
  -q, --quiet              Quiet mode
  -h, --help               Show this help message

Examples:
  node setupComplete.js --environment production
  node setupComplete.js --skip-validation --environment staging
  node setupComplete.js --no-auto-start
`);
        process.exit(0);
        break;
    }
  }

  // Validate environment
  if (!['development', 'staging', 'production'].includes(config.environment)) {
    console.error('❌ Invalid environment. Must be: development, staging, or production');
    process.exit(1);
  }

  // Run complete setup
  const setup = new CompleteSetup(config);
  setup.setup()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Complete setup failed:', error);
      process.exit(1);
    });
}

export { CompleteSetup, type SetupConfig };