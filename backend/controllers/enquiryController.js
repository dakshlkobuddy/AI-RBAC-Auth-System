const Enquiry = require('../models/Enquiry');
const Contact = require('../models/Contact');
const { sendEmail } = require('../services/mailer');

/**
 * Get all enquiries
 */
const getAllEnquiries = async (req, res) => {
    try {
        const enquiries = await Enquiry.getAllEnquiries();

        const responseData = {
            success: true,
            count: enquiries.length,
            enquiries
        };

        if (res && typeof res.status === 'function') {
            return res.status(200).json(responseData);
        }
        
        return responseData; 
    } catch (error) {
        console.error('Error in getAllEnquiries:', error);
        if (res && typeof res.status === 'function') {
            return res.status(500).json({ success: false, error: error.message });
        }
        throw error;
    }
};

/**
 * Get enquiry by ID
 */
const getEnquiryById = async (req, res) => {
  try {
    const id = req.params ? req.params.id : req; 
    const enquiry = await Enquiry.getEnquiryById(id);
    
    if (!enquiry) {
      if (res && typeof res.status === 'function') {
          return res.status(404).json({ success: false, message: 'Enquiry not found' });
      }
      return { success: false, message: 'Enquiry not found' };
    }

    if (res && typeof res.status === 'function') {
        return res.status(200).json({ success: true, enquiry });
    }
    return { success: true, enquiry };
  } catch (error) {
    console.error('Get enquiry error:', error);
    if (res && typeof res.status === 'function') {
        return res.status(500).json({ success: false, error: error.message });
    }
    throw error;
  }
};

/**
 * Reply to an enquiry
 */
const replyEnquiry = async (enquiryId, reply) => {
  try {
    if (!reply || reply.trim() === '') {
      return { success: false, message: 'Reply message is required' };
    }

    const enquiry = await Enquiry.getEnquiryById(enquiryId);
    if (!enquiry) {
      return { success: false, message: 'Enquiry not found' };
    }

    const replySubject = `Re: ${enquiry.subject || 'Your enquiry'}`;
    await sendEmail({
      to: enquiry.contact_email,
      subject: replySubject,
      text: reply
    });

    const updatedEnquiry = await Enquiry.updateEnquiryReply(
      enquiryId,
      reply,
      new Date()
    );

    if (!updatedEnquiry) {
      return { success: false, message: 'Enquiry not found' };
    }

    return {
      success: true,
      message: 'Enquiry replied successfully',
      enquiry: updatedEnquiry,
    };
  } catch (error) {
    console.error('Reply enquiry error:', error);
    throw error;
  }
};

module.exports = {
  getAllEnquiries,
  getEnquiryById,
  replyEnquiry
};
