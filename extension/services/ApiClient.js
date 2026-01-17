import { get } from '../core/storage.js';
import { getBackendUrl } from '../config.js';
import { info, error as logError } from '../core/logger.js';

/**
 * ApiClient - Handles all backend API calls
 */
export class ApiClient {
  constructor() {
    this.baseUrl = null;
    this.authToken = null;
  }

  /**
   * Initialize client (load config)
   */
  async init() {
    this.baseUrl = await getBackendUrl();
    this.authToken = await get('authToken');
    info('ApiClient initialized:', this.baseUrl);
  }

  /**
   * Save job to backend
   */
  async saveJob(jobData) {
    if (!this.baseUrl || !this.authToken) {
      await this.init();
    }

    if (!this.authToken) {
      throw new Error('Not authenticated');
    }

    info('Saving job to backend:', jobData.jobTitle);

    const response = await fetch(`${this.baseUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify({
        companyName: jobData.companyName,
        jobTitle: jobData.jobTitle,
        location: jobData.location,
        description: jobData.description,
        jobUrl: jobData.jobUrl,
        platform: jobData.platform || 'linkedin',
        appliedAt: jobData.appliedAt
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    info('Job saved successfully:', result);
    return result;
  }

  /**
   * Get jobs (for dashboard)
   */
  async getJobs(page = 1, limit = 10) {
    if (!this.baseUrl || !this.authToken) {
      await this.init();
    }

    const response = await fetch(
      `${this.baseUrl}/api/jobs?page=${page}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Update job status
   */
  async updateJob(id, data) {
    if (!this.baseUrl || !this.authToken) {
      await this.init();
    }

    const response = await fetch(`${this.baseUrl}/api/jobs/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  }
}
