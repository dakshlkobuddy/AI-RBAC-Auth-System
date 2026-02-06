/**
 * Marketing Controller
 * Handles marketing user requests for enquiries and dashboard stats
 */

const MarketingEnquiry = require('../models/MarketingEnquiry');
const Contact = require('../models/Contact');
const { generateAIReply } = require('../services/aiService');
const { sendEmail } = require('../services/mailer');

/**
 * Get dashboard statistics
 * Shows total, new, and replied enquiries
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await MarketingEnquiry.getDashboardStats();
    
    res.status(200).json({
      success: true,
      data: {
        totalEnquiries: stats.total_enquiries || 0,
        newEnquiries: stats.new_enquiries || 0,
        repliedEnquiries: stats.replied_enquiries || 0
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard statistics'
    });
  }
};

/**
 * Get all enquiries for marketing user
 * Returns list of enquiries with company and contact details
 */
exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await MarketingEnquiry.getAllEnquiries();
    
    res.status(200).json({
      success: true,
      data: enquiries
    });
  } catch (error) {
    console.error('Error getting enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enquiries'
    });
  }
};

/**
 * Get single enquiry details
 * Returns complete enquiry information with AI reply
 */
exports.getEnquiryDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await MarketingEnquiry.getEnquiryById(id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    // If no AI reply yet, generate one
    if (!enquiry.ai_reply) {
      enquiry.ai_reply = generateAIReply(enquiry.message);
    }
    
    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error('Error getting enquiry details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enquiry details'
    });
  }
};

/**
 * Send reply to an enquiry
 * Updates enquiry with reply, changes status to 'replied'
 * Upgrades customer_type from prospect to customer
 */
exports.sendEnquiryReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    // Validate reply
    if (!reply || reply.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply cannot be empty'
      });
    }
    
    // Get enquiry to check current state
    const enquiry = await MarketingEnquiry.getEnquiryById(id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    // Send reply email
    const replySubject = `Re: ${enquiry.subject || 'Your enquiry'}`;
    await sendEmail({
      to: enquiry.email || enquiry.contact_email,
      subject: replySubject,
      text: reply
    });

    // Update enquiry with reply and change status to replied
    const updatedEnquiry = await MarketingEnquiry.updateEnquiryReply(id, reply);

    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: updatedEnquiry
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
};

/**
 * Close an enquiry
 * Changes status from replied to closed
 */
exports.closeEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const enquiry = await MarketingEnquiry.getEnquiryById(id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    // Update status to closed
    const updatedEnquiry = await MarketingEnquiry.closeEnquiry(id);

    // Upgrade customer type if needed
    if (enquiry.contact_customer_type === 'prospect') {
      try {
        await MarketingEnquiry.updateCustomerType(enquiry.contact_id, 'customer');
      } catch (updateError) {
        console.error('Failed to update customer type on close:', updateError);
      }
    }

    // Promote to client if eligible
    try {
      await Contact.promoteToClientIfEligible(enquiry.contact_id);
    } catch (updateError) {
      console.error('Failed to evaluate client promotion:', updateError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Enquiry closed successfully',
      data: updatedEnquiry
    });
  } catch (error) {
    console.error('Error closing enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to close enquiry'
    });
  }
};

/**
 * Delete an enquiry
 */
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await MarketingEnquiry.getEnquiryById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    await MarketingEnquiry.deleteEnquiry(id);

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry'
    });
  }
};
