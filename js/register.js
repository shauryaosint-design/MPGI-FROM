// ===================== CONFIG =====================
// IMPORTANT: Replace these with your real values before going live

const RAZORPAY_KEY_ID = "rzp_test_XXXXXXXX";   // Your Razorpay Key ID (test or live)
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";    // From @BotFather
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";        // Your Telegram user/group chat ID

// Entry fee in paise (380 INR = 38000 paise)
const ENTRY_FEE = 38000;

// ==================================================

let memberCount = 0;
const MIN_MEMBERS = 2; // additional members (total team 3 including captain)
const MAX_MEMBERS = 4; // additional members (total team 5 including captain)

const membersContainer = document.getElementById("membersContainer");
const addMemberBtn = document.getElementById("addMemberBtn");
const regForm = document.getElementById("regForm");
const payBtn = document.getElementById("payBtn");
const statusDiv = document.getElementById("payment-status");

// Create one member card
function createMemberCard(index) {
  const div = document.createElement("div");
  div.className = "member-card";
  div.dataset.index = index;
  div.innerHTML = `
    <h4>Member ${index + 1}</h4>
    <button type="button" class="remove-member" title="Remove">×</button>
    
    <div class="form-group">
      <label>Full Name *</label>
      <input type="text" name="memberName[]" required>
    </div>
    <div class="form-group">
      <label>Email *</label>
      <input type="email" name="memberEmail[]" required>
    </div>
    <div class="form-group">
      <label>Phone Number *</label>
      <input type="tel" name="memberPhone[]" required pattern="[0-9]{10}" placeholder="10-digit number">
    </div>
    <div class="form-group">
      <label>Course & Year *</label>
      <input type="text" name="memberCourse[]" required placeholder="e.g. B.Tech ECE 2nd Year">
    </div>
  `;

  div.querySelector(".remove-member").addEventListener("click", () => {
    div.remove();
    memberCount--;
    updateAddButton();
    renumberMembers();
  });

  return div;
}

function renumberMembers() {
  const cards = membersContainer.querySelectorAll(".member-card");
  cards.forEach((card, i) => {
    card.querySelector("h4").textContent = `Member ${i + 1}`;
  });
}

function updateAddButton() {
  addMemberBtn.disabled = memberCount >= MAX_MEMBERS;
  if (memberCount >= MAX_MEMBERS) {
    addMemberBtn.textContent = "Maximum members reached";
  } else {
    addMemberBtn.textContent = `+ Add Member (${memberCount}/${MAX_MEMBERS})`;
  }
}

// Initial: add 2 members so total becomes 3
function initMembers() {
  for (let i = 0; i < MIN_MEMBERS; i++) {
    membersContainer.appendChild(createMemberCard(i));
    memberCount++;
  }
  updateAddButton();
}

addMemberBtn.addEventListener("click", () => {
  if (memberCount < MAX_MEMBERS) {
    membersContainer.appendChild(createMemberCard(memberCount));
    memberCount++;
    updateAddButton();
  }
});

// Collect all form data
function collectFormData() {
  const data = {
    teamName: document.getElementById("teamName").value.trim(),
    captain: {
      name: document.getElementById("captainName").value.trim(),
      email: document.getElementById("captainEmail").value.trim(),
      phone: document.getElementById("captainPhone").value.trim(),
      course: document.getElementById("captainCourse").value.trim()
    },
    members: []
  };

  const nameInputs = document.querySelectorAll('input[name="memberName[]"]');
  const emailInputs = document.querySelectorAll('input[name="memberEmail[]"]');
  const phoneInputs = document.querySelectorAll('input[name="memberPhone[]"]');
  const courseInputs = document.querySelectorAll('input[name="memberCourse[]"]');

  for (let i = 0; i < nameInputs.length; i++) {
    data.members.push({
      name: nameInputs[i].value.trim(),
      email: emailInputs[i].value.trim(),
      phone: phoneInputs[i].value.trim(),
      course: courseInputs[i].value.trim()
    });
  }

  return data;
}

