/**
 * Email Controller
 * Handles incoming email processing through AI simulation
 * 
 * Flow:
 * 1. Receive email data (from, subject, message)
 * 2. Run AI intent detection
 * 3. Generate AI reply draft
 * 4. Create/identify contact and company
 * 5. Save to appropriate table (enquiry or support_ticket)
 * 6. Return result for display in dashboards
 */

const aiService = require('../services/aiService');
const Email = require('../models/Email');
const crypto = require('crypto');

/**
 * Process incoming email
 * 
 * This is the main entry point for email intake
 * AI runs automatically but never sends emails or changes status
 * Only marketing/support users can send replies through dashboards
 */
exports.receiveEmail = async (req, res) => {
  try {
    const { fromEmail, fromName, subject, message } = req.body;

    // Validate required fields
    if (!fromEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fromEmail, subject, message'
      });
    }

    // Step 1: Run AI to detect intent and generate reply
    const aiResult = await aiService.processIncomingEmail({
      fromEmail,
      fromName,
      subject,
      message
    });

    // Step 2: Save email to database (creates contact, company if needed)
    const saveResult = await Email.saveIncomingEmail({
      fromEmail,
      fromName,
      subject,
      message,
      sentimentScore: aiResult.sentiment?.score,
      sentimentLabel: aiResult.sentiment?.label,
      intent: aiResult.intent,
      aiReply: aiResult.aiReply,
      confidence: aiResult.confidence
    });

    // Return result
    res.status(200).json({
      success: true,
      message: 'Email processed successfully by AI',
      data: {
        ...saveResult.data,
        aiProcessing: {
          intent: aiResult.intent,
          confidence: aiResult.confidence,
          draftReply: aiResult.aiReply,
          sentiment: aiResult.sentiment
        }
      }
    });
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process email',
      error: error.message
    });
  }
};

/**
 * Process inbound email webhook from Mailgun
 *
 * Expects application/x-www-form-urlencoded payload
 * Uses MAILGUN_API_KEY (optional) to verify signature if provided
 */
exports.receiveMailgunWebhook = async (req, res) => {
  try {
    const signature = req.body?.signature;
    const timestamp = req.body?.timestamp;
    const token = req.body?.token;

    if (process.env.MAILGUN_API_KEY && signature && timestamp && token) {
      const hmac = crypto
        .createHmac('sha256', process.env.MAILGUN_API_KEY)
        .update(timestamp + token)
        .digest('hex');

      if (hmac !== signature) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Mailgun signature'
        });
      }
    }

    const fromHeader = req.body?.from || '';
    const sender = req.body?.sender || '';
    const fromEmail = extractEmail(sender || fromHeader);
    const fromName = extractName(fromHeader) || fromEmail?.split('@')[0] || 'Customer';
    const subject = req.body?.subject || '(no subject)';
    const message =
      req.body?.['body-plain'] ||
      req.body?.['stripped-text'] ||
      req.body?.['body-html'] ||
      '';

    if (!fromEmail || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in Mailgun payload'
      });
    }

    const phone = extractPhone(message);

    const aiResult = await aiService.processIncomingEmail({
      fromEmail,
      fromName,
      subject,
      message
    });

    const saveResult = await Email.saveIncomingEmail({
      fromEmail,
      fromName,
      phone,
      subject,
      message,
      sentimentScore: aiResult.sentiment?.score,
      sentimentLabel: aiResult.sentiment?.label,
      intent: aiResult.intent,
      aiReply: aiResult.aiReply,
      confidence: aiResult.confidence
    });

    res.status(200).json({
      success: true,
      message: 'Mailgun webhook processed successfully',
      data: {
        ...saveResult.data,
        aiProcessing: {
          intent: aiResult.intent,
          confidence: aiResult.confidence,
          draftReply: aiResult.aiReply,
          sentiment: aiResult.sentiment
        }
      }
    });
  } catch (error) {
    console.error('Error processing Mailgun webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Mailgun webhook',
      error: error.message
    });
  }
};

