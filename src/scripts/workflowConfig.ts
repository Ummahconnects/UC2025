#!/usr/bin/env node

/**
 * Workflow Configuration Manager for Ummah-Connects
 * 
 * This script allows you to view and modify the automated workflow configuration.
 * 
 * Usage:
 *   npm run workflow:config                    - View current configuration
 *   npm run workflow:config -- --set key=value - Set configuration value
 *   npm run workflow:config -- --reset         - Reset to default configuration
 *   npm run workflow:config -- --export        - Export configuration to file
 *   npm run workflow:config -- --import file   - Import configuration from file
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import type { WorkflowConfig } from './automatedWorkflow.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CONFIG_FILE = path.join(__dirname, '../../config/workflow.json')

// Default configuration
const DEFAULT_CONFIG: WorkflowConfig = {
  phases: {
    phase1: { 
      enabled: true, 
      schedule: '0 2 * * *', // Daily at 2 AM
      timeout: 30, 
      retries: 3 
    },
    phase2: { 
      enabled: true, 
      schedule: '0 3 * * *', // Daily at 3 AM
      timeout: 45, 
      retries: 2 
    },
    phase3: { 
      enabled: true, 
      schedule: '0 4 * * 1', // Weekly on Monday at 4 AM
      timeout: 60, 
      retries: 2 
    },
    phase4: { 
      enabled: true, 
      schedule: '0 5 * * *', // Daily at 5 AM
      timeout: 30, 
      retries: 3 
    },
    phase5: { 
      enabled: true, 
      schedule: '0 6 * * *', // Daily at 6 AM
      timeout: 20, 
      retries: 2 
    },
    monitor: { 
      enabled: true, 
      schedule: '*/15 * * * *', // Every 15 minutes
      timeout: 10, 
      retries: 1 
    }
  },
  notifications: {
    email: ['admin@www.ummah-connects.com'],
    slack: process.env.SLACK_WEBHOOK_URL,
    webhook: process.env.WORKFLOW_WEBHOOK_URL
  },
  thresholds: {
    performanceScore: 90,
    seoScore: 85,
    conversionRate: 15,
    uptimePercentage: 99.5
  }
}

class WorkflowConfigManager {
  private configPath: string

  constructor(configPath: string = CONFIG_FILE) {
    this.configPath = configPath
  }

  // Load configuration from file
  async loadConfig(): Promise<WorkflowConfig> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8')
      const config = JSON.parse(configData) as WorkflowConfig
      
