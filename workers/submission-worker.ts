#!/usr/bin/env node
/**
 * Submission Worker
 * Processes code execution jobs from the queue
 * 
 * This worker is already handled by SubmissionQueueService,
 * but this script ensures the queue is actively processing.
 */

import SubmissionQueueService from '../lib/battle-arena/submission-queue';

async function runSubmissionWorker() {
  console.log('Submission worker started');
  console.log('Processing jobs from Bull queue...');
  
  // The queue is already set up with processors in SubmissionQueueService
  // Just keep the process alive and log stats periodically
  
  setInterval(async () => {
    try {
      const stats = await SubmissionQueueService.getStats();
      console.log('Queue stats:', stats);
      
      if (stats.failed > 0) {
        console.warn(`Warning: ${stats.failed} failed jobs in queue`);
      }
      
      if (stats.waiting > 100) {
        console.warn(`Warning: ${stats.waiting} jobs waiting (high queue depth)`);
      }
    } catch (error) {
      console.error('Error getting queue stats:', error);
    }
  }, 10000); // Log every 10 seconds
  
  // Clean old jobs once per hour
  setInterval(async () => {
    try {
      await SubmissionQueueService.clean(86400000); // 24 hours
      console.log('Cleaned old completed and failed jobs');
    } catch (error) {
      console.error('Error cleaning old jobs:', error);
    }
  }, 3600000); // 1 hour
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Submission worker shutting down...');
  await SubmissionQueueService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Submission worker shutting down...');
  await SubmissionQueueService.close();
  process.exit(0);
});

// Start worker
runSubmissionWorker().catch(console.error);
