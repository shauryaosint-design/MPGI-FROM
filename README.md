# MPGI Treasure Hunt Website

Pirate-themed registration website for the college Treasure Hunt competition.

## Features

- **Home page** matching the pirate treasure map UI
- **REGISTER NOW** button → Team registration form
  - Captain details (Name, Email, Phone, Course & Year)
  - Team Name
  - 2–4 additional members (total team size 3–5)
  - Each member: Name, Email, Phone, Course & Year
- **Razorpay payment** of ₹380
- After successful payment → details automatically sent to **Telegram Bot**
- **PRIZES** button → Official Certificate + ₹1100 Cash Prize
- **CONTACT US** → opens phone dialer with number **983883998**

## How to Setup

### 1. Upload the files
Upload the entire `treasure-hunt` folder to any web hosting (GitHub Pages, Netlify, Vercel, college server, etc.).

### 2. Razorpay Setup
1. Create account at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys**
3. Generate **Key ID** (use Test key first)
4. Open `js/register.js`
5. Replace:
   ```js
   const RAZORPAY_KEY_ID = "rzp_test_XXXXXXXX";
   ```
   with your real Key ID.

### 3. Telegram Bot Setup (for admin notifications)
1. Open Telegram and search **@BotFather**
2. Send `/newbot` and follow instructions → you will get a **Bot Token**
3. Start a chat with your new bot (send any message)
4. To get your Chat ID:
   - Search **@userinfobot** or **@getidsbot** and start it
   - Or visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` after messaging the bot
5. Open `js/register.js` and replace:
   ```js
   const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
   const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";
   ```

### 4. Test
- Open `index.html` in browser
- Click **REGISTER NOW**
- Fill form (add members)
- Click **Pay ₹380 & Register**
- In test mode Razorpay will show test cards

## File Structure

```
treasure-hunt/
├── index.html          ← Main treasure map page
├── register.html       ← Team registration + payment
├── prizes.html         ← Prize details
├── css/
│   └── style.css
├── js/
│   └── register.js
└── README.md
```

## Notes

- Minimum team size: **3** (Captain + 2 members)
- Maximum team size: **5** (Captain + 4 members)
- Entry fee is hard-coded as **₹380**
- Contact number is hard-coded as **983883998**
- All pages are mobile-friendly

Made for MPGI College Treasure Hunt Competition.
