import { BasePlatform } from './BasePlatforms.js';

export class NaukriPlatform extends BasePlatform {
  constructor() {
    super('Naukri');
  }

  /**
   * Extract job details from Naukri page
   */
  extractJobDetails() {
    return this.trySelectors([
      () => this._extractV1(),
      () => this._extractV2(),
      () => this._extractFallback()
    ]);
  }

  /**
   * Detect apply button type on Naukri
   */
  detectApplyButton(button) {
    const text = button.innerText?.toLowerCase().trim() || '';
    const classes = button.className || '';
    const id = button.id || '';

    // External Apply (company site)
    if (
      text === 'apply on company site' ||
      text.includes('company site') ||
      classes.includes('company-site-button') ||
      id === 'company-site-button'
    ) {
      return 'EXTERNAL_APPLY';
    }

    // Direct Apply (on Naukri)
    if (
      text === 'apply' ||
      text === 'apply now' ||
      (text.includes('apply') && !text.includes('company site')) ||
      classes.includes('apply-button') ||
      id.includes('apply')
    ) {
      return 'DIRECT_APPLY';
    }

    return null;
  }

  // Private extraction methods

  /**
   * Primary extraction strategy (current Naukri layout)
   */
  _extractV1() {
    const jobTitle = this.querySelector([
      'h1',
      '[class*="title"]'
    ])?.innerText;

    // Get company name and remove "X.X Reviews" pattern
    const companyEl = this.querySelector([
      '[class="styles_jd-header-comp-name__MvqAI"]',
      '[class*="comp-name"]',
      '[class*="company"]'
    ]);
    
    let company = companyEl?.innerText;
    if (company) {
      company = company.replace(/\d+\.?\d*\s*Reviews?/gi, '').trim();
    }

    const location = this.querySelector([
      '[class="styles_jhc__location__W_pVs"]',
      '.loc-wrap',
      '.location',
      '[class*="location"]'
    ])?.innerText;

    const description = this.querySelector([
      '[class*="jd-"]',
      '.dang-inner-html',
      '.job-description',
      '[class*="description"]'
    ])?.innerText?.slice(0, 5000);

    if (!jobTitle || !company) return null;

    return {
      jobTitle: this.cleanText(jobTitle),
      companyName: this.cleanText(company),
      location: this.cleanText(location),
      description: this.cleanText(description),
      jobUrl: window.location.href,
      appliedAt: new Date().toISOString()
    };
  }

  /**
   * Alternative extraction strategy
   */
  _extractV2() {
    const jobTitle = document.querySelector('h1')?.innerText;
    const company = document.querySelector('[class*="company"]')?.innerText;
    const location = document.querySelector('[class*="location"]')?.innerText;
    const description = document.querySelector('[class*="description"]')?.innerText?.slice(0, 5000);

    if (!jobTitle || !company) return null;

    return {
      jobTitle: this.cleanText(jobTitle),
      companyName: this.cleanText(company),
      location: this.cleanText(location),
      description: this.cleanText(description),
      jobUrl: window.location.href,
      appliedAt: new Date().toISOString()
    };
  }

  /**
   * Fallback extraction strategy
   */
  _extractFallback() {
    const jobTitle = document.querySelector('h1')?.innerText;
    const company = document.querySelector('[class*="comp"]')?.innerText;

    if (!jobTitle || !company) return null;

    return {
      jobTitle: this.cleanText(jobTitle),
      companyName: this.cleanText(company),
      location: '',
      description: '',
      jobUrl: window.location.href,
      appliedAt: new Date().toISOString()
    };
  }
}
