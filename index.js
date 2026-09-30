/* ==========================================================================
   SECOND LIFE — JAVASCRIPT (index.js)
   College Project — Review 1: Frontend Prototype
   Architecture: Vanilla JavaScript (DOM Manipulation, LocalStorage, Rules Engine)
   ========================================================================== */

// ==========================================================================
// 1. DATA STRUCTURES & DEFAULT SEED DATA
// ==========================================================================

// Predefined demo statistics for Review 1 prototype
let impactStats = {
  total: 24,
  repairable: 12,
  reusable: 7,
  recyclable: 5
};

// Action plans tailored for each recommendation pathway
const ACTION_PLANS = {
  REPAIR: [
    {
      step: 1,
      title: "Find a Suitable Repair Service",
      description: "Look for authorized service centers or trustworthy local technicians specializing in your item category."
    },
    {
      step: 2,
      title: "Compare Repair Estimates",
      description: "Get at least two quotes. Ensure parts replaced are genuine or OEM-equivalent to maximize longevity."
    },
    {
      step: 3,
      title: "Repair & Test",
      description: "Have the component fixed and test all core functionalities before accepting delivery."
    },
    {
      step: 4,
      title: "Continue Using Product",
      description: "Adopt proper maintenance habits and protective accessories to prevent recurring failures."
    }
  ],
  REUSE: [
    {
      step: 1,
      title: "Clean & Maintain",
      description: "Give the item a thorough cleaning, check firmware/batteries, or perform minor tune-ups."
    },
    {
      step: 2,
      title: "Repurpose or Retain",
      description: "Use it as a backup device, secondary household appliance, or convert it for an alternative utility."
    },
    {
      step: 3,
      title: "Share With Family / Friends",
      description: "Pass it on to someone within your circle who can immediately put it to productive use."
    },
    {
      step: 4,
      title: "Extend Useful Product Life",
      description: "Keep the item in active service to eliminate demand for newly manufactured products."
    }
  ],
  DONATE: [
    {
      step: 1,
      title: "Clean the Item",
      description: "Sanitize, wipe down, and restore the item into a presentable, dignified condition."
    },
    {
      step: 2,
      title: "Check Usability & Safety",
      description: "Verify that all essential features work safely so the recipient receives genuine value."
    },
    {
      step: 3,
      title: "Find Someone In Need",
      description: "Connect with local NGOs, schools, community centers, or donation drives in your neighborhood."
    },
    {
      step: 4,
      title: "Hand Over Responsibly",
      description: "Include original cables, manuals, or accessories to make it easy for the recipient to use."
    }
  ],
  RECYCLE: [
    {
      step: 1,
      title: "Do Not Mix in Regular Trash",
      description: "Hazardous chemicals and valuable metals must not enter landfills or municipal waste streams."
    },
    {
      step: 2,
      title: "Separate Components",
      description: "Remove batteries, cables, and packaging materials if safe to do so."
    },
    {
      step: 3,
      title: "Locate Certified Recycler",
      description: "Find an authorized e-waste collection bin, producer take-back drop-off, or certified recycling depot."
    },
    {
      step: 4,
      title: "Safe Material Recovery",
      description: "Ensure the recycler adheres to government-approved environmental safety guidelines."
    }
  ],
  REPLACE: [
    {
      step: 1,
      title: "Consider Repair Feasibility First",
      description: "Confirm that component repair is genuinely uneconomical or technically unviable."
    },
    {
      step: 2,
      title: "Choose a Durable New Product",
      description: "When purchasing a replacement, opt for items with high repairability scores, warranty, and low energy consumption."
    },
    {
      step: 3,
      title: "Trade-In or Recycle Old Item",
      description: "Use trade-in discounts with retailers or send the old unit directly to certified recyclers."
    },
    {
      step: 4,
      title: "Prevent Premature Disposal",
      description: "Commit to maintaining the new product carefully from day one."
    }
  ]
};