function extractEmail(value) {
  if (!value) return '';
  const match = value.match(/<([^>]+)>/);
  if (match && match[1]) return match[1].trim();
  const emailMatch = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return emailMatch ? emailMatch[0] : value.trim();
}

function extractName(value) {
  if (!value) return '';
  const match = value.match(/^(.*?)\s*</);
  return match ? match[1].trim().replace(/(^"|"$)/g, '') : '';
}

function extractPhone(text) {
  if (!text) return null;
  const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return phoneMatch ? phoneMatch[1].trim() : null;
}
/**
 * Get email processing history
 * Shows all processed emails (enquiries and support tickets)
 * 
 * Permissions:
 * - Admin: can view all
 * - Marketing: can view only enquiries
 * - Support: can view only support tickets
 */
exports.getProcessingHistory = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const user = req.user; // From auth middleware

    let history = await Email.getProcessingHistory(parseInt(limit));

    // Filter based on user role
    if (user.role === 'marketing') {
      history = history.filter(item => item.type === 'enquiry');
    } else if (user.role === 'support') {
      history = history.filter(item => item.type === 'support');
    }
    // Admin sees all

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error getting processing history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get processing history'
    });
  }
};

/**
 * Get AI processing statistics
 * Shows counts of processed emails
 * 
 * Only accessible to admin
 */
exports.getProcessingStats = async (req, res) => {
  try {
    const stats = await Email.getProcessingStats();

    res.status(200).json({
      success: true,
      data: {
        totalEnquiriesProcessed: stats.total_enquiries_processed,
        totalSupportProcessed: stats.total_support_processed,
        newEnquiries: stats.new_enquiries,
        openTickets: stats.open_tickets
      }
    });
  } catch (error) {
    console.error('Error getting processing stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get processing statistics'
    });
  }
};

/**
 * Test AI intent detection
 * Endpoint for testing the AI without saving to database
 * 
 * Useful for debugging and understanding AI behavior
 */
exports.testIntentDetection = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message field is required'
      });
    }

    // Run AI detection only
    const intent = aiService.detectIntent(message);
    const confidence = aiService.calculateConfidence(message, intent);

    // Get example keywords that matched
    const messageWords = message.toLowerCase().split(/\s+/);
    const matchedSupportKeywords = messageWords.filter(word => 
      aiService.SUPPORT_KEYWORDS.includes(word)
    );
    const matchedEnquiryKeywords = messageWords.filter(word => 
      aiService.ENQUIRY_KEYWORDS.includes(word)
    );

    res.status(200).json({
      success: true,
      data: {
        intent,
        confidence,
        matchedSupportKeywords: [...new Set(matchedSupportKeywords)],
        matchedEnquiryKeywords: [...new Set(matchedEnquiryKeywords)],
        explanation: `AI detected intent as "${intent}" with ${confidence}% confidence based on keyword analysis.`
      }
    });
  } catch (error) {
    console.error('Error testing intent detection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test intent detection'
    });
  }
};

/**
 * Test AI reply generation
 * Endpoint for testing reply generation without saving
 * 
 * Useful for previewing what AI will generate
 */
exports.testReplyGeneration = async (req, res) => {
  try {
    const { contactName, intent } = req.body;

    if (!contactName || !intent) {
      return res.status(400).json({
        success: false,
        message: 'contactName and intent are required'
      });
    }

    // Validate intent
    if (!['enquiry', 'support'].includes(intent)) {
      return res.status(400).json({
        success: false,
        message: 'Intent must be "enquiry" or "support"'
      });
    }

    // Generate multiple replies to show variety
    const replies = [];
    for (let i = 0; i < 3; i++) {
      replies.push(aiService.generateAIReply(contactName, intent));
    }

    res.status(200).json({
      success: true,
      data: {
        intent,
        contactName,
        sampleReplies: replies,
        explanation: 'AI generates professional replies using randomized templates. Each generation may differ slightly.'
      }
    });
  } catch (error) {
    console.error('Error testing reply generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test reply generation'
    });
  }
};
