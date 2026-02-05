/**
 * IMAP Inbound Email Service (Gmail)
 * Polls a mailbox and processes new emails.
 */

const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const aiService = require('./aiService');
const Email = require('../models/Email');

const DEFAULT_POLL_MS = 120000;

function getImapConfig() {
  return {
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: Number(process.env.IMAP_PORT || 993),
    secure: String(process.env.IMAP_SECURE || 'true') === 'true',
    socketTimeout: Number(process.env.IMAP_SOCKET_TIMEOUT || 60000),
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS,
    },
  };
}

function extractPhone(text) {
  if (!text) return null;
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return phoneMatch ? phoneMatch[1].trim() : null;
}

async function processMessage(message) {
  const parsed = await simpleParser(message.source);
  const from = parsed.from?.value?.[0] || {};
  const fromEmail = from.address || '';
  const fromName = from.name || fromEmail.split('@')[0] || 'Customer';
  const subject = parsed.subject || '(no subject)';
  const messageText = parsed.text || parsed.html || '';
  const receivedDate = parsed.date || null;
  const messageId = parsed.messageId || `uid:${message.uid}`;
  const companyEmail = (process.env.COMPANY_EMAIL || '').toLowerCase();
  const recipients = [
    ...(parsed.to?.value || []),
    ...(parsed.cc?.value || []),
    ...(parsed.bcc?.value || []),
  ];
  const recipientEmails = recipients.map((r) => (r.address || '').toLowerCase());
  const sinceEnv = process.env.IMAP_SINCE;
  const sinceDate = sinceEnv ? new Date(sinceEnv) : null;

  if (!fromEmail || !messageText) {
    return { skipped: true, reason: 'Missing fromEmail or message body' };
  }
  if (companyEmail && !recipientEmails.includes(companyEmail)) {
    return { skipped: true, reason: 'Not addressed to company mailbox' };
  }
  if (sinceDate && receivedDate && receivedDate < sinceDate) {
    return { skipped: true, reason: 'Message is older than IMAP_SINCE' };
  }

  const phone = extractPhone(messageText);
  const aiResult = aiService.processIncomingEmail({
    fromEmail,
    fromName,
    subject,
    message: messageText
  });

  const saveResult = await Email.saveIncomingEmail({
    fromEmail,
    fromName,
    phone,
    subject,
    message: messageText,
    messageId,
    intent: aiResult.intent,
    aiReply: aiResult.aiReply,
    confidence: aiResult.confidence
  });

  return { success: true, data: saveResult.data };
}

async function pollMailbox() {
  const config = getImapConfig();
  if (!config.auth.user || !config.auth.pass) {
    console.warn('[IMAP] Missing IMAP_USER or IMAP_PASS. Skipping poll.');
    return;
  }

  const client = new ImapFlow(config);
  client.on('error', (err) => {
    console.error('[IMAP] Connection error:', err.message);
  });
  try {
    await client.connect();
    await client.mailboxOpen(process.env.IMAP_MAILBOX || 'INBOX');

    const sinceEnv = process.env.IMAP_SINCE;
    const sinceDate = sinceEnv ? new Date(sinceEnv) : null;
    const searchCriteria = sinceDate
      ? { since: sinceDate }
      : { all: true };
    const uids = await client.search(searchCriteria);

    for await (const message of client.fetch(uids, { uid: true, source: true })) {
      try {
        await processMessage(message);
        await client.messageFlagsAdd(message.uid, ['\\Seen']);
      } catch (error) {
        console.error('[IMAP] Failed to process message:', error.message);
      }
    }
  } catch (error) {
    console.error('[IMAP] Poll error:', error.message);
  } finally {
    try {
      await client.logout();
    } catch {
      // ignore
    }
  }
}

function startImapPolling() {
  const enabled = String(process.env.IMAP_ENABLED || 'false') === 'true';
  if (!enabled) return;

  const intervalMs = Number(process.env.IMAP_POLL_MS || DEFAULT_POLL_MS);
  console.log(`[IMAP] Polling enabled. Interval: ${intervalMs}ms`);

  pollMailbox();
  setInterval(pollMailbox, intervalMs);
}

module.exports = {
  startImapPolling
};
