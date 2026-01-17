import { BasePlatform } from './BasePlatforms.js';

export class LinkedInPlatform extends BasePlatform {
  constructor() {
    super('LinkedIn');
  }

  /**
   * Extract job details from LinkedIn page
   */
  extractJobDetails() {
    return this.trySelectors([
      () => this._extractV1(),
      () => this._extractV2(),
      () => this._extractFallback()
    ]);
  }

  /**
   * Detect apply button type on LinkedIn
   */
  detectApplyButton(button) {
    const text = button.innerText?.toLowerCase().trim() || '';
    const aria = button.getAttribute('aria-label')?.toLowerCase() || '';
    const classes = button.className || '';

    // Easy Apply
    if (
      text.includes('easy apply') ||
      aria.includes('easy apply') ||
      (classes.includes('jobs-apply-button') && text === 'easy apply')
    ) {
      return 'EASY_APPLY';
    }

    // Submit button (final step of Easy Apply)
    if (
      text.includes('submit application') ||
      aria.includes('submit application') ||
      text === 'submit' ||
      text === 'submit application'
    ) {
      return 'SUBMIT';
    }

    // External Apply
    if (
      (text === 'apply' ||
        text === 'apply now' ||
        text.startsWith('apply') ||
        aria.includes('apply to') ||
        (classes.includes('jobs-apply-button') && !text.includes('easy'))) &&
      !text.includes('easy apply') &&
      !aria.includes('easy apply') &&
      !text.includes('submit')
    ) {
      return 'EXTERNAL_APPLY';
    }

    return null;
  }

  // Private extraction methods

  /**
   * Primary extraction strategy (current LinkedIn layout)
   */
  _extractV1() {
    const jobTitle = this.querySelector([
      'h1.t-24.t-bold',
      'h1.job-title',
      '.job-details-jobs-unified-top-card__job-title'
    ])?.innerText;

    const company = this.querySelector([
      '.job-details-jobs-unified-top-card__company-name a',
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name'
    ])?.innerText;

    const locationEl = this.querySelector([
      'span[dir="ltr"] span.tvm__text--low-emphasis',
      '.job-details-jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__bullet'
    ]);

    const location = locationEl?.innerText.split('·')[0];

    const description = this.querySelector([
      '.jobs-description-content__text',
      '.jobs-description__content',
      '.jobs-box__html-content'
    ])?.innerText.slice(0, 5000);

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
    const company = document.querySelector('a[href*="company"]')?.innerText;

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
