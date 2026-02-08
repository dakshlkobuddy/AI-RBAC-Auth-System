const Contact = require('../models/Contact');
const Company = require('../models/Company');

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

// Delete contact
const deleteContact = async (contactId) => {
  try {
    const contact = await Contact.getContactById(contactId);
    if (!contact) {
      return { success: false, message: 'Contact not found' };
    }
    const [enquiryCount, ticketCount] = await Promise.all([
      Contact.countEnquiriesByContactId(contactId),
      Contact.countTicketsByContactId(contactId),
    ]);
    if (enquiryCount > 0 || ticketCount > 0) {
      return {
        success: false,
        message: 'Cannot delete contact with existing enquiries or support tickets',
        code: 'CONTACT_HAS_REFERENCES',
      };
    }
    await Contact.deleteContact(contactId);
    return { success: true, message: 'Contact deleted successfully' };
  } catch (error) {
    console.error('Delete contact error:', error);
    throw error;
  }
};

// Update contact
const updateContact = async (contactId, updates) => {
  try {
    const contact = await Contact.getContactById(contactId);
    if (!contact) {
      return { success: false, message: 'Contact not found' };
    }

    const name = (updates.name ?? contact.name)?.trim();
    const email = (updates.email ?? contact.email)?.trim();
    const phone = updates.phone ?? contact.phone;
    const customerType = (updates.customer_type ?? contact.customer_type)?.trim();
    const location = updates.location ?? contact.location;
    const productInterest = updates.product_interest ?? contact.product_interest;
    const companyName = (updates.company_name ?? contact.company_name ?? '').trim();
    let companyId = contact.company_id || null;

    if (companyName) {
      if (companyId) {
        const existingCompany = await Company.getCompanyById(companyId);
        const website = existingCompany?.website ?? null;
        await Company.updateCompany(companyId, companyName, website);
      } else {
        const createdCompany = await Company.createCompany(companyName, null);
        companyId = createdCompany.id;
      }
    }

    const updated = await Contact.updateContact(
      contactId,
      name,
      email,
      phone,
      customerType,
      location,
      productInterest,
      companyId
    );

    return { success: true, contact: updated };
  } catch (error) {
    console.error('Update contact error:', error);
    throw error;
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
};
