/**
 * List IMAP mailboxes for the configured account.
 */
const { ImapFlow } = require('imapflow');
require('dotenv').config({ path: 'backend/.env' });

function getImapConfig() {
  return {
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: Number(process.env.IMAP_PORT || 993),
    secure: String(process.env.IMAP_SECURE || 'true') === 'true',
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS,
    },
  };
}

async function main() {
  const config = getImapConfig();
  if (!config.auth.user || !config.auth.pass) {
    console.error('Missing IMAP_USER or IMAP_PASS in environment.');
    process.exit(1);
  }

  const client = new ImapFlow(config);
  try {
    await client.connect();
    const mailboxes = await client.list();
    console.log('IMAP Mailboxes:');
    for (const box of mailboxes) {
      console.log(`- ${box.path}`);
    }
  } catch (err) {
    console.error('Failed to list mailboxes:', err.message);
    process.exit(1);
  } finally {
    try {
      await client.logout();
    } catch {
      // ignore
    }
  }
}

main();