      // Merge with defaults to ensure all properties exist
      return this.mergeWithDefaults(config)
    } catch (error) {
      console.log('📝 No existing configuration found, using defaults')
      return DEFAULT_CONFIG
    }
  }

  // Save configuration to file
  async saveConfig(config: WorkflowConfig): Promise<void> {
    try {
      // Ensure config directory exists
      await fs.mkdir(path.dirname(this.configPath), { recursive: true })
      
      // Save configuration with pretty formatting
      await fs.writeFile(
        this.configPath, 
        JSON.stringify(config, null, 2),
        'utf-8'
      )
      
      console.log(`✅ Configuration saved to ${this.configPath}`)
    } catch (error) {
      console.error(`❌ Failed to save configuration: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // Merge configuration with defaults
  private mergeWithDefaults(config: Partial<WorkflowConfig>): WorkflowConfig {
    return {
      phases: { ...DEFAULT_CONFIG.phases, ...config.phases },
      notifications: { ...DEFAULT_CONFIG.notifications, ...config.notifications },
      thresholds: { ...DEFAULT_CONFIG.thresholds, ...config.thresholds }
    }
  }

  // Set a configuration value using dot notation
  async setConfigValue(key: string, value: any): Promise<void> {
    const config = await this.loadConfig()
    
    // Parse the key path (e.g., "phases.phase1.enabled")
    const keyParts = key.split('.')
    let current: any = config
    
    // Navigate to the parent object
    for (let i = 0; i < keyParts.length - 1; i++) {
      const part = keyParts[i]
      if (!(part in current)) {
        current[part] = {}
      }
      current = current[part]
    }
    
    // Set the value
    const finalKey = keyParts[keyParts.length - 1]
    
    // Parse value based on type
    if (value === 'true') {
      current[finalKey] = true
    } else if (value === 'false') {
      current[finalKey] = false
    } else if (!isNaN(Number(value))) {
      current[finalKey] = Number(value)
    } else {
      current[finalKey] = value
    }
    
    await this.saveConfig(config)
    console.log(`✅ Set ${key} = ${current[finalKey]}`)
  }

  // Get a configuration value using dot notation
  async getConfigValue(key: string): Promise<any> {
    const config = await this.loadConfig()
    
    const keyParts = key.split('.')
    let current: any = config
    
    for (const part of keyParts) {
      if (!(part in current)) {
        return undefined
      }
      current = current[part]
    }
    
    return current
  }

  // Display configuration in a readable format
  async displayConfig(): Promise<void> {
    const config = await this.loadConfig()
    
    console.log('\n🔧 Ummah-Connects Workflow Configuration\n')
    
    // Display phases
    console.log('📅 Phases:')
    Object.entries(config.phases).forEach(([phase, settings]) => {
      console.log(`  ${phase}:`)
      console.log(`    Enabled: ${settings.enabled ? '✅' : '❌'}`)
      console.log(`    Schedule: ${settings.schedule}`)
      console.log(`    Timeout: ${settings.timeout} minutes`)
      console.log(`    Retries: ${settings.retries}`)
      console.log()
    })
    
    // Display notifications
    console.log('📧 Notifications:')
    console.log(`  Email: ${config.notifications.email.join(', ')}`)
    console.log(`  Slack: ${config.notifications.slack || 'Not configured'}`)
    console.log(`  Webhook: ${config.notifications.webhook || 'Not configured'}`)
    console.log()
    
    // Display thresholds
    console.log('🎯 Thresholds:')
    console.log(`  Performance Score: ${config.thresholds.performanceScore}`)
    console.log(`  SEO Score: ${config.thresholds.seoScore}`)
    console.log(`  Conversion Rate: ${config.thresholds.conversionRate}%`)
    console.log(`  Uptime Percentage: ${config.thresholds.uptimePercentage}%`)
    console.log()
  }

  // Reset configuration to defaults
  async resetConfig(): Promise<void> {
    await this.saveConfig(DEFAULT_CONFIG)
    console.log('🔄 Configuration reset to defaults')
  }

  // Export configuration to a file
  async exportConfig(filePath: string): Promise<void> {
    const config = await this.loadConfig()
    
    try {
      await fs.writeFile(
        filePath,
        JSON.stringify(config, null, 2),
        'utf-8'
      )
      console.log(`📤 Configuration exported to ${filePath}`)
    } catch (error) {
      console.error(`❌ Failed to export configuration: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // Import configuration from a file
  async importConfig(filePath: string): Promise<void> {
    try {
      const configData = await fs.readFile(filePath, 'utf-8')
      const config = JSON.parse(configData) as WorkflowConfig
      
      // Validate configuration
      const mergedConfig = this.mergeWithDefaults(config)
      
      await this.saveConfig(mergedConfig)
      console.log(`📥 Configuration imported from ${filePath}`)
    } catch (error) {
      console.error(`❌ Failed to import configuration: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  // Validate cron expression
  private validateCronExpression(expression: string): boolean {
    // Basic cron validation (5 or 6 parts)
    const parts = expression.trim().split(/\s+/)
    return parts.length === 5 || parts.length === 6
  }

  // Get schedule description
  getScheduleDescription(cronExpression: string): string {
    const scheduleDescriptions: Record<string, string> = {
      '0 2 * * *': 'Daily at 2:00 AM',
      '0 3 * * *': 'Daily at 3:00 AM',
      '0 4 * * 1': 'Weekly on Monday at 4:00 AM',
      '0 5 * * *': 'Daily at 5:00 AM',
      '0 6 * * *': 'Daily at 6:00 AM',
      '*/15 * * * *': 'Every 15 minutes',
      '*/30 * * * *': 'Every 30 minutes',
      '0 */6 * * *': 'Every 6 hours',
      '0 0 * * *': 'Daily at midnight',
      '0 12 * * *': 'Daily at noon',
      '0 0 * * 0': 'Weekly on Sunday at midnight',
      '0 0 1 * *': 'Monthly on the 1st at midnight'
    }
    
    return scheduleDescriptions[cronExpression] || cronExpression
  }

  // Interactive configuration wizard
  async configWizard(): Promise<void> {
    console.log('\n🧙‍♂️ Workflow Configuration Wizard\n')
    
    const config = await this.loadConfig()
    
    // This would be implemented with a proper CLI library like inquirer
    // For now, we'll show what the wizard would configure
    
    console.log('The configuration wizard would help you set up:')
    console.log('1. 📅 Phase schedules and timeouts')
    console.log('2. 📧 Notification settings')
    console.log('3. 🎯 Performance thresholds')
    console.log('4. 🔧 Advanced options')
    console.log()
    console.log('Use the --set flag to modify individual settings:')
    console.log('  npm run workflow:config -- --set phases.phase1.enabled=false')
    console.log('  npm run workflow:config -- --set thresholds.performanceScore=95')
    console.log('  npm run workflow:config -- --set notifications.email="admin@example.com,dev@example.com"')
    console.log()
  }

  // Generate cron job entries
  async generateCronJobs(): Promise<void> {
    const config = await this.loadConfig()
    
    console.log('\n⏰ Cron Job Entries for Automated Workflow\n')
    console.log('Add these entries to your crontab (crontab -e):\n')
    
    Object.entries(config.phases).forEach(([phase, settings]) => {
      if (settings.enabled) {
        const command = `cd ${process.cwd()} && npm run workflow:${phase}`
        console.log(`# ${phase.charAt(0).toUpperCase() + phase.slice(1)} - ${this.getScheduleDescription(settings.schedule)}`)
        console.log(`${settings.schedule} ${command}`)
        console.log()
      }
    })
    
    console.log('For Windows Task Scheduler, use:')
    console.log('schtasks /create /tn "Ummah-Connects Workflow" /tr "npm run workflow:all" /sc daily /st 02:00')
    console.log()
  }
}

// CLI interface
const argv = yargs(hideBin(process.argv))
  .option('set', {
    type: 'string',
    description: 'Set configuration value (key=value)'
  })
  .option('get', {
    type: 'string',
    description: 'Get configuration value by key'
  })
  .option('reset', {
    type: 'boolean',
    description: 'Reset configuration to defaults'
  })
  .option('export', {
    type: 'string',
    description: 'Export configuration to file'
  })
  .option('import', {
    type: 'string',
    description: 'Import configuration from file'
  })
  .option('wizard', {
    type: 'boolean',
    description: 'Run configuration wizard'
  })
  .option('cron', {
    type: 'boolean',
    description: 'Generate cron job entries'
  })
  .help()
  .parseSync()

// Main execution
async function main() {
  const configManager = new WorkflowConfigManager()
  
  try {
    if (argv.set) {
      const [key, value] = argv.set.split('=')
      if (!key || value === undefined) {
        console.error('❌ Invalid format. Use: key=value')
        process.exit(1)
      }
      await configManager.setConfigValue(key, value)
    } else if (argv.get) {
      const value = await configManager.getConfigValue(argv.get)
      console.log(`${argv.get} = ${JSON.stringify(value, null, 2)}`)
    } else if (argv.reset) {
      await configManager.resetConfig()
    } else if (argv.export) {
      await configManager.exportConfig(argv.export)
    } else if (argv.import) {
      await configManager.importConfig(argv.import)
    } else if (argv.wizard) {
      await configManager.configWizard()
    } else if (argv.cron) {
      await configManager.generateCronJobs()
    } else {
      // Default: display current configuration
      await configManager.displayConfig()
    }
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { WorkflowConfigManager, DEFAULT_CONFIG }
export default WorkflowConfigManager