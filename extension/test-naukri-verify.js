// =====================================
// Naukri Selector Verification Test
// =====================================
// 
// HOW TO USE:
// 1. Open a Naukri job page
// 2. Open DevTools Console (F12)
// 3. Copy and paste this entire script
// 4. It will show you the extracted data
//
// =====================================

console.log("🔍 Testing Naukri Data Extraction...\n");

// Test Job Title
console.log("📌 JOB TITLE:");
const titleEl = document.querySelector("h1");
if (titleEl) {
  console.log(`✅ Found: "${titleEl.innerText.trim()}"`);
} else {
  console.log("❌ Not found");
}

// Test Company Name (with review removal)
console.log("\n🏢 COMPANY NAME:");
const companyEl = document.querySelector('[class="styles_jd-header-comp-name__MvqAI"]');
if (companyEl) {
  const rawText = companyEl.innerText.trim();
  console.log(`📄 Raw text: "${rawText}"`);
  
  // Remove "X.X Reviews" pattern
  const cleanedText = rawText.replace(/\d+\.?\d*\s*Reviews?/gi, '').trim();
  console.log(`✅ Cleaned: "${cleanedText}"`);
  
  // Show what was removed
  if (rawText !== cleanedText) {
    console.log(`🧹 Removed: "${rawText.replace(cleanedText, '').trim()}"`);
  }
} else {
  console.log("❌ Not found");
}

// Test Location
console.log("\n📍 LOCATION:");
const locationEl = document.querySelector('[class="styles_jhc__location__W_pVs"]');
if (locationEl) {
  console.log(`✅ Found: "${locationEl.innerText.trim()}"`);
} else {
  console.log("❌ Not found");
}

// Test Description
console.log("\n📄 DESCRIPTION:");
const descEl = document.querySelector('[class*="jd-"]');
if (descEl) {
  const descText = descEl.innerText.trim();
  console.log(`✅ Found: "${descText.substring(0, 100)}..." (${descText.length} chars)`);
} else {
  console.log("❌ Not found");
}

// Test Apply Button
console.log("\n🔘 APPLY BUTTON:");
const applyBtn = document.getElementById("company-site-button");
if (applyBtn) {
  console.log(`✅ Found: "${applyBtn.innerText.trim()}"`);
  console.log(`   Class: "${applyBtn.className}"`);
  console.log(`   ID: "${applyBtn.id}"`);
} else {
  console.log("❌ Not found by ID, searching by class...");
  const applyBtnByClass = document.querySelector('[class*="company-site-button"]');
  if (applyBtnByClass) {
    console.log(`✅ Found by class: "${applyBtnByClass.innerText.trim()}"`);
  }
}

// Show complete extracted data
console.log("\n" + "=".repeat(50));
console.log("📦 COMPLETE EXTRACTED DATA:");
console.log("=".repeat(50));

const extractedData = {
  jobTitle: document.querySelector("h1")?.innerText.trim() || "",
  
  companyName: (() => {
    const el = document.querySelector('[class="styles_jd-header-comp-name__MvqAI"]');
    if (!el) return "";
    let text = el.innerText.trim();
    text = text.replace(/\d+\.?\d*\s*Reviews?/gi, '').trim();
    return text;
  })(),
  
  location: document.querySelector('[class="styles_jhc__location__W_pVs"]')?.innerText.trim() || "",
  
  description: document.querySelector('[class*="jd-"]')?.innerText.trim().slice(0, 100) + "..." || "",
  
  jobUrl: location.href,
  
  appliedAt: new Date().toISOString()
};

console.table(extractedData);

// Validation
console.log("\n" + "=".repeat(50));
console.log("✅ VALIDATION:");
console.log("=".repeat(50));

const validation = {
  "Job Title": extractedData.jobTitle ? "✅ OK" : "❌ MISSING",
  "Company Name": extractedData.companyName ? "✅ OK" : "❌ MISSING",
  "Location": extractedData.location ? "✅ OK" : "❌ MISSING",
  "Description": extractedData.description && extractedData.description.length > 10 ? "✅ OK" : "❌ MISSING",
  "Job URL": extractedData.jobUrl ? "✅ OK" : "❌ MISSING"
};

console.table(validation);

// Final summary
const allValid = Object.values(validation).every(v => v.includes("✅"));
if (allValid) {
  console.log("\n🎉 ALL DATA EXTRACTED SUCCESSFULLY!");
  console.log("✅ Ready to test the extension");
} else {
  console.log("\n⚠️ SOME DATA IS MISSING");
  console.log("Check the validation table above to see what's missing");
}

console.log("\n✨ If everything looks good, load the extension and test!");
