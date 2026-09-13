// ===================== CONFIG =====================
const TELEGRAM_BOT_TOKEN = "8793018598:AAEiFW2qiyKFsuVkJ5vzgsNj21ZRPB0Y4wI";
const TELEGRAM_CHAT_ID = "6271039736";
const PAYMENT_LINK = "https://razorpay.me/@realencesolutions";
const FEE_PER_PERSON = 70; // ₹70 per participant
// ==================================================

let regType = "solo"; // "solo" or "team"
let memberCount = 0;
const MIN_MEMBERS = 2; // additional (total 3)
const MAX_MEMBERS = 4; // additional (total 5)

const membersContainer = document.getElementById("membersContainer");
const addMemberBtn = document.getElementById("addMemberBtn");
const regForm = document.getElementById("regForm");
const payBtn = document.getElementById("payBtn");
const statusDiv = document.getElementById("payment-status");
const soloSection = document.getElementById("soloSection");
const teamSection = document.getElementById("teamSection");
const amountDisplay = document.getElementById("amountDisplay");
const amountDetail = document.getElementById("amountDetail");
const btnSolo = document.getElementById("btnSolo");
const btnTeam = document.getElementById("btnTeam");

// ----- Type Selector -----
btnSolo.addEventListener("click", () => setType("solo"));
btnTeam.addEventListener("click", () => setType("team"));

function setType(type) {
  regType = type;
  btnSolo.classList.toggle("active", type === "solo");
  btnTeam.classList.toggle("active", type === "team");

  if (type === "solo") {
    soloSection.style.display = "block";
    teamSection.style.display = "none";
    // make solo required, team not
    setRequired(["soloName","soloEmail","soloPhone","soloCourse"], true);
    setRequired(["teamName","captainName","captainEmail","captainPhone","captainCourse"], false);
    clearTeamRequired();
  } else {
    soloSection.style.display = "none";
    teamSection.style.display = "block";
    setRequired(["soloName","soloEmail","soloPhone","soloCourse"], false);
    setRequired(["teamName","captainName","captainEmail","captainPhone","captainCourse"], true);
    // members already have required when created
    if (memberCount === 0) initMembers();
  }
  updateAmount();
}

function setRequired(ids, required) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (required) el.setAttribute("required", "");
      else el.removeAttribute("required");
    }
  });
}

function clearTeamRequired() {
  document.querySelectorAll('#membersContainer input').forEach(inp => {
    inp.removeAttribute("required");
  });
}

// ----- Members -----
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
    updateAmount();
  });
  return div;
}

function renumberMembers() {
  membersContainer.querySelectorAll(".member-card").forEach((card, i) => {
    card.querySelector("h4").textContent = `Member ${i + 1}`;
  });
}

function updateAddButton() {
  addMemberBtn.disabled = memberCount >= MAX_MEMBERS;
  addMemberBtn.textContent = memberCount >= MAX_MEMBERS
    ? "Maximum members reached"
    : `+ Add Member (${memberCount}/${MAX_MEMBERS})`;
}

function initMembers() {
  membersContainer.innerHTML = "";
  memberCount = 0;
  for (let i = 0; i < MIN_MEMBERS; i++) {
    membersContainer.appendChild(createMemberCard(i));
    memberCount++;
  }
  updateAddButton();
  updateAmount();
}

addMemberBtn.addEventListener("click", () => {
  if (memberCount < MAX_MEMBERS) {
    membersContainer.appendChild(createMemberCard(memberCount));
    memberCount++;
    updateAddButton();
    updateAmount();
  }
});

// ----- Amount -----
function getTotalParticipants() {
  if (regType === "solo") return 1;
  return memberCount + 1; // + captain
}

function updateAmount() {
  const count = getTotalParticipants();
  const amount = count * FEE_PER_PERSON;
  amountDisplay.textContent = `₹${amount}`;
  amountDetail.textContent = `(${count} × ₹${FEE_PER_PERSON})`;
  payBtn.textContent = `Pay ₹${amount} & Register`;
}