// Format message for Telegram
function formatTelegramMessage(data, paymentId) {
  let msg = `🏴‍☠️ *NEW TREASURE HUNT REGISTRATION*\n\n`;
  msg += `*Team:* ${data.teamName}\n`;
  msg += `*Payment ID:* ${paymentId}\n`;
  msg += `*Amount:* ₹380\n\n`;
  msg += `👤 *Captain*\n`;
  msg += `Name: ${data.captain.name}\n`;
  msg += `Email: ${data.captain.email}\n`;
  msg += `Phone: ${data.captain.phone}\n`;
  msg += `Course: ${data.captain.course}\n\n`;

  data.members.forEach((m, i) => {
    msg += `👤 *Member ${i + 1}*\n`;
    msg += `Name: ${m.name}\n`;
    msg += `Email: ${m.email}\n`;
    msg += `Phone: ${m.phone}\n`;
    msg += `Course: ${m.course}\n\n`;
  });

  msg += `Total Members: ${data.members.length + 1}`;
  return msg;
}

// Send to Telegram Bot
async function sendToTelegram(message) {
  if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN" || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID") {
    console.warn("Telegram credentials not set. Skipping notification.");
    return { ok: false, reason: "credentials_missing" };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "Markdown"
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (err) {
    console.error("Telegram error:", err);
    return { ok: false, error: err };
  }
}

// Razorpay Payment
function startPayment(formData) {
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: ENTRY_FEE,
    currency: "INR",
    name: "MPGI Treasure Hunt",
    description: `Team Registration - ${formData.teamName}`,
    image: "https://img.icons8.com/color/96/treasure-chest.png",
    handler: async function (response) {
      // Payment successful
      statusDiv.className = "success";
      statusDiv.innerHTML = "✅ Payment Successful! Sending details to admin...";
      statusDiv.style.display = "block";

      const message = formatTelegramMessage(formData, response.razorpay_payment_id);
      const tgResult = await sendToTelegram(message);

      if (tgResult.ok) {
        statusDiv.innerHTML = "✅ Registration Complete!<br>Payment ID: " + response.razorpay_payment_id + "<br>Details sent to admin via Telegram.";
      } else {
        statusDiv.innerHTML = "✅ Payment Successful (ID: " + response.razorpay_payment_id + ")<br>⚠️ Could not send Telegram notification. Please contact admin with payment ID.";
      }

      payBtn.disabled = true;
      payBtn.textContent = "Registered ✓";
      regForm.reset();
      // Clear members and re-init
      membersContainer.innerHTML = "";
      memberCount = 0;
      initMembers();
    },
    prefill: {
      name: formData.captain.name,
      email: formData.captain.email,
      contact: formData.captain.phone
    },
    notes: {
      team_name: formData.teamName,
      college: "MPGI"
    },
    theme: {
      color: "#8b4513"
    },
    modal: {
      ondismiss: function () {
        statusDiv.className = "error";
        statusDiv.innerHTML = "Payment cancelled. You can try again.";
        statusDiv.style.display = "block";
      }
    }
  };

  // Check if key is still placeholder
  if (RAZORPAY_KEY_ID === "rzp_test_XXXXXXXX") {
    alert("⚠️ Razorpay Key ID is not configured.\n\nPlease open js/register.js and replace RAZORPAY_KEY_ID with your real Key ID from Razorpay Dashboard.\n\nFor testing you can use a test key.");
    // For demo purposes, simulate success
    if (confirm("Simulate successful payment for demo?")) {
      options.handler({ razorpay_payment_id: "pay_demo_" + Date.now() });
    }
    return;
  }

  const rzp = new Razorpay(options);
  rzp.open();
}

// Form submit
regForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Validate member count
  if (memberCount < MIN_MEMBERS) {
    alert(`Please add at least ${MIN_MEMBERS} more members (total team size 3-5).`);
    return;
  }

  if (!regForm.checkValidity()) {
    regForm.reportValidity();
    return;
  }

  const formData = collectFormData();
  startPayment(formData);
});

// Initialize
initMembers();
