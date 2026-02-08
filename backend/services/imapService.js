/**
 * IMAP Inbound Email Service (Gmail)
 * Polls a mailbox and processes new emails.
 */

const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const aiService = require('./aiService');
const Email = require('../models/Email');

const DEFAULT_POLL_MS = 120000;
let pollingInProgress = false;
let lastProcessedUid = 0;

function getImapConfig() {
  const debug = String(process.env.IMAP_DEBUG || 'false') === 'true';
  return {
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: Number(process.env.IMAP_PORT || 993),
    secure: String(process.env.IMAP_SECURE || 'true') === 'true',
    socketTimeout: Number(process.env.IMAP_SOCKET_TIMEOUT || 60000),
    logger: debug ? undefined : false,
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

async function processMessage(message, mailboxMeta = {}) {
  const parsed = await simpleParser(message.source);
  const from = parsed.from?.value?.[0] || {};
  const fromEmail = from.address || '';
  const fromName = from.name || fromEmail.split('@')[0] || 'Customer';
  const subject = parsed.subject || '(no subject)';
  const messageText = parsed.text || parsed.html || '';
  const receivedDate = parsed.date || null;
  const messageId = parsed.messageId || `uid:${message.uid}`;
  const uidValidity = mailboxMeta.uidValidity || message.uidValidity || null;
  const mailboxPath = mailboxMeta.path || mailboxMeta.mailboxPath || null;
  const dedupeKey = messageId || (
    uidValidity && message.uid
      ? `uidv:${uidValidity}:uid:${message.uid}${mailboxPath ? `:mb:${mailboxPath}` : ''}`
      : null
  );
  const companyEmail = (process.env.COMPANY_EMAIL || '').toLowerCase();
  const recipients = [
    ...(parsed.to?.value || []),
    ...(parsed.cc?.value || []),
    ...(parsed.bcc?.value || []),
  ];
  const recipientEmails = recipients.map((r) => (r.address || '').toLowerCase());
  const deliveredTo = [
    parsed.headers?.get('delivered-to'),
    parsed.headers?.get('x-original-to'),
    parsed.headers?.get('to'),
  ]
    .filter(Boolean)
    .map((v) => String(v).toLowerCase());
  const sinceEnv = process.env.IMAP_SINCE;
  const sinceDate = sinceEnv ? new Date(sinceEnv) : null;
  const debug = String(process.env.IMAP_DEBUG || 'false') === 'true';

  if (!fromEmail || !messageText) {
    if (debug) console.log('[IMAP] Skipped message: missing from or body', { subject });
    return { skipped: true, reason: 'Missing fromEmail or message body' };
  }
  if (companyEmail) {
    const match =
      recipientEmails.includes(companyEmail) ||
      deliveredTo.some((v) => v.includes(companyEmail));
    if (!match) {
      if (debug) {
        console.log('[IMAP] Skipped message: not addressed to company mailbox', {
          subject,
          fromEmail,
          recipientEmails,
          deliveredTo,
        });
      }
      return { skipped: true, reason: 'Not addressed to company mailbox' };
    }
  }
  if (sinceDate && receivedDate && receivedDate < sinceDate) {
    if (debug) {
      console.log('[IMAP] Skipped message: older than IMAP_SINCE', {
        subject,
        receivedDate,
        sinceDate,
      });
    }
    return { skipped: true, reason: 'Message is older than IMAP_SINCE' };
  }

  const phone = extractPhone(messageText);
  const aiResult = await aiService.processIncomingEmail({
    fromEmail,
    fromName,
    subject,
    message: messageText
  });

  let saveResult;
  try {
    saveResult = await Email.saveIncomingEmail({
      fromEmail,
      fromName,
      phone,
      subject,
      message: messageText,
      sentimentScore: aiResult.sentiment?.score,
      sentimentLabel: aiResult.sentiment?.label,
      messageId: dedupeKey,
      intent: aiResult.intent,
      aiReply: aiResult.aiReply,
      confidence: aiResult.confidence,
      extracted: aiResult.extracted
    });
  } catch (error) {
    console.error('[IMAP] Failed to save email:', {
      subject,
      fromEmail,
      messageId,
      error: error.message
    });
    throw error;
  }

  if (debug) {
    console.log('[IMAP] Processed message', {
      subject,
      fromEmail,
      messageId: dedupeKey,
      intent: aiResult.intent,
      saved: !saveResult?.skipped,
    });
    if (saveResult?.skipped) {
      console.log('[IMAP] Skipped saving (deduped)', {
        subject,
        messageId: dedupeKey
      });
    }
  }

  return { success: true, data: saveResult.data };
}

async function pollMailbox() {
  if (pollingInProgress) return;
  pollingInProgress = true;
  const config = getImapConfig();
  if (!config.auth.user || !config.auth.pass) {
    console.warn('[IMAP] Missing IMAP_USER or IMAP_PASS. Skipping poll.');
    pollingInProgress = false;
    return;
  }

  const client = new ImapFlow(config);
  const debug = String(process.env.IMAP_DEBUG || 'false') === 'true';
  client.on('error', (err) => {
    if (debug) {
      console.error('[IMAP] Connection error:', err.message);
    }
  });
  try {
    await client.connect();
    const mailbox = await client.mailboxOpen(process.env.IMAP_MAILBOX || 'INBOX');
    const mailboxMeta = {
      uidValidity: mailbox?.uidValidity,
      path: mailbox?.path || process.env.IMAP_MAILBOX || 'INBOX'
    };

    const sinceEnv = process.env.IMAP_SINCE;
    const sinceDate = sinceEnv ? new Date(sinceEnv) : null;
    let searchCriteria;
    if (lastProcessedUid > 0) {
      searchCriteria = { uid: `${lastProcessedUid + 1}:*` };
    } else if (sinceDate) {
      searchCriteria = { since: sinceDate };
    } else {
      // First run: scan all, then dedupe by UID-based key
      searchCriteria = { all: true };
    }

    const sequenceNumbers = (await client.search(searchCriteria)).sort((a, b) => a - b);
    if (debug) {
      console.log('[IMAP] Search result', {
        criteria: searchCriteria,
        count: sequenceNumbers.length
      });
    }
    let processedCount = 0;

    for (const sequenceNumber of sequenceNumbers) {
      try {
        const message = await client.fetchOne(sequenceNumber, { source: true });
        if (!message || !message.source) {
          if (debug) {
            console.log('[IMAP] Skipped message: missing source', { sequenceNumber });
          }
          continue;
        }
        await processMessage({ ...message, uid: message.uid }, mailboxMeta);
        await client.messageFlagsAdd(sequenceNumber, ['\\Seen']);
        if (typeof message.uid === 'number' && message.uid > lastProcessedUid) {
          lastProcessedUid = message.uid;
        }
        processedCount += 1;
      } catch (error) {
        if (debug) {
          console.error('[IMAP] Failed to process message:', error.message);
        }
      }
    }

    if (!debug) {
      console.log(`[IMAP] Poll complete. New messages processed: ${processedCount}`);
    }
  } catch (error) {
    if (debug) {
      console.error('[IMAP] Poll error:', error.message);
    } else {
      console.log('[IMAP] Poll error');
    }
  } finally {
    try {
      await client.logout();
    } catch {
      // ignore
    }
    pollingInProgress = false;
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
