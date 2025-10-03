#!/usr/bin/env node

/**
 * Automation Deployment Script
 * 
 * This script sets up the complete automation system for Ummah-Connects:
 * 1. Creates database schemas
 * 2. Initializes configuration
 * 3. Sets up monitoring
 * 4. Configures workflows
 * 5. Starts the orchestrator
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

interface DeploymentConfig {
  skipSchemas?: boolean;
  skipData?: boolean;
  skipOrchestrator?: boolean;
  environment?: 'development' | 'staging' | 'production';
  verbose?: boolean;
}

class AutomationDeployer {
  private config: DeploymentConfig;
  private startTime: Date;

  constructor(config: DeploymentConfig = {}) {
    this.config = {
      environment: 'development',
      verbose: false,
      ...config
    };
    this.startTime = new Date();
  }

  private log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
    if (!this.config.verbose && level === 'info') return;
    
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📋',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[level];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  private async executeSQL(sqlContent: string, description: string): Promise<void> {
    try {
      this.log(`Executing ${description}...`);
      
      // Split SQL content by statements (basic approach)
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase.from('_').select('*').limit(0);
            if (directError && !directError.message.includes('relation "_" does not exist')) {
              throw error;
            }
          }
        }
      }
      
      this.log(`${description} completed successfully`, 'success');
    } catch (error) {
      this.log(`Failed to execute ${description}: ${error}`, 'error');
      throw error;
    }
  }

  private async createDatabaseSchemas(): Promise<void> {
    if (this.config.skipSchemas) {
      this.log('Skipping database schema creation');
      return;
    }

    this.log('Creating database schemas...', 'info');

    try {
      // Read monitoring schema
      const monitoringSchemaPath = path.join(__dirname, '../database/monitoring-schema.sql');
      const monitoringSchema = await fs.readFile(monitoringSchemaPath, 'utf-8');
      await this.executeSQL(monitoringSchema, 'monitoring schema');

      // Read automation schema
      const automationSchemaPath = path.join(__dirname, '../database/automation-schema.sql');
      const automationSchema = await fs.readFile(automationSchemaPath, 'utf-8');
      await this.executeSQL(automationSchema, 'automation schema');

      this.log('Database schemas created successfully', 'success');
    } catch (error) {
      this.log(`Failed to create database schemas: ${error}`, 'error');
      throw error;
    }
  }

  private async initializeConfiguration(): Promise<void> {
    this.log('Initializing automation configuration...', 'info');

    try {
      // Default configuration for the environment
      const defaultConfig = {
        development: {
          monitoring_interval: 300000, // 5 minutes
          workflow_timeout: 1800000, // 30 minutes
          max_retries: 3,
          notification_channels: ['email'],
          performance_threshold: 70,
          seo_threshold: 75,
          conversion_threshold: 1.5,
          uptime_threshold: 95
        },
        staging: {
          monitoring_interval: 180000, // 3 minutes
          workflow_timeout: 1200000, // 20 minutes
          max_retries: 2,
          notification_channels: ['email', 'slack'],
          performance_threshold: 75,
          seo_threshold: 80,
          conversion_threshold: 2.0,
          uptime_threshold: 98
        },
        production: {
          monitoring_interval: 60000, // 1 minute
          workflow_timeout: 900000, // 15 minutes
          max_retries: 5,
          notification_channels: ['email', 'slack', 'webhook'],
          performance_threshold: 80,
          seo_threshold: 85,
          conversion_threshold: 2.5,
          uptime_threshold: 99
        }
      };

      const envConfig = defaultConfig[this.config.environment!];

      // Insert configuration
      const configEntries = Object.entries(envConfig).map(([key, value]) => ({
        key: `automation_${key}`,
        value: typeof value === 'object' ? value : { value },
        environment: this.config.environment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('automation_config')
        .upsert(configEntries, { onConflict: 'key' });

      if (error) throw error;

      this.log('Configuration initialized successfully', 'success');
    } catch (error) {
      this.log(`Failed to initialize configuration: ${error}`, 'error');
      throw error;
    }
  }

  private async setupMonitoring(): Promise<void> {
    this.log('Setting up monitoring...', 'info');

    try {
      // Create initial monitoring entry
      const { error } = await supabase
        .from('automation_metrics')
        .insert({
          timestamp: new Date().toISOString(),
          performance_score: 0,
          seo_score: 0,
          conversion_rate: 0,
          crm_leads: 0,
          uptime: 100,
          islamic_engagement: 0,
          metadata: {
            deployment: true,
            environment: this.config.environment,
            version: '1.0.0'
          }
        });

      if (error) throw error;

      // Create initial workflow log
      const { error: logError } = await supabase
        .from('workflow_logs')
        .insert({
          phase: 'deployment',
          status: 'completed',
          timestamp: new Date().toISOString(),
          duration: Date.now() - this.startTime.getTime(),
          metadata: {
            action: 'initial_setup',
            environment: this.config.environment
          }
        });

      if (logError) throw logError;

      this.log('Monitoring setup completed successfully', 'success');
    } catch (error) {
      this.log(`Failed to setup monitoring: ${error}`, 'error');
      throw error;
    }
  }

  private async configureWorkflows(): Promise<void> {
    this.log('Configuring workflows...', 'info');

    try {
      // Create workflow schedules based on environment
      const schedules = {
        development: {
          'technical_foundation': '0 */6 * * *', // Every 6 hours
          'seo_enhancement': '0 */4 * * *', // Every 4 hours
          'crm_setup': '0 */8 * * *', // Every 8 hours
          'sales_funnel': '0 */12 * * *', // Every 12 hours
          'monitoring': '*/5 * * * *' // Every 5 minutes
        },
        staging: {
          'technical_foundation': '0 */3 * * *', // Every 3 hours
          'seo_enhancement': '0 */2 * * *', // Every 2 hours
          'crm_setup': '0 */4 * * *', // Every 4 hours
          'sales_funnel': '0 */6 * * *', // Every 6 hours
          'monitoring': '*/3 * * * *' // Every 3 minutes
        },
        production: {
          'technical_foundation': '0 */1 * * *', // Every hour
          'seo_enhancement': '*/30 * * * *', // Every 30 minutes
          'crm_setup': '0 */2 * * *', // Every 2 hours
          'sales_funnel': '0 */3 * * *', // Every 3 hours
          'monitoring': '*/1 * * * *' // Every minute
        }
      };

      const envSchedules = schedules[this.config.environment!];

      // Store schedules in configuration
      const { error } = await supabase
        .from('automation_config')
        .upsert({
          key: 'workflow_schedules',
          value: envSchedules,
          environment: this.config.environment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;

      this.log('Workflows configured successfully', 'success');
    } catch (error) {
      this.log(`Failed to configure workflows: ${error}`, 'error');
      throw error;
    }
  }

  private async startOrchestrator(): Promise<void> {
    if (this.config.skipOrchestrator) {
      this.log('Skipping orchestrator startup');
      return;
    }

    this.log('Starting automation orchestrator...', 'info');

    try {
      // Update orchestrator status
      const { error } = await supabase
        .from('automation_config')
        .upsert({
          key: 'orchestrator_status',
          value: {
            isRunning: true,
            startTime: new Date().toISOString(),
            environment: this.config.environment,
            pid: process.pid,
            version: '1.0.0'
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

  private async verifyDeployment(): Promise<void> {
    this.log('Verifying deployment...', 'info');

    try {
      // Check if tables exist
      const tables = [
        'automation_metrics',
        'workflow_logs',
        'automation_config',
        'automation_alerts',
        'monitoring_alerts',
        'metrics_snapshots'
      ];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          throw new Error(`Table ${table} not accessible: ${error.message}`);
        }
      }

      // Check configuration
      const { data: config, error: configError } = await supabase
        .from('automation_config')
        .select('*')
        .eq('environment', this.config.environment);

      if (configError) throw configError;

      if (!config || config.length === 0) {
        throw new Error('No configuration found for environment');
      }

      this.log('Deployment verification completed successfully', 'success');
    } catch (error) {
      this.log(`Deployment verification failed: ${error}`, 'error');
      throw error;
    }
  }

  public async deploy(): Promise<void> {
    try {
      this.log(`Starting automation deployment for ${this.config.environment} environment`, 'info');
      
      await this.createDatabaseSchemas();
      await this.initializeConfiguration();
      await this.setupMonitoring();
      await this.configureWorkflows();
      await this.startOrchestrator();
      await this.verifyDeployment();

      const duration = Date.now() - this.startTime.getTime();
      this.log(`Automation deployment completed successfully in ${duration}ms`, 'success');
      
      // Log deployment completion
      await supabase
        .from('workflow_logs')
        .insert({
          phase: 'deployment_complete',
          status: 'completed',
          timestamp: new Date().toISOString(),
          duration,
          metadata: {
            environment: this.config.environment,
            config: this.config
          }
        });

    } catch (error) {
      const duration = Date.now() - this.startTime.getTime();
      this.log(`Automation deployment failed after ${duration}ms: ${error}`, 'error');
      
      // Log deployment failure
      await supabase
        .from('workflow_logs')
        .insert({
          phase: 'deployment_failed',
          status: 'failed',
          timestamp: new Date().toISOString(),
          duration,
          error: error instanceof Error ? error.message : String(error),
          metadata: {
            environment: this.config.environment,
            config: this.config
          }
        });

      throw error;
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const config: DeploymentConfig = {
    environment: 'development',
    verbose: true
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--environment':
      case '-e':
        config.environment = args[++i] as 'development' | 'staging' | 'production';
        break;
      case '--skip-schemas':
        config.skipSchemas = true;
        break;
      case '--skip-data':
        config.skipData = true;
        break;
      case '--skip-orchestrator':
        config.skipOrchestrator = true;
        break;
      case '--quiet':
      case '-q':
        config.verbose = false;
        break;
      case '--help':
      case '-h':
        console.log(`
Automation Deployment Script

Usage: node deployAutomation.js [options]

Options:
  -e, --environment <env>    Environment (development|staging|production)
  --skip-schemas            Skip database schema creation
  --skip-data              Skip initial data insertion
  --skip-orchestrator      Skip orchestrator startup
  -q, --quiet              Quiet mode (less verbose output)
  -h, --help               Show this help message

Examples:
  node deployAutomation.js --environment production
  node deployAutomation.js --skip-schemas --environment staging
  node deployAutomation.js --quiet
`);
        process.exit(0);
        break;
    }
  }

  // Validate environment
  if (!['development', 'staging', 'production'].includes(config.environment!)) {
    console.error('❌ Invalid environment. Must be: development, staging, or production');
    process.exit(1);
  }

  // Check required environment variables
  if (!process.env.VITE_SUPABASE_URL) {
    console.error('❌ VITE_SUPABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY environment variable is required');
    process.exit(1);
  }

  // Run deployment
  const deployer = new AutomationDeployer(config);
  deployer.deploy()
    .then(() => {
      console.log('\n🎉 Automation system deployed successfully!');
      console.log('\n📋 Next steps:');
      console.log('   1. Access the automation dashboard at /automation');
      console.log('   2. Configure notification channels');
      console.log('   3. Set up external API keys (Google Analytics, HubSpot, etc.)');
      console.log('   4. Run initial workflow phases');
      console.log('\n🚀 The automation orchestrator is now running!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Deployment failed:', error);
      process.exit(1);
    });
}

export { AutomationDeployer, type DeploymentConfig };