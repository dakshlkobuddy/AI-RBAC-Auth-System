/**
 * AI Simulation Service
 * Uses rule-based keyword detection to identify intent and generate replies
 * No paid APIs - all logic is rule-based and deterministic
 * 
 * AI Responsibilities:
 * 1. Detect intent (ENQUIRY or SUPPORT) from email subject + message
 * 2. Generate professional, human-like reply drafts
 * 3. Analyze sentiment (score + label)
 * 4. Never send emails or change status automatically
 * 4. Only provide suggestions for humans to review/edit
 */

// Intent types
const INTENT_TYPE = {
  ENQUIRY: 'enquiry',
  SUPPORT: 'support',
  OTHER: 'other'
};

// ================================================================
// INTENT DETECTION
// ================================================================

/**
 * Keywords that indicate SUPPORT intent
 * Issue, error, problem, urgent requests, etc.
 */
const SUPPORT_KEYWORDS = [
  'issue', 'error', 'problem', 'not working', 'broken',
  'bug', 'crash', 'fail', 'failed', 'down', 'offline',
  'can\'t', 'cannot', 'doesn\'t work', 'doesn\'t', 'doesn\'t',
  'trouble', 'urgent', 'asap', 'help', 'support',
  'complaint', 'refund', 'return', 'uninstall', 'delete',
  'login issue', 'access denied', 'error code', 'exception'
];

/**
 * Keywords that indicate ENQUIRY intent
 * Pricing, features, information requests, interest, etc.
 */
const ENQUIRY_KEYWORDS = [
  'pricing', 'price', 'cost', 'quote', 'quotation',
  'plan', 'package', 'feature', 'features', 'information',
  'details', 'demo', 'trial', 'free', 'interested', 'inquire',
  'product', 'service', 'offer', 'how much', 'what is',
  'capability', 'integration', 'how does', 'does it',
  'custom', 'enterprise', 'upgrade', 'downgrade'
];

/**
 * Detect intent from email message using keyword matching
 * Returns: 'support', 'enquiry', or 'other'
 */
function detectIntent(message) {
  if (!message || typeof message !== 'string') {
    return INTENT_TYPE.OTHER;
  }

  const lowerMessage = message.toLowerCase();
  let supportScore = 0;
  let enquiryScore = 0;

  // Count support keyword matches
  SUPPORT_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      supportScore++;
    }
  });

  // Count enquiry keyword matches
  ENQUIRY_KEYWORDS.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      enquiryScore++;
    }
  });

  // Decision logic
  // If support keywords found and score is higher, classify as support
  if (supportScore > enquiryScore && supportScore > 0) {
    return INTENT_TYPE.SUPPORT;
  }
  // If enquiry keywords found, classify as enquiry
  else if (enquiryScore > 0) {
    return INTENT_TYPE.ENQUIRY;
  }
  // Default to other
  else {
    return INTENT_TYPE.OTHER;
  }
}

// ================================================================
// SENTIMENT ANALYSIS (NLP)
// ================================================================
const Sentiment = require('sentiment');
const sentiment = new Sentiment();

function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { score: 0, label: 'neutral' };
  }
  const result = sentiment.analyze(text);
  // Normalize to -1..+1 range
  const normalized = Math.max(-1, Math.min(1, result.score / 10));
  let label = 'neutral';
  if (normalized > 0.1) label = 'positive';
  else if (normalized < -0.1) label = 'negative';
  return {
    score: Number(normalized.toFixed(2)),
    label
  };
}

// ================================================================
// REPLY GENERATION
// ================================================================

/**
 * Professional reply templates for ENQUIRY intents
 * AI will randomly select one greeting, one body, one closing
 */
const ENQUIRY_TEMPLATES = {
  greetings: [
    "Thank you for reaching out to us!",
    "We appreciate your interest in our products and services.",
    "Thank you for your inquiry!",
    "We're delighted to hear from you.",
    "Thank you for contacting us."
  ],
  bodies: [
    "We're excited to help you learn more about our solutions. Our team can provide detailed information about our pricing, features, and customization options tailored to your specific needs.",
    "Your interest is important to us. We offer a range of plans and features designed to meet diverse business requirements.",
    "We would love to discuss how our products can help solve your business challenges. We have several options available.",
    "We're confident our solutions can add significant value to your organization. Let us know what specific information would be most helpful.",
    "Our team specializes in providing solutions that align with your business goals. We're here to answer any questions you have."
  ],
  closings: [
    "Please reply to this email with any questions, or feel free to schedule a demo with our team at your convenience.",
    "We'd be happy to arrange a personalized demonstration. Just let us know what works best for your schedule.",
    "Feel free to reach out anytime if you need more information. We're here to help you succeed.",
    "Our sales team is ready to discuss how we can best serve your organization. Looking forward to hearing from you.",
    "Please don't hesitate to contact us. We're committed to finding the perfect solution for you."
  ]
};

/**
 * Professional reply templates for SUPPORT intents
 * AI will randomly select one greeting, one body, one closing
 */
const SUPPORT_TEMPLATES = {
  greetings: [
    "Thank you for reaching out to our support team.",
    "We're here to help resolve your issue quickly.",
    "We appreciate you bringing this to our attention.",
    "Thank you for reporting this issue.",
    "We take your concern seriously."
  ],
  bodies: [
    "We understand the urgency of resolving this. Our technical team is reviewing your case and will provide a solution shortly.",
    "We're committed to getting you back up and running as quickly as possible. Our experts are investigating this right now.",
    "Thank you for the detailed information. Our team will analyze this and provide you with next steps soon.",
    "We take all technical issues seriously. Our support team will work with you to resolve this promptly.",
    "Your case has been logged with our support team. We'll investigate and provide a resolution strategy within 24 hours."
  ],
  closings: [
    "If you need immediate assistance, please don't hesitate to contact our support hotline: +1-800-SUPPORT.",
    "We'll keep you updated on progress. Feel free to reply with any additional details that might help.",
    "Your satisfaction is our priority. We'll work with you until this is fully resolved.",
    "Please monitor your email for updates. We'll reach out with more information soon.",
    "We appreciate your patience. Our team is fully committed to resolving this issue for you."
  ]
};

/**
 * Generate professional AI reply draft based on intent
 * Uses randomized templates to create human-like responses
 * 
 * @param {string} contactName - Name of the person
 * @param {string} intent - Intent type: 'enquiry' or 'support'
 * @returns {string} Professional reply draft
 */
function generateAIReply(contactName, intent) {
  // Select appropriate templates
  const templates = intent === INTENT_TYPE.SUPPORT ? SUPPORT_TEMPLATES : ENQUIRY_TEMPLATES;

  // Randomly select one option from each section
  const greeting = selectRandom(templates.greetings);
  const body = selectRandom(templates.bodies);
  const closing = selectRandom(templates.closings);

  // Compose the reply
  const reply = `Dear ${contactName},

${greeting} We received your message and we're reviewing it carefully.

${body}

${closing}

Best regards,
Customer Support Team
Email-Based CRM System`;

  return reply;
}

/**
 * Utility: Select random item from array
 */