// ==========================================================================
// 2. INITIALIZATION & EVENT LISTENERS
// ==========================================================================
document.addEventListener("DOMContentLoaded", function () {
  // Initialize LocalStorage demo history
  loadAssessmentHistory();

  // Attach Form Submit Listener
  const form = document.getElementById("assessmentForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmission);
  }

  // Attach Auto-Fill Demo Button Listener
  const btnDemoFill = document.getElementById("btnDemoFill");
  if (btnDemoFill) {
    btnDemoFill.addEventListener("click", fillDemoData);
  }

  // Attach "Assess Another Item" button listener
  const btnAssessAnother = document.getElementById("btnAssessAnother");
  if (btnAssessAnother) {
    btnAssessAnother.addEventListener("click", resetAndScrollToForm);
  }

  // Attach "Clear History" button listener
  const btnClearHistory = document.getElementById("btnClearHistory");
  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", clearAssessmentHistory);
  }
});

// ==========================================================================
// 3. FORM HANDLING & VALIDATION
// ==========================================================================
function handleFormSubmission(event) {
  event.preventDefault(); // Prevent default page reload

  // Hide any previous error messages
  const errorBox = document.getElementById("formError");
  errorBox.style.display = "none";

  // Step 1: Read form input values
  const category = document.getElementById("itemCategory").value.trim();
  const age = document.getElementById("itemAge").value.trim();
  const condition = document.getElementById("itemCondition").value.trim();
  const repairCostInput = document.getElementById("repairCost").value;
  const purchasePriceInput = document.getElementById("purchasePrice").value;
  const preference = document.getElementById("userPreference").value.trim();

  const repairCost = parseFloat(repairCostInput);
  const purchasePrice = parseFloat(purchasePriceInput);

  // Step 2: Validate input fields
  if (!category || !age || !condition || isNaN(repairCost) || isNaN(purchasePrice) || !preference) {
    showFormError("Please fill out all required fields before submitting.");
    return;
  }

  if (repairCost < 0) {
    showFormError("Repair cost cannot be negative.");
    return;
  }

  if (purchasePrice <= 0) {
    showFormError("Purchase / replacement price must be greater than zero.");
    return;
  }

  // Step 3: Package data into a structured Assessment Object
  // (Designed for easy future API / Database integration)
  const assessmentData = {
    id: "ASSESS-" + Date.now(),
    timestamp: new Date().toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    item: {
      category: category,
      age: age,
      condition: condition,
      estimatedRepairCost: repairCost,
      purchasePrice: purchasePrice
    },
    userPreference: preference
  };

  // Step 4: Run Decision Engine
  const recommendation = evaluateSecondLife(assessmentData);

  // Attach recommendation to assessment object
  assessmentData.recommendation = recommendation;

  // Step 5: Update the UI with results
  displayResult(assessmentData);

  // Step 6: Save to browser localStorage history
  saveAssessmentToHistory(assessmentData);

  // Step 7: Update Prototype Demo Impact Counters
  updateImpactCounters(recommendation.decision);
}

function showFormError(message) {
  const errorBox = document.getElementById("formError");
  errorBox.textContent = "⚠️ " + message;
  errorBox.style.display = "block";
  errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ==========================================================================
// 4. JAVASCRIPT DECISION LOGIC (CIRCULAR ECONOMY RULES ENGINE)
// ==========================================================================
/*
  The decision engine calculates the repair-to-purchase cost ratio and applies
  clear conditional logic based on:
  - Physical/Operational condition
  - Product age
  - Repair cost vs replacement price (Affordability ratio)
  - User's primary intent (Save money, Reduce waste, Quick resolution)
*/
function evaluateSecondLife(data) {
  const condition = data.item.condition;
  const age = data.item.age;
  const repairCost = data.item.estimatedRepairCost;
  const purchasePrice = data.item.purchasePrice;
  const preference = data.userPreference;

  // Calculate repair affordability ratio (e.g., 2000 / 50000 = 0.04 or 4%)
  const costRatio = repairCost / purchasePrice;
  const potentialSaving = Math.max(0, purchasePrice - repairCost);
  const savingPercentage = Math.round((potentialSaving / purchasePrice) * 100);

  let decision = "REPAIR";
  let icon = "🛠️";
  let summary = "";
  let explanation = "";
  let actionTitle = "USE AGAIN";

  // -------------------------------------------------------------
  // RULE 1: If the item is already working perfectly
  // -------------------------------------------------------------
  if (condition === "Works perfectly") {
    if (preference === "Get rid of it quickly") {
      decision = "DONATE";
      icon = "🎁";
      summary = "Your item is in good working order and can directly benefit someone else.";
      explanation = "Since the product works perfectly but you want a quick and meaningful resolution, donating it gives it an immediate second life without generating waste.";
      actionTitle = "DONATE TO OTHERS";
    } else {
      decision = "REUSE";
      icon = "🔄";
      summary = "Your item is fully functional and does not need replacement.";
      explanation = "The product is in working condition. Continuing to use or repurpose it saves 100% of replacement costs and prevents premature resource consumption.";
      actionTitle = "CONTINUE USING";
    }
  }

  // -------------------------------------------------------------
  // RULE 2: Completely unusable / Shattered beyond repair
  // -------------------------------------------------------------
  else if (condition === "Completely unusable") {
    decision = "RECYCLE";
    icon = "♻️";
    summary = "Your item has reached the end of its functional life and should be recycled.";
    explanation = "Because the item is completely non-functional, safe material recovery through certified recycling prevents hazardous materials from reaching landfills.";
    actionTitle = "SAFE RECYCLING";
  }

  // -------------------------------------------------------------
  // RULE 3: Heavily damaged AND repair cost is very high (> 65% of new price)
  // -------------------------------------------------------------
  else if (condition === "Heavily damaged" && costRatio > 0.65) {
    if (age === "More than 10 years" || age === "5–10 years") {
      decision = "RECYCLE";
      icon = "♻️";
      summary = "Major structural damage and high repair costs make recycling the most practical step.";
      explanation = `Estimated repair cost is ${Math.round(costRatio * 100)}% of a new product. Given the age (${age}), responsible material recycling is better than an unstable fix.`;
      actionTitle = "E-WASTE RECYCLE";
    } else {
      decision = "REPLACE";
      icon = "🛒";
      summary = "Repairing this heavily damaged unit is uneconomical compared to replacement.";
      explanation = `The repair cost (₹${repairCost.toLocaleString("en-IN")}) is over 65% of the purchase price. If replacing, choose an energy-efficient, durable model and recycle this old unit.`;
      actionTitle = "REPLACE & RECYCLE";
    }
  }

  // -------------------------------------------------------------
  // RULE 4: Minor problem or Needs repair with reasonable repair cost (<= 50%)
  // -------------------------------------------------------------
  else if (costRatio <= 0.50) {
    decision = "REPAIR";
    icon = "🛠️";
    summary = "Your item still has plenty of useful life remaining with a modest fix.";
    explanation = `Your item is fixable and the estimated repair cost (₹${repairCost.toLocaleString("en-IN")}) is only ${Math.round(costRatio * 100)}% of the new price. Fixing it will save you ₹${potentialSaving.toLocaleString("en-IN")} (${savingPercentage}% savings).`;
    actionTitle = "REPAIR & USE";
  }

  // -------------------------------------------------------------
  // RULE 5: Borderline repair cost (50% - 65%) — evaluate user preference & age
  // -------------------------------------------------------------
  else {
    if (preference === "Reduce waste") {
      decision = "REPAIR";
      icon = "🛠️";
      summary = "Repairing extends this product's lifecycle and avoids landfill waste.";
      explanation = `Although the repair cost is moderate (${Math.round(costRatio * 100)}% of purchase price), repairing aligns with your priority to reduce environmental waste.`;
      actionTitle = "REPAIR & EXTEND";
    } else if (preference === "Get rid of it quickly") {
      decision = "DONATE";
      icon = "🎁";
      summary = "Consider donating to a vocational training center or repair enthusiast.";
      explanation = "Repair enthusiasts or non-profit organizations often refurbish items with minor issues for students or community members in need.";
      actionTitle = "PASS IT FORWARD";
    } else {
      decision = "REPLACE";
      icon = "🛒";
      summary = "High repair-to-value ratio makes a new durable unit more cost-effective.";
      explanation = `Estimated repair cost exceeds 50% of the item's purchase value. If you replace it, ensure you recycle this old product responsibly.`;
      actionTitle = "RESPONSIBLE REPLACE";
    }
  }

  // Return standard recommendation object
  return {
    decision: decision,
    icon: icon,
    summary: summary,
    explanation: explanation,
    actionTitle: actionTitle,
    repairCost: repairCost,
    purchasePrice: purchasePrice,
    potentialSaving: potentialSaving,
    savingPercentage: savingPercentage
  };
}

// ==========================================================================
// 5. DISPLAY RESULTS & UPDATE UI
// ==========================================================================
function displayResult(assessment) {
  const rec = assessment.recommendation;
  const item = assessment.item;

  // Reveal the hidden sections
  const resultSection = document.getElementById("resultSection");
  const pathSection = document.getElementById("second-life-path");

  resultSection.style.display = "block";
  pathSection.style.display = "block";

  // Update Result Card
  document.getElementById("resultTimestamp").textContent = assessment.timestamp;
  document.getElementById("recIcon").textContent = rec.icon;
  document.getElementById("recText").textContent = rec.decision;
  document.getElementById("recSummary").textContent = rec.summary;

  // Financial Metrics
  document.getElementById("metricRepairCost").textContent = "₹" + rec.repairCost.toLocaleString("en-IN");
  document.getElementById("metricNewCost").textContent = "₹" + rec.purchasePrice.toLocaleString("en-IN");
  document.getElementById("metricSaving").textContent = "₹" + rec.potentialSaving.toLocaleString("en-IN");
  document.getElementById("metricSavingPercentage").textContent = `(${rec.savingPercentage}% saved vs buying new)`;

  // Explanation
  document.getElementById("recExplanation").textContent = rec.explanation;

  // Update Visual Lifecycle Diagram
  updateLifecycleFlow(item.category, rec.decision, rec.icon, rec.actionTitle);

  // Update Action Plan Steps
  renderActionPlan(rec.decision);

  // Smooth scroll to Result Section
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Update the dynamic lifecycle visual flowchart
function updateLifecycleFlow(categoryName, decision, icon, actionTitle) {
  document.getElementById("pathItemCategory").textContent = categoryName;
  document.getElementById("nodeDecisionIcon").textContent = icon;
  document.getElementById("nodeDecisionTitle").textContent = decision;
  document.getElementById("nodeActionTitle").textContent = actionTitle;
}

// Render dynamic 4-step action cards
function renderActionPlan(decisionKey) {
  const steps = ACTION_PLANS[decisionKey] || ACTION_PLANS["REPAIR"];
  const container = document.getElementById("actionPlanStepsContainer");
  document.getElementById("actionPlanTitle").textContent = decisionKey;

  // Clear previous cards
  container.innerHTML = "";

  steps.forEach(function (item) {
    const card = document.createElement("div");
    card.className = "action-step-card";
    card.innerHTML = `
      <div class="step-badge-num">${item.step}</div>
      <h4>${item.title}</h4>
      <p>${item.description}</p>
    `;
    container.appendChild(card);
  });
}

// ==========================================================================
// 6. LOCALSTORAGE PERSISTENCE (REVIEW 1 SIMULATION)
// ==========================================================================
const STORAGE_KEY = "SECOND_LIFE_ASSESSMENTS_V1";

function saveAssessmentToHistory(assessment) {
  try {
    let history = getStoredHistory();
    // Add new assessment to top of list
    history.unshift(assessment);
    // Keep max 10 recent items for demo
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    renderHistoryList(history);
  } catch (e) {
    console.warn("LocalStorage unavailable or quota exceeded", e);
  }
}

function getStoredHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function loadAssessmentHistory() {
  const history = getStoredHistory();
  // If empty on first visit, seed with 3 realistic demo entries
  if (history.length === 0) {
    const initialSeed = [
      {
        id: "ASSESS-DEMO-1",
        timestamp: "Yesterday, 4:15 PM",
        item: {
          category: "Smartphone",
          age: "1–2 years",
          condition: "Needs repair",
          estimatedRepairCost: 1200,
          purchasePrice: 18000
        },
        userPreference: "Save money",
        recommendation: {
          decision: "REPAIR",
          icon: "🛠️",
          potentialSaving: 16800
        }
      },
      {
        id: "ASSESS-DEMO-2",
        timestamp: "2 days ago",
        item: {
          category: "Furniture",
          age: "3–5 years",
          condition: "Works perfectly",
          estimatedRepairCost: 0,
          purchasePrice: 6500
        },
        userPreference: "Reduce waste",
        recommendation: {
          decision: "REUSE",
          icon: "🔄",
          potentialSaving: 6500
        }
      },
      {
        id: "ASSESS-DEMO-3",
        timestamp: "3 days ago",
        item: {
          category: "Headphones",
          age: "5–10 years",
          condition: "Completely unusable",
          estimatedRepairCost: 800,
          purchasePrice: 1200
        },
        userPreference: "Get rid of it quickly",
        recommendation: {
          decision: "RECYCLE",
          icon: "♻️",
          potentialSaving: 0
        }
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
    renderHistoryList(initialSeed);
  } else {
    renderHistoryList(history);
  }
}

function renderHistoryList(historyArray) {
  const container = document.getElementById("historyContainer");
  if (!container) return;

  if (historyArray.length === 0) {
    container.innerHTML = `
      <div class="history-empty-state">
        <span style="font-size: 2rem;">📭</span>
        <p><strong>No assessments stored yet.</strong></p>
        <small>Assess an item above to see persistent history here.</small>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  historyArray.forEach(function (item) {
    const card = document.createElement("div");
    card.className = "history-item-card";

    // Format badge class based on decision
    const badgeClass = "badge-" + item.recommendation.decision.toLowerCase();

    card.innerHTML = `
      <div class="history-item-info">
        <div class="history-item-icon">
          ${item.recommendation.icon || "📦"}
        </div>
        <div class="history-item-details">
          <h4>${item.item.category} <span style="font-size:0.8rem; font-weight:normal; color:#7c8e7e;">(${item.item.age})</span></h4>
          <p>Condition: ${item.item.condition} • Estimated Repair: ₹${item.item.estimatedRepairCost.toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div>
        <span class="history-item-badge ${badgeClass}">
          ${item.recommendation.icon || ""} ${item.recommendation.decision}
        </span>
      </div>
    `;
    container.appendChild(card);
  });
}

function clearAssessmentHistory() {
  if (confirm("Are you sure you want to clear your demo assessment history?")) {
    localStorage.removeItem(STORAGE_KEY);
    renderHistoryList([]);
  }
}

// ==========================================================================
// 7. HELPER & DEMO UTILITIES
// ==========================================================================

// Pre-fill the college presentation demo flow with one click
function fillDemoData() {
  document.getElementById("itemCategory").value = "Laptop";
  document.getElementById("itemAge").value = "3–5 years";
  document.getElementById("itemCondition").value = "Needs repair";
  document.getElementById("repairCost").value = "2000";
  document.getElementById("purchasePrice").value = "50000";
  document.getElementById("userPreference").value = "Save money";

  // Hide any error message
  document.getElementById("formError").style.display = "none";

  // Trigger form submit smoothly
  document.getElementById("btnSubmitAssessment").focus();
}

// Reset form and scroll user back to the top of assessment
function resetAndScrollToForm() {
  document.getElementById("assessmentForm").reset();
  const formElement = document.getElementById("assessment");
  formElement.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Increment prototype impact statistics during live testing
function updateImpactCounters(decision) {
  impactStats.total += 1;
  if (decision === "REPAIR") impactStats.repairable += 1;
  if (decision === "REUSE" || decision === "DONATE") impactStats.reusable += 1;
  if (decision === "RECYCLE" || decision === "REPLACE") impactStats.recyclable += 1;

  document.getElementById("statTotalAssessed").textContent = impactStats.total;
  document.getElementById("statRepairable").textContent = impactStats.repairable;
  document.getElementById("statReusable").textContent = impactStats.reusable;
  document.getElementById("statRecyclable").textContent = impactStats.recyclable;
}
