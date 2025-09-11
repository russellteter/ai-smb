#!/usr/bin/env tsx

/**
 * Environment Verification Script
 * Checks that all services are properly configured for production
 */

import chalk from 'chalk';

const API_URL = 'https://mothership-api.onrender.com';

interface HealthCheck {
  ok: boolean;
  services?: {
    database: { status: string; error?: string };
    redis: { status: string; error?: string };
    openai: { configured: boolean; warning?: string };
    google_maps: { configured: boolean; warning?: string };
  };
}

async function checkHealth(): Promise<HealthCheck> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return await response.json();
  } catch (error) {
    return { ok: false };
  }
}

async function testParsePrompt(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/parse_prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Dentists in San Francisco' }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error(chalk.red('❌ Parse prompt failed:'), data.error);
      if (data.issues) {
        console.error(chalk.red('   Issues:'), data.issues);
      }
      return false;
    }
    
    console.log(chalk.green('✅ Parse prompt successful'));
    console.log(chalk.gray('   DSL:'), JSON.stringify(data.dsl, null, 2));
    
    if (data.warnings && data.warnings.length > 0) {
      console.log(chalk.yellow('   ⚠️  Warnings:'), data.warnings);
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Parse prompt error:'), error);
    return false;
  }
}

async function checkJobHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/job_health`);
    const data = await response.json();
    
    if (data.status === 'error') {
      console.error(chalk.red('❌ Job health check failed:'), data.error);
      return false;
    }
    
    console.log(chalk.green('✅ Job queue healthy'));
    console.log(chalk.gray('   Queue counts:'), data.queue?.counts);
    console.log(chalk.gray('   Workers:'), data.queue?.workers);
    
    if (data.recommendations && data.recommendations.length > 0) {
      console.log(chalk.yellow('   ⚠️  Recommendations:'), data.recommendations);
    }
    
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Job health error:'), error);
    return false;
  }
}

async function main() {
  console.log(chalk.bold.blue('\n🚀 Mothership Leads Environment Verification\n'));
  console.log(chalk.gray(`API URL: ${API_URL}\n`));

  // Step 1: Check health
  console.log(chalk.bold('1. Checking API Health...'));
  const health = await checkHealth();
  
  if (!health.ok) {
    console.error(chalk.red('❌ API is not healthy or unreachable'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ API is healthy'));
  
  // Check individual services
  if (health.services) {
    console.log(chalk.bold('\n2. Service Status:'));
    
    // Database
    if (health.services.database.status === 'connected') {
      console.log(chalk.green('✅ Database: Connected'));
    } else {
      console.error(chalk.red('❌ Database:'), health.services.database.error || 'Not connected');
    }
    
    // Redis
    if (health.services.redis.status === 'connected') {
      console.log(chalk.green('✅ Redis: Connected'));
    } else {
      console.error(chalk.red('❌ Redis:'), health.services.redis.error || 'Not connected');
    }
    
    // OpenAI
    if (health.services.openai.configured) {
      console.log(chalk.green('✅ OpenAI API Key: Configured'));
    } else {
      console.log(chalk.yellow('⚠️  OpenAI API Key:'), health.services.openai.warning || 'Not configured');
    }
    
    // Google Maps
    if (health.services.google_maps.configured) {
      console.log(chalk.green('✅ Google Maps API Key: Configured'));
    } else {
      console.log(chalk.yellow('⚠️  Google Maps API Key:'), health.services.google_maps.warning || 'Not configured');
    }
  }

  // Step 2: Test parse_prompt
  console.log(chalk.bold('\n3. Testing Parse Prompt Endpoint...'));
  const parseSuccess = await testParsePrompt();

  // Step 3: Check job health
  console.log(chalk.bold('\n4. Checking Job Queue Health...'));
  const jobHealthSuccess = await checkJobHealth();

  // Summary
  console.log(chalk.bold('\n📊 Summary:'));
  
  const criticalIssues: string[] = [];
  const warnings: string[] = [];
  
  if (health.services) {
    if (health.services.database.status !== 'connected') {
      criticalIssues.push('Database not connected');
    }
    if (health.services.redis.status !== 'connected') {
      criticalIssues.push('Redis not connected');
    }
    if (!health.services.openai.configured) {
      warnings.push('OpenAI API key not configured - using fallback parsing');
    }
    if (!health.services.google_maps.configured) {
      warnings.push('Google Maps API key not configured - using mock data');
    }
  }
  
  if (!parseSuccess) {
    criticalIssues.push('Parse prompt endpoint not working');
  }
  
  if (!jobHealthSuccess) {
    warnings.push('Job queue health check failed');
  }

  if (criticalIssues.length > 0) {
    console.log(chalk.red('\n❌ Critical Issues:'));
    criticalIssues.forEach(issue => {
      console.log(chalk.red(`   - ${issue}`));
    });
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Warnings:'));
    warnings.forEach(warning => {
      console.log(chalk.yellow(`   - ${warning}`));
    });
  }

  if (criticalIssues.length === 0 && warnings.length === 0) {
    console.log(chalk.green('\n✅ All systems operational!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('1. Visit https://mothership-frontend.onrender.com'));
    console.log(chalk.gray('2. Try searching: "Dentists in Charleston, SC"'));
    console.log(chalk.gray('3. Watch real leads stream in!'));
  } else if (criticalIssues.length === 0) {
    console.log(chalk.yellow('\n⚠️  System operational with warnings'));
    console.log(chalk.gray('\nTo fix warnings:'));
    if (!health.services?.openai?.configured) {
      console.log(chalk.gray('1. Add OPENAI_API_KEY to Render API service environment'));
    }
    if (!health.services?.google_maps?.configured) {
      console.log(chalk.gray('2. Add GOOGLE_MAPS_API_KEY to Render Workers service environment'));
    }
  } else {
    console.log(chalk.red('\n❌ System not operational - fix critical issues first'));
    process.exit(1);
  }

  console.log(chalk.gray('\n---\n'));
}

main().catch(console.error);