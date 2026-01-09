/**
 * Chrome Storage Wrapper
 * Provides promise-based interface for chrome.storage operations
 */

/**
 * Get value from chrome.storage.sync
 * @param {string|string[]} key - Key or array of keys
 * @returns {Promise<any>}
 */
export async function get(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(typeof key === 'string' ? result[key] : result);
      }
    });
  });
}

/**
 * Set value in chrome.storage.sync
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function set(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Remove value from chrome.storage.sync
 * @param {string|string[]} key
 * @returns {Promise<void>}
 */
export async function remove(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get value from chrome.storage.local
 * @param {string|string[]} key
 * @returns {Promise<any>}
 */
export async function getLocal(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(typeof key === 'string' ? result[key] : result);
      }
    });
  });
}

/**
 * Set value in chrome.storage.local
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export async function setLocal(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Remove value from chrome.storage.local
 * @param {string|string[]} key
 * @returns {Promise<void>}
 */
export async function removeLocal(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// ===== Job-specific helpers =====

/**
 * Get pending jobs from local storage
 * @returns {Promise<Array>}
 */
export async function getPendingJobs() {
  const result = await getLocal('pendingJobs');
  return result || [];
}

/**
 * Add a job to pending jobs
 * @param {Object} job
 * @returns {Promise<void>}
 */
export async function addPendingJob(job) {
  const jobs = await getPendingJobs();
  jobs.push(job);
  await setLocal('pendingJobs', jobs);
}

/**
 * Remove a job from pending jobs
 * @param {string} jobId
 * @returns {Promise<void>}
 */
export async function removePendingJob(jobId) {
  const jobs = await getPendingJobs();
  const updated = jobs.filter(j => j.id !== jobId);
  await setLocal('pendingJobs', updated);
}

/**
 * Clear all pending jobs
 * @returns {Promise<void>}
 */
export async function clearPendingJobs() {
  await removeLocal('pendingJobs');
}
