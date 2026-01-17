import { sendMessage } from '../core/messaging.js';
import { getPendingJobs, removePendingJob } from '../core/storage.js';
import { info, error as logError } from '../core/logger.js';
import { showPageNotification } from './notifications.js';

/**
 * Show final confirmation modal when user returns
 */
export function showConfirmationModal(jobData) {
  // Remove existing modal if any
  const existing = document.getElementById("jobtracker-modal");
  if (existing) existing.remove();

  // Create modal overlay
  const modal = document.createElement("div");
  modal.id = "jobtracker-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.3s ease-out;
    ">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h2 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">
          Did you complete your application?
        </h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">
          Confirm to save this to your dashboard
        </p>
      </div>

      <div style="
        background: #f3f4f6;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
      ">
        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">COMPANY</div>
          <div style="font-size: 16px; font-weight: 600; color: #111827;">${jobData.companyName}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">POSITION</div>
          <div style="font-size: 16px; font-weight: 500; color: #111827;">${jobData.jobTitle}</div>
        </div>
        ${jobData.location ? `
        <div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">LOCATION</div>
          <div style="font-size: 14px; color: #111827;">${jobData.location}</div>
        </div>
        ` : ''}
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="jobtracker-confirm-yes" style="
          flex: 1;
          padding: 14px 24px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">
          Yes, I applied
        </button>
        <button id="jobtracker-confirm-no" style="
          flex: 1;
          padding: 14px 24px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        ">
          No, I didn't
        </button>
      </div>
    </div>
  `;

  // Add animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    #jobtracker-confirm-yes:hover {
      background: #1d4ed8 !important;
    }
    #jobtracker-confirm-no:hover {
      background: #e5e7eb !important;
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(modal);

  // Handle Yes button
  document.getElementById("jobtracker-confirm-yes").addEventListener("click", async () => {
    const btn = document.getElementById("jobtracker-confirm-yes");
    btn.textContent = "Saving...";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    try {
      const response = await sendMessage('JOB_APPLICATION', jobData);

      if (response?.success) {
        showPageNotification("✅ Job tracked successfully!", "success");
        await removePendingJob(jobData.id);
        
        // Update badge
        const remaining = await getPendingJobs();
        await sendMessage('UPDATE_BADGE', { count: remaining.length });
      } else {
        showPageNotification("❌ Failed to track job: " + (response?.error || "Unknown error"), "error");
      }
      modal.remove();
    } catch (error) {
      logError("Failed to send message:", error);
      showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
      modal.remove();
    }
  });

  // Handle No button
  document.getElementById("jobtracker-confirm-no").addEventListener("click", async () => {
    try {
      await removePendingJob(jobData.id);
      
      // Update badge
      const remaining = await getPendingJobs();
      await sendMessage('UPDATE_BADGE', { count: remaining.length });
      
      showPageNotification("Application not tracked", "error");
      modal.remove();
    } catch (error) {
      logError("Failed to remove job:", error);
      showPageNotification("⚠️ Extension updated - Please reload this page (F5)", "error");
      modal.remove();
    }
  });

  // Close on overlay click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}
