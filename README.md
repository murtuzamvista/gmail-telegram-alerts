# Gmail to Telegram Alert Automation

A lightweight, serverless Google Apps Script that monitors your Gmail inbox for unread emails from a specific sender and sends an instant notification to Telegram—while keeping your emails unread and enforcing strict read-only permissions.

## Features
* **Strict Read-Only Permissions:** Uses the Gmail Advanced Service with the `gmail.readonly` OAuth scope, ensuring the script cannot modify, send, or delete emails.
* **Unread Preservation:** Leaves alerted emails marked as **Unread** in your inbox while tracking processed message IDs in `PropertiesService` to prevent duplicate alerts.
* **Fast Metadata Fetching:** Fetches only the `Subject` header via the Gmail API (`format: 'metadata'`) for quick execution and minimal payload overhead.
* **Zero Hardcoded Secrets:** Stores API tokens, chat IDs, and target email addresses securely in Google Apps Script's **Script Properties**.
* **Zero Hosting Costs:** Runs entirely on Google's free Apps Script infrastructure.

---

## Repository Structure

```text
gmail-telegram-alerts/
├── src/
│   ├── Code.gs             # Main automation script
│   └── appsscript.json     # Manifest with Gmail API service & read-only scopes
├── .gitignore              # Git ignore rules
└── README.md               # Documentation
```

---

## Prerequisites
1. A **Google Account** (for Gmail and Google Apps Script).
2. A **Telegram Account**.

---

## Setup Guide

### Step 1: Create a Telegram Bot
1. Open Telegram and search for **@BotFather**.
2. Start a chat and send `/newbot`.
3. Follow the prompts to name your bot and choose a username.
4. Copy the **HTTP API Token** provided by BotFather.
5. Search for your new bot's username in Telegram, open the chat, and click **Start**.

### Step 2: Get Your Telegram Chat ID
1. In Telegram, search for **@userinfobot** (or **@GetChatID_Bot**).
2. Start the bot and copy your numeric **Id**.

### Step 3: Set Up the Google Apps Script Project
1. Open [Google Apps Script](https://script.google.com/home) and click **New Project**.
2. In the left sidebar, click the **+** icon next to **Services**, select **Gmail API**, and click **Add**.
3. Click **Project Settings** (the gear icon ⚙️) and check **Show "appsscript.json" manifest file in editor**.
4. Return to the **Editor** (`< >` icon):
   * Copy the contents of `src/appsscript.json` into your project's `appsscript.json` file.
   * Copy the contents of `src/Code.gs` into your project's `Code.gs` file.
5. Press **Ctrl + S** (or **Cmd + S**) to save both files.

### Step 4: Configure Script Properties (Secrets)
1. Go to **Project Settings** (⚙️) and scroll down to **Script Properties**.
2. Click **Add script property** and enter the following three key-value pairs:
   * `SENDER_EMAIL`: The email address you want to monitor (e.g., `alerts@example.com`).
   * `TELEGRAM_BOT_TOKEN`: Your HTTP API token from BotFather.
   * `TELEGRAM_CHAT_ID`: Your numeric Telegram Chat ID.
3. Click **Save script properties**.

### Step 5: Authorize and Test
1. Return to the **Editor** (`< >` icon), ensure `checkEmailsAndAlertTelegram` is selected in the toolbar, and click **Run**.
2. Click **Review Permissions**, choose your Google account, click **Advanced**, and select **Go to [Project Name] (unsafe)**.
3. Confirm the consent screen only asks to **View your email messages and settings**.
4. Verify with an unread email from your target sender—you will receive a Telegram alert, and the email will remain unread in Gmail.

### Step 6: Automate with a Time-Driven Trigger
1. Click **Triggers** (the alarm clock icon ⏰ on the left sidebar).
2. Click **+ Add Trigger** in the bottom right.
3. Configure the trigger settings:
   * **Choose which function to run:** `checkEmailsAndAlertTelegram`
   * **Select event source:** `Time-driven`
   * **Select type of time based trigger:** `Minutes timer`
   * **Select minute interval:** `Every minute` (or `Every 5 minutes`)
4. Click **Save**.

---

## Setting a Custom Notification Tone for Immediate Alerts
To distinguish these email alerts from regular messages—and ensure they grab your attention immediately—assign a dedicated ringtone or alarm sound to your bot's chat in Telegram.

### On Android
1. Open the chat with your Telegram bot.
2. Tap the **bot's name** at the top of the screen to open its profile.
3. Tap **Notifications** > **Customize** (or **Custom Notifications**).
4. Enable **Use custom notifications**.
5. Tap **Sound** and choose a distinct, loud alert tone (or tap **Upload Sound** to use a custom `.mp3`/`.ogg` alarm file).
6. *(Optional)* Set **Importance / Priority** to **Urgent** and enable **Override Do Not Disturb** in your phone's notification channel settings if you want alerts to bypass silent mode.

### On iOS (iPhone / iPad)
1. Open the chat with your Telegram bot.
2. Tap the **bot's name** at the top of the screen.
3. Tap **Mute** > **Customize** (or **Sound**).
4. Select a distinct Telegram alert tone or upload a custom sound file (under 5 seconds and 300 KB).
5. *(Optional)* Add the Telegram app to your **Allowed Apps** under iOS **Settings > Focus > Do Not Disturb** so urgent alerts still ring through.

---

## Configuration Constants
All tunable parameters are defined at the top of `src/Code.gs`:

| Constant | Default | Description |
| :--- | :--- | :--- |
| `MAX_PROCESSED_IDS` | `100` | Maximum number of recent message IDs retained in storage to prevent duplicate alerts. |
| `ALERT_HEADER` | `'📧 *Bethak Email Alert!*'` | Bold header text displayed at the top of each Telegram notification. |
| `DEFAULT_SUBJECT` | `'(No Subject)'` | Fallback subject text if an incoming email has an empty subject line. |

---

## Troubleshooting
* **No alert received:** Check **Executions** in the left sidebar of Google Apps Script to inspect logs. Ensure the target email is marked as **Unread** in Gmail.
* **Markdown parsing errors:** If an incoming email subject contains unclosed special characters (such as `*`, `_`, or `` ` ``), Telegram may reject the payload. Change `TELEGRAM_PARSE_MODE` to `''` (empty string) in `src/Code.gs` to send plain text instead.
* **Resetting processed history:** To re-trigger alerts for previously processed unread emails, delete the `PROCESSED_IDS` property under **Project Settings > Script Properties**.