function selectRandom(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

// ================================================================
// EMAIL PROCESSING ORCHESTRATION
// ================================================================

/**
 * Process an incoming email
 * This is the main entry point for AI processing
 * 
 * @param {object} emailData - Email details
 * @param {string} emailData.fromEmail - Sender email
 * @param {string} emailData.fromName - Sender name
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.message - Email body/message
 * @returns {object} Processing result with intent, aiReply, and sentiment
 */
async function processIncomingEmail(emailData) {
  const { fromEmail, fromName, subject, message } = emailData;

  // Validate input
  if (!fromEmail || !subject || !message) {
    throw new Error('Missing required email fields: fromEmail, subject, message');
  }

  const combinedText = `${subject}\n${message}`;

  // Run Ollama for intent + extraction + reply
  const aiStructured = await analyzeEmailWithOllama({
    fromName,
    subject,
    message
  });

  const ollamaIntent = aiStructured?.intent;
  const intent = ollamaIntent === INTENT_TYPE.ENQUIRY || ollamaIntent === INTENT_TYPE.SUPPORT
    ? ollamaIntent
    : detectIntent(combinedText);

  // Sentiment analysis
  const sentimentResult = analyzeSentiment(combinedText);

  // Generate professional reply draft
  const aiReply = aiStructured?.reply?.trim()
    ? aiStructured.reply.trim()
    : generateAIReply(
        fromName || fromEmail.split('@')[0],
        intent
      );

  const extracted = normalizeExtractedDetails(
    aiStructured?.details || {},
    fromName,
    fromEmail,
    message
  );

  return {
    intent,
    aiReply,
    confidence: calculateConfidence(combinedText, intent),
    sentiment: sentimentResult,
    extracted
  };
}

/**
 * Calculate confidence score for the intent detection
 * Higher score = more confident in the detection
 */
function calculateConfidence(message, intent) {
  const lowerMessage = message.toLowerCase();
  const keywords = intent === INTENT_TYPE.SUPPORT ? SUPPORT_KEYWORDS : ENQUIRY_KEYWORDS;

  let matchCount = 0;
  keywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) matchCount++;
  });

  // Calculate as percentage of keywords found
  const confidence = Math.min((matchCount / keywords.length) * 100, 100);
  return Math.round(confidence * 10) / 10; // Round to 1 decimal
}

// ================================================================
// OLLAMA INTENT DETECTION
// ================================================================
async function detectIntentWithOllama(text) {
  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    const prompt = `
You are an intent classifier.
Classify the user's email into exactly one of these intents: "enquiry" or "support".
Return ONLY valid JSON like: {"intent":"enquiry"} or {"intent":"support"}.
Email:
${text}
`;
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      return INTENT_TYPE.OTHER;
    }

    const data = await response.json();
    const raw = (data.response || '').trim();
    const parsed = safeJsonParse(raw);
    const intent = parsed?.intent;
    if (intent === INTENT_TYPE.ENQUIRY || intent === INTENT_TYPE.SUPPORT) {
      return intent;
    }
    return INTENT_TYPE.OTHER;
  } catch (error) {
    return INTENT_TYPE.OTHER;
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractPhoneFromText(text) {
  if (!text) return '';
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return phoneMatch ? phoneMatch[1].trim() : '';
}

function normalizeExtractedDetails(details, fromName, fromEmail, message) {
  const name = details.name?.trim() || (fromName || fromEmail.split('@')[0]).trim();
  const phone = details.phone?.trim() || extractPhoneFromText(message);
  const companyName = details.company_name?.trim() || '';
  const location = details.location?.trim() || '';
  const productInterest = details.product_interest?.trim() || '';

  return {
    name,
    phone,
    company_name: companyName,
    location,
    product_interest: productInterest
  };
}

async function analyzeEmailWithOllama({ fromName, subject, message }) {
  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
    const prompt = `
You are an assistant for a CRM system.
Task: classify intent, extract details, and draft a reply based on the email.
Return ONLY valid JSON with this schema:
{
  "intent": "enquiry" | "support",
  "details": {
    "name": "",
    "phone": "",
    "company_name": "",
    "location": "",
    "product_interest": ""
  },
  "reply": ""
}

Rules:
- intent must be exactly "enquiry" or "support"
- keep values empty string if unknown
- reply must be specific to the email content and not generic
- include at least 2 concrete details from the email if available
- avoid templated phrases like "Thank you for reaching out" unless the email is very short

Sender name: ${fromName || ''}
Subject: ${subject}
Message: ${message}
`;

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const raw = (data.response || '').trim();
    const parsed = safeJsonParse(raw);
    if (!parsed || !parsed.intent || !parsed.details || !parsed.reply) {
      return null;
    }
    return parsed;
  } catch (error) {
    return null;
  }
}

module.exports = {
  // Main processing function
  processIncomingEmail,

  // Intent detection
  detectIntent,

  // Reply generation
  generateAIReply,

  // Constants
  INTENT_TYPE,
  SUPPORT_KEYWORDS,
  ENQUIRY_KEYWORDS,

  // Utilities
  selectRandom,
  calculateConfidence,
  analyzeSentiment
};
