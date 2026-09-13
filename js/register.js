// ===================== CONFIG =====================
const TELEGRAM_BOT_TOKEN = "8793018598:AAEiFW2qiyKFsuVkJ5vzgsNj21ZRPB0Y4wI";   // @BotFather se
const TELEGRAM_CHAT_ID = "6271039736";       // Admin chat ID
const UPI_ID = "shauryaexploits@fam";
const UPI_NAME = "MPGI Treasure Hunt";
const FEE_PER_PERSON = 70;
// ==================================================

let regType = "solo";
let memberCount = 0;
let savedFormData = null;   // store after step 1
const MIN_MEMBERS = 2;
const MAX_MEMBERS = 4;

const membersContainer = document.getElementById("membersContainer");
const addMemberBtn = document.getElementById("addMemberBtn");
const regForm = document.getElementById("regForm");
const paymentProofForm = document.getElementById("paymentProofForm");
const statusDiv = document.getElementById("payment-status");
const soloSection = document.getElementById("soloSection");
const teamSection = document.getElementById("teamSection");
const amountDisplay = document.getElementById("amountDisplay");
const amountDetail = document.getElementById("amountDetail");
const btnSolo = document.getElementById("btnSolo");
const btnTeam = document.getElementById("btnTeam");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");
const payAmount = document.getElementById("payAmount");
const qrcodeDiv = document.getElementById("qrcode");

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
    setRequired(["soloName","soloEmail","soloPhone","soloCourse"], true);
    setRequired(["teamName","captainName","captainEmail","captainPhone","captainCourse"], false);
    clearTeamRequired();
  } else {
    soloSection.style.display = "none";
    teamSection.style.display = "block";
    setRequired(["soloName","soloEmail","soloPhone","soloCourse"], false);
    setRequired(["teamName","captainName","captainEmail","captainPhone","captainCourse"], true);
    if (memberCount === 0) initMembers();
  }
  updateAmount();
}

function setRequired(ids, required) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (required) el.setAttribute("required", "");
    else el.removeAttribute("required");
  });
}

function clearTeamRequired() {
  document.querySelectorAll("#membersContainer input").forEach(inp => inp.removeAttribute("required"));
}

// ----- Members -----
function createMemberCard(index) {
  const div = document.createElement("div");
  div.className = "member-card";
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
  return regType === "solo" ? 1 : memberCount + 1;
}

function updateAmount() {
  const count = getTotalParticipants();
  const amount = count * FEE_PER_PERSON;
  amountDisplay.textContent = `₹${amount}`;
  amountDetail.textContent = `(${count} × ₹${FEE_PER_PERSON})`;
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

// ----- UPI QR -----
function generateUPIQR(amount) {
  qrcodeDiv.innerHTML = "";
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent("MPGI Treasure Hunt Reg")}`;
  
  new QRCode(qrcodeDiv, {
    text: upiString,
    width: 220,
    height: 220,
    colorDark: "#2c1810",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// ----- Telegram helpers -----
function formatRegMessage(data) {
  let msg = `🏴‍☠️ *NEW REGISTRATION (Pending Payment)*\n\n`;
  msg += `*Type:* ${data.type === "solo" ? "Solo" : "Team"}\n`;
  msg += `*Participants:* ${data.participants}\n`;
  msg += `*Amount to Pay:* ₹${data.amount}\n`;
  msg += `*UPI:* ${UPI_ID}\n\n`;

  if (data.type === "solo") {
    msg += `👤 *Participant*\nName: ${data.person.name}\nEmail: ${data.person.email}\nPhone: ${data.person.phone}\nCourse: ${data.person.course}`;
  } else {
    msg += `*Team:* ${data.teamName}\n\n`;
    msg += `👤 *Captain*\nName: ${data.captain.name}\nEmail: ${data.captain.email}\nPhone: ${data.captain.phone}\nCourse: ${data.captain.course}\n\n`;
    data.members.forEach((m, i) => {
      msg += `👤 *Member ${i + 1}*\nName: ${m.name}\nEmail: ${m.email}\nPhone: ${m.phone}\nCourse: ${m.course}\n\n`;
    });
  }
  return msg;
}

function formatProofMessage(data, utr) {
  let msg = `💰 *PAYMENT PROOF RECEIVED*\n\n`;
  msg += `*UTR / Txn ID:* \`${utr}\`\n`;
  msg += `*Amount:* ₹${data.amount}\n`;
  msg += `*Type:* ${data.type === "solo" ? "Solo" : "Team"}\n`;
  if (data.type === "solo") {
    msg += `*Name:* ${data.person.name}\n*Phone:* ${data.person.phone}`;
  } else {
    msg += `*Team:* ${data.teamName}\n*Captain:* ${data.captain.name}\n*Phone:* ${data.captain.phone}`;
  }
  return msg;
}

async function sendTelegramText(text) {
  if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN" || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID") {
    console.warn("Telegram not configured");
    return { ok: false };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: "Markdown"
      })
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

async function sendTelegramPhoto(file, caption) {
  if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN" || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID") {
    return { ok: false };
  }
  const form = new FormData();
  form.append("chat_id", TELEGRAM_CHAT_ID);
  form.append("photo", file);
  form.append("caption", caption);
  form.append("parse_mode", "Markdown");

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: form
    });
    return await res.json();
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

// ----- STEP 1 Submit → Show QR -----
regForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (regType === "team" && memberCount < MIN_MEMBERS) {
    alert(`Please add at least ${MIN_MEMBERS} more members (total 3–5).`);
    return;
  }
  if (!regForm.checkValidity()) {
    regForm.reportValidity();
    return;
  }

  savedFormData = collectFormData();

  // Send registration details to admin (pending payment)
  await sendTelegramText(formatRegMessage(savedFormData));

  // Show Step 2
  step1.style.display = "none";
  step2.style.display = "block";
  payAmount.textContent = `₹${savedFormData.amount}`;
  generateUPIQR(savedFormData.amount);

  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ----- STEP 2 Submit → UTR + Screenshot -----
paymentProofForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const utr = document.getElementById("utr").value.trim();
  const fileInput = document.getElementById("screenshot");
  const file = fileInput.files[0];

  if (!utr || !file) {
    alert("UTR aur Screenshot dono zaroori hain.");
    return;
  }

  const btn = document.getElementById("submitProofBtn");
  btn.disabled = true;
  btn.textContent = "Submitting...";
  statusDiv.style.display = "block";
  statusDiv.className = "";
  statusDiv.innerHTML = "Sending payment proof to admin...";

  // 1. Send text with UTR
  const textResult = await sendTelegramText(formatProofMessage(savedFormData, utr));

  // 2. Send screenshot
  const caption = `Payment Screenshot\nUTR: ${utr}\nAmount: ₹${savedFormData.amount}`;
  const photoResult = await sendTelegramPhoto(file, caption);

  if (textResult.ok || photoResult.ok) {
    step2.style.display = "none";
    step3.style.display = "block";
  } else {
    statusDiv.className = "error";
    statusDiv.innerHTML = "⚠️ Telegram not configured or failed.<br>Please contact admin with your UTR and screenshot manually.<br>UTR: " + utr;
    btn.disabled = false;
    btn.textContent = "Submit Registration";
  }
});

// Init
setType("solo");
