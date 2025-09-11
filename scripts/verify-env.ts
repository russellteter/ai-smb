#!/usr/bin/env tsx
/**
 * Environment Variable Verification Script
 * Run this to check if all required environment variables are configured
 */

import { config } from 'dotenv';
import { Client } from 'pg';
import IORedis from 'ioredis';
import OpenAI from 'openai';
import chalk from 'chalk';

// Load environment variables
config();

interface CheckResult {
  name: string;
  required: boolean;
  present: boolean;
  valid?: boolean;
  error?: string;
}

const checks: CheckResult[] = [];

// Check environment variables
function checkEnvVar(name: string, required: boolean = true): boolean {
  const value = process.env[name];
  const present = !!value;
  checks.push({ name, required, present });
  return present;
}

async function verifyDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    // Check if tables exist
    const result = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableCount = parseInt(result.rows[0].count);
    if (tableCount === 0) {
      checks.push({ 
        name: 'Database Tables', 
        required: true, 
        present: false, 
        error: 'No tables found - run migrations' 
      });
      await client.end();
      return false;
    }
    
    await client.end();
    checks.push({ name: 'Database Connection', required: true, present: true, valid: true });
    return true;
  } catch (err: any) {
    checks.push({ 
      name: 'Database Connection', 
      required: true, 
      present: false, 
      error: err.message 
    });
    return false;
  }
}

async function verifyRedis(): Promise<boolean> {
  if (!process.env.REDIS_URL) return false;
  
  try {
    const redis = new IORedis(process.env.REDIS_URL);
    await redis.ping();
    await redis.quit();
    checks.push({ name: 'Redis Connection', required: true, present: true, valid: true });
    return true;
  } catch (err: any) {
    checks.push({ 
      name: 'Redis Connection', 
      required: true, 
      present: false, 
      error: err.message 
    });
    return false;
  }
}

async function verifyOpenAI(): Promise<boolean> {
  if (!process.env.OPENAI_API_KEY) return false;
  
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Simple validation check
    const response = await client.models.list();
    checks.push({ name: 'OpenAI API', required: false, present: true, valid: true });
    return true;
  } catch (err: any) {
    checks.push({ 
      name: 'OpenAI API', 
      required: false, 
      present: true, 
      valid: false,
      error: 'Invalid API key' 
    });
    return false;
  }
}

async function main() {
  console.log(chalk.bold.blue('\n🔍 Mothership Leads - Environment Verification\n'));
  
  // Check required environment variables
  console.log(chalk.bold('Checking Environment Variables...'));
  
  const service = process.env.SERVICE_NAME || 'api';
  
  if (service === 'api' || service === 'all') {
    checkEnvVar('DATABASE_URL');
    checkEnvVar('REDIS_URL');
    checkEnvVar('OPENAI_API_KEY', false); // Not required but recommended
    checkEnvVar('GOOGLE_MAPS_API_KEY', false);
  }
  
  if (service === 'frontend' || service === 'all') {
    checkEnvVar('API_URL');
  }
  
  if (service === 'workers' || service === 'all') {
    checkEnvVar('DATABASE_URL');
    checkEnvVar('REDIS_URL');
    checkEnvVar('GOOGLE_MAPS_API_KEY', false);
  }
  
  // Verify connections
  console.log(chalk.bold('\nVerifying Service Connections...'));
  
  if (process.env.DATABASE_URL) {
    await verifyDatabase();
  }
  
  if (process.env.REDIS_URL) {
    await verifyRedis();
  }
  
  if (process.env.OPENAI_API_KEY) {
    await verifyOpenAI();
  }
  
  // Print results
  console.log(chalk.bold('\n📊 Verification Results:\n'));
  
  let hasErrors = false;
  let hasWarnings = false;
  
  for (const check of checks) {
    const icon = check.present && check.valid !== false ? '✅' : check.required ? '❌' : '⚠️';
    const status = check.present ? 
      (check.valid === false ? chalk.red('Invalid') : chalk.green('OK')) : 
      (check.required ? chalk.red('Missing') : chalk.yellow('Not Set'));
    
    console.log(`${icon} ${check.name.padEnd(25)} ${status}`);
    
    if (check.error) {
      console.log(chalk.gray(`   └─ ${check.error}`));
    }
    
    if (!check.present && check.required) hasErrors = true;
    if (!check.present && !check.required) hasWarnings = true;
    if (check.valid === false) hasErrors = true;
  }
  
  // Summary
  console.log(chalk.bold('\n📝 Summary:'));
  
  if (hasErrors) {
    console.log(chalk.red('❌ Critical issues found - some services will not work properly'));
    console.log(chalk.gray('\nFor Render deployment, add missing variables in the dashboard:'));
    console.log(chalk.gray('1. Go to your service settings in Render'));
    console.log(chalk.gray('2. Add environment variables in the Environment section'));
    console.log(chalk.gray('3. Restart the service after adding variables'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(chalk.yellow('⚠️  Some optional features may be limited'));
    console.log(chalk.gray('Add missing API keys for full functionality'));
  } else {
    console.log(chalk.green('✅ All environment variables configured correctly!'));
  }
  
  // Render-specific instructions
  if (process.env.RENDER) {
    console.log(chalk.bold.blue('\n🚀 Render Deployment Instructions:'));
    console.log(chalk.gray('1. OPENAI_API_KEY and GOOGLE_MAPS_API_KEY must be added manually'));
    console.log(chalk.gray('2. DATABASE_URL and REDIS_URL are auto-connected from services'));
    console.log(chalk.gray('3. Run the migration job after database is created'));
  }
}

main().catch(console.error);