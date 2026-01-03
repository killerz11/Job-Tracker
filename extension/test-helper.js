// =====================================
// Naukri Selector Testing Helper
// =====================================
// 
// HOW TO USE:
// 1. Open a Naukri job page
// 2. Open DevTools Console (F12)
// 3. Copy and paste this entire script
// 4. It will show you what selectors work
//
// =====================================

console.log("🔍 Testing Naukri Selectors...\n");

// Test Job Title
const titleSelectors = [
  ".jd-header-title",
  ".title",
  ".job-title",
  "h1",
  '[class*="title"]'
];

console.log("📌 JOB TITLE:");
titleSelectors.forEach(selector => {
  const el = document.querySelector(selector);
  if (el && el.innerText.trim()) {
    console.log(`✅ ${selector} → "${el.innerText.trim().substring(0, 50)}"`);
  }
});

// Test Company Name
const companySelectors = [
  ".comp-name a",
  ".companyInfo a",
  ".comp-name",
  ".companyInfo",
  '[class*="company"] a',
  '[class*="company"]'
];

console.log("\n🏢 COMPANY NAME:");
companySelectors.forEach(selector => {
  const el = document.querySelector(selector);
  if (el && el.innerText.trim()) {
    console.log(`✅ ${selector} → "${el.innerText.trim()}"`);
  }
});

// Test Location
const locationSelectors = [
  ".loc-wrap",
  ".location",
  ".job-location",
  '[class*="location"]',
  '[class*="loc"]'
];

console.log("\n📍 LOCATION:");
locationSelectors.forEach(selector => {
  const el = document.querySelector(selector);
  if (el && el.innerText.trim() && el.innerText.length < 100) {
    console.log(`✅ ${selector} → "${el.innerText.trim()}"`);
  }
});

// Test Description
const descSelectors = [
  ".dang-inner-html",
  ".job-description",
  ".jd-description",
  '[class*="description"]',
  '[class*="jd-"]'
];

console.log("\n📄 DESCRIPTION:");
descSelectors.forEach(selector => {
  const el = document.querySelector(selector);
  if (el && el.innerText.trim() && el.innerText.length > 100) {
    console.log(`✅ ${selector} → "${el.innerText.trim().substring(0, 80)}..."`);
  }
});

// Test Apply Buttons
const buttons = document.querySelectorAll("button, a[role='button'], .button, .btn");

console.log("\n🔘 APPLY BUTTONS:");
buttons.forEach(btn => {
  const text = btn.innerText?.toLowerCase().trim() || "";
  const classes = btn.className || "";
  const id = btn.id || "";
  
  if (text.includes("apply") || classes.includes("apply") || id.includes("apply")) {
    console.log(`✅ Found: "${text}" | class="${classes}" | id="${id}"`);
  }
});

console.log("\n✨ Copy the working selectors to content-naukri.js");
