const Enquiry = require('../models/Enquiry');
const { ENQUIRY_STATUS } = require('../config/constants');

// Get all enquiries
const getAllEnquiries = async () => {
  try {
    const enquiries = await Enquiry.getAllEnquiries();
    return {
      success: true,
      enquiries,
    };
  } catch (error) {
    console.error('Get enquiries error:', error);
    throw error;
  }
};

// Get enquiry by ID
const getEnquiryById = async (enquiryId) => {
  try {
    const enquiry = await Enquiry.getEnquiryById(enquiryId);
    if (!enquiry) {
      return { success: false, message: 'Enquiry not found' };
    }
    return {
      success: true,
      enquiry,
    };
  } catch (error) {
    console.error('Get enquiry error:', error);
    throw error;
  }
};

// Reply to enquiry (update AI reply and mark as replied)
const replyEnquiry = async (enquiryId, reply) => {
  try {
    if (!reply || reply.trim() === '') {
      return { success: false, message: 'Reply message is required' };
    }

    const updatedEnquiry = await Enquiry.updateEnquiryReply(
      enquiryId,
      reply,
      new Date()
    );

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
  replyEnquiry,
};
