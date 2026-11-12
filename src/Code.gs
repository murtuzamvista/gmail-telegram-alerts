// --- CONFIGURATION & CONSTANTS ---
const scriptProps = PropertiesService.getScriptProperties();

// Script Property Keys
const PROP_SENDER_EMAIL = 'SENDER_EMAIL';
const PROP_TELEGRAM_BOT_TOKEN = 'TELEGRAM_BOT_TOKEN';
const PROP_TELEGRAM_CHAT_ID = 'TELEGRAM_CHAT_ID';
const PROP_PROCESSED_IDS = 'PROCESSED_IDS';

// Environment Secrets
const SENDER_EMAIL = scriptProps.getProperty(PROP_SENDER_EMAIL);
const TELEGRAM_BOT_TOKEN = scriptProps.getProperty(PROP_TELEGRAM_BOT_TOKEN);
const TELEGRAM_CHAT_ID = scriptProps.getProperty(PROP_TELEGRAM_CHAT_ID);

// Tuning & Limits
const MAX_PROCESSED_IDS = 100;

// API & Formatting Constants
const GMAIL_USER_ID = 'me';
const GMAIL_FETCH_FORMAT = 'metadata';
const HEADER_SUBJECT = 'Subject';
const TELEGRAM_API_BASE_URL = 'https://api.telegram.org/bot';
const TELEGRAM_SEND_ENDPOINT = '/sendMessage';
const TELEGRAM_PARSE_MODE = 'Markdown';
const ALERT_HEADER = '📧 *Bethak Email Alert!*';
const DEFAULT_SUBJECT = '(No Subject)';
const EMPTY_ARRAY_JSON = '[]';
// ---------------------------------

function checkEmailsAndAlertTelegram() {
  if (!SENDER_EMAIL || !TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    Logger.log("Missing Script Properties. Check Project Settings.");
    return;
  }

  // Load previously alerted message IDs
  const processedIdsRaw = scriptProps.getProperty(PROP_PROCESSED_IDS) || EMPTY_ARRAY_JSON;
  let processedIds = JSON.parse(processedIdsRaw);

  // Search for unread emails from the specific sender using the Gmail API
  const searchQuery = `from:${SENDER_EMAIL} is:unread`;
  const response = Gmail.Users.Messages.list(GMAIL_USER_ID, { q: searchQuery });
  
  if (!response.messages || response.messages.length === 0) return;

  let isUpdated = false;

  for (let i = 0; i < response.messages.length; i++) {
    const msgId = response.messages[i].id;

    // Skip this email if we already sent a Telegram alert for it
    if (processedIds.includes(msgId)) continue;

    // Fetch only the Subject header for faster execution
    const msg = Gmail.Users.Messages.get(GMAIL_USER_ID, msgId, { 
      format: GMAIL_FETCH_FORMAT, 
      metadataHeaders: [HEADER_SUBJECT] 
    });
    
    const headers = msg.payload.headers;
    const subjectHeader = headers.find(h => h.name === HEADER_SUBJECT);
    const subject = subjectHeader ? subjectHeader.value : DEFAULT_SUBJECT;
    
    // Construct the Telegram message payload
    const telegramMessage = `${ALERT_HEADER}\n\n*From:* ${SENDER_EMAIL}\n*Subject:* ${subject}`;
    
    // Send via Telegram
    sendTelegramNotification(telegramMessage);

    // Record this message ID so it stays unread without triggering repeat alerts
    processedIds.push(msgId);
    isUpdated = true;
  }

  // Save updated list and keep only the latest MAX_PROCESSED_IDS in storage
  if (isUpdated) {
    if (processedIds.length > MAX_PROCESSED_IDS) {
      processedIds = processedIds.slice(processedIds.length - MAX_PROCESSED_IDS);
    }
    scriptProps.setProperty(PROP_PROCESSED_IDS, JSON.stringify(processedIds));
  }
}

function sendTelegramNotification(messageText) {
  const url = `${TELEGRAM_API_BASE_URL}${TELEGRAM_BOT_TOKEN}${TELEGRAM_SEND_ENDPOINT}`;
  const payload = {
    "chat_id": TELEGRAM_CHAT_ID,
    "text": messageText,
    "parse_mode": TELEGRAM_PARSE_MODE
  };
  
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());
  } catch (e) {
    Logger.log("Error sending Telegram message: " + e.toString());
  }
}