// ----- Collect Data -----
function collectFormData() {
  if (regType === "solo") {
    return {
      type: "solo",
      participants: 1,
      amount: FEE_PER_PERSON,
      person: {
        name: document.getElementById("soloName").value.trim(),
        email: document.getElementById("soloEmail").value.trim(),
        phone: document.getElementById("soloPhone").value.trim(),
        course: document.getElementById("soloCourse").value.trim()
      }
    };
  }

  // Team
  const data = {
    type: "team",
    teamName: document.getElementById("teamName").value.trim(),
    participants: memberCount + 1,
    amount: (memberCount + 1) * FEE_PER_PERSON,
    captain: {
      name: document.getElementById("captainName").value.trim(),
      email: document.getElementById("captainEmail").value.trim(),
      phone: document.getElementById("captainPhone").value.trim(),
      course: document.getElementById("captainCourse").value.trim()
    },
    members: []
  };

  const names = document.querySelectorAll('input[name="memberName[]"]');
  const emails = document.querySelectorAll('input[name="memberEmail[]"]');
  const phones = document.querySelectorAll('input[name="memberPhone[]"]');
  const courses = document.querySelectorAll('input[name="memberCourse[]"]');

  for (let i = 0; i < names.length; i++) {
    data.members.push({
      name: names[i].value.trim(),
      email: emails[i].value.trim(),
      phone: phones[i].value.trim(),
      course: courses[i].value.trim()
    });
  }
  return data;
}

// ----- Telegram -----
function formatTelegramMessage(data) {
  let msg = `🏴‍☠️ *NEW TREASURE HUNT REGISTRATION*\n\n`;
  msg += `*Type:* ${data.type === "solo" ? "Solo Participant" : "Team"}\n`;
  msg += `*Participants:* ${data.participants}\n`;
  msg += `*Amount:* ₹${data.amount}\n`;
  msg += `*Payment Link:* ${PAYMENT_LINK}\n\n`;

  if (data.type === "solo") {
    msg += `👤 *Participant*\n`;
    msg += `Name: ${data.person.name}\n`;
    msg += `Email: ${data.person.email}\n`;
    msg += `Phone: ${data.person.phone}\n`;
    msg += `Course: ${data.person.course}\n`;
  } else {
    msg += `*Team:* ${data.teamName}\n\n`;
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
  }
  msg += `\n⚠️ Payment pending – user redirected to payment page.`;
  return msg;
}

async function sendToTelegram(message) {
  if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN" || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID") {
    console.warn("Telegram credentials not set.");
    return { ok: false, reason: "credentials_missing" };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });
    return await res.json();
  } catch (err) {
    console.error("Telegram error:", err);
    return { ok: false, error: err };
  }
}

// ----- Submit -----
regForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (regType === "team" && memberCount < MIN_MEMBERS) {
    alert(`Please add at least ${MIN_MEMBERS} more members (total team size 3-5).`);
    return;
  }

  if (!regForm.checkValidity()) {
    regForm.reportValidity();
    return;
  }

  const formData = collectFormData();

  payBtn.disabled = true;
  payBtn.textContent = "Processing...";
  statusDiv.style.display = "block";
  statusDiv.className = "";
  statusDiv.innerHTML = "Sending registration details...";

  const message = formatTelegramMessage(formData);
  const tgResult = await sendToTelegram(message);

  if (tgResult.ok) {
    statusDiv.className = "success";
    statusDiv.innerHTML = `✅ Details sent to admin!<br>Amount: ₹${formData.amount}<br>Redirecting to payment...`;
  } else {
    statusDiv.className = "error";
    statusDiv.innerHTML = `⚠️ Could not notify admin (Telegram not configured).<br>Amount: ₹${formData.amount}<br>Still redirecting to payment...`;
  }

  setTimeout(() => {
    window.location.href = PAYMENT_LINK;
  }, 1600);
});

// Init
setType("solo");
