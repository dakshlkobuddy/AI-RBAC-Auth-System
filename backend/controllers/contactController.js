const Contact = require('../models/Contact');

// Get all contacts (Admin only)
const getAllContacts = async () => {
  try {
    const contacts = await Contact.getAllContacts();
    return {
      success: true,
      contacts,
    };
  } catch (error) {
    console.error('Get contacts error:', error);
    throw error;
  }
};

// Get contact by ID
const getContactById = async (contactId) => {
  try {
    const contact = await Contact.getContactById(contactId);
    if (!contact) {
      return { success: false, message: 'Contact not found' };
    }
    return {
      success: true,
      contact,
    };
  } catch (error) {
    console.error('Get contact error:', error);
    throw error;
  }
};

module.exports = {
  getAllContacts,
  getContactById,
};
