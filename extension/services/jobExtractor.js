/**
 * Job Extractor Service
 * Coordinates job extraction across platforms
 * Detects current platform and delegates to appropriate implementation
 */

import { LinkedInPlatform } from '../platforms/LinkedInPlatform.js';
import { NaukriPlatform } from '../platforms/NaukriPlatform.js';
import { info, error as logError } from '../core/logger.js';

/**
 * Get the current platform based on URL
 * @returns {LinkedInPlatform|NaukriPlatform|null}
 */
export function getCurrentPlatform() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('linkedin.com')) {
    info('Detected platform: LinkedIn');
    return new LinkedInPlatform();
  }
  
  if (hostname.includes('naukri.com')) {
    info('Detected platform: Naukri');
    return new NaukriPlatform();
  }
  
  logError('Unknown platform:', hostname);
  return null;
}

/**
 * Extract job details using the detected platform
 * @returns {Object|null} Job data or null if extraction fails
 */
export function extractJob() {
  const platform = getCurrentPlatform();
  
  if (!platform) {
    logError('Cannot extract job: platform not supported');
    return null;
  }
  
  try {
    const jobData = platform.extractJobDetails();
    
    if (!jobData) {
      logError('Job extraction returned null');
      return null;
    }
    
    info('Job extracted successfully', {
      title: jobData.jobTitle,
      company: jobData.companyName
    });
    
    return jobData;
  } catch (error) {
    logError('Failed to extract job:', error);
    return null;
  }
}

/**
 * Detect apply button type using the detected platform
 * @param {HTMLElement} button - The button element that was clicked
 * @returns {string|null} Apply type ('EASY_APPLY', 'EXTERNAL_APPLY', 'DIRECT_APPLY') or null
 */
export function detectApplyType(button) {
  const platform = getCurrentPlatform();
  
  if (!platform) {
    logError('Cannot detect apply type: platform not supported');
    return null;
  }
  
  try {
    const applyType = platform.detectApplyButton(button);
    
    if (applyType) {
      info(`Detected apply type: ${applyType}`);
    }
    
    return applyType;
  } catch (error) {
    logError('Failed to detect apply type:', error);
    return null;
  }
}

/**
 * Check if current page is a supported platform
 * @returns {boolean}
 */
export function isSupportedPlatform() {
  const hostname = window.location.hostname;
  return hostname.includes('linkedin.com') || hostname.includes('naukri.com');
}

/**
 * Get platform name
 * @returns {string|null} Platform name ('linkedin', 'naukri') or null
 */
export function getPlatformName() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('linkedin.com')) {
    return 'linkedin';
  }
  
  if (hostname.includes('naukri.com')) {
    return 'naukri';
  }
  
  return null;
}
