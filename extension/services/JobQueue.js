import { getLocal, setLocal } from '../core/storage.js';
import { info, error as logError } from '../core/logger.js';

/**
 * JobQueue - Manages job queue with retry logic
 */
export class JobQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.failedJobsKey = 'failedJobs';
  }

  /**
   * Add job to queue
   */
  async add(job) {
    this.queue.push(job);
    info('Job added to queue:', job.jobTitle);
    
    // Start processing if not already processing
    if (!this.processing) {
      await this.process();
    }
  }

  /**
   * Process queue
   */
  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      
      try {
        info(`Processing job: ${job.jobTitle}`);
        await this._sendJob(job);
        info(`✅ Job processed successfully: ${job.jobTitle}`);
      } catch (error) {
        logError(`Failed to process job: ${job.jobTitle}`, error);
        await this._saveFailed(job, error.message);
      }
      
      // Small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.processing = false;
  }

  /**
   * Retry failed jobs
   */
  async retryFailed() {
    const failedJobs = await this._loadFailed();
    
    if (failedJobs.length === 0) {
      info('No failed jobs to retry');
      return;
    }
    
    info(`Retrying ${failedJobs.length} failed jobs`);
    
    for (const job of failedJobs) {
      await this.add(job.data);
    }
    
    // Clear failed jobs after adding to queue
    await this._clearFailed();
  }

  /**
   * Get failed jobs count
   */
  async getFailedCount() {
    const failedJobs = await this._loadFailed();
    return failedJobs.length;
  }

  /**
   * Send job (to be implemented by subclass or injected)
   */
  async _sendJob(job) {
    throw new Error('_sendJob must be implemented');
  }

  /**
   * Save failed job to storage
   */
  async _saveFailed(job, errorMessage) {
    const failedJobs = await this._loadFailed();
    
    failedJobs.push({
      data: job,
      error: errorMessage,
      timestamp: Date.now(),
      retryCount: (job.retryCount || 0) + 1
    });
    
    await setLocal(this.failedJobsKey, failedJobs);
    info(`Saved failed job: ${job.jobTitle}`);
  }

  /**
   * Load failed jobs from storage
   */
  async _loadFailed() {
    const failedJobs = await getLocal(this.failedJobsKey);
    return failedJobs || [];
  }

  /**
   * Clear failed jobs
   */
  async _clearFailed() {
    await setLocal(this.failedJobsKey, []);
  }
}
