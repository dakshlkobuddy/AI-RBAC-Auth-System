const SupportTicket = require('../models/SupportTicket');
const Contact = require('../models/Contact');
const { TICKET_STATUS } = require('../config/constants');

// Get all support tickets
const getAllTickets = async () => {
  try {
    const tickets = await SupportTicket.getAllTickets();
    return {
      success: true,
      tickets,
    };
  } catch (error) {
    console.error('Get tickets error:', error);
    throw error;
  }
};

// Get ticket by ID
const getTicketById = async (ticketId) => {
  try {
    const ticket = await SupportTicket.getTicketById(ticketId);
    if (!ticket) {
      return { success: false, message: 'Ticket not found' };
    }
    return {
      success: true,
      ticket,
    };
  } catch (error) {
    console.error('Get ticket error:', error);
    throw error;
  }
};

// Reply to support ticket
const replyTicket = async (ticketId, reply) => {
  try {
    if (!reply || reply.trim() === '') {
      return { success: false, message: 'Reply message is required' };
    }

    const updatedTicket = await SupportTicket.updateTicketReply(
      ticketId,
      reply,
      new Date()
    );

    return {
      success: true,
      message: 'Ticket replied successfully',
      ticket: updatedTicket,
    };
  } catch (error) {
    console.error('Reply ticket error:', error);
    throw error;
  }
};

// Resolve support ticket and update customer type
const resolveTicket = async (ticketId) => {
  try {
    const ticket = await SupportTicket.getTicketById(ticketId);
    if (!ticket) {
      return { success: false, message: 'Ticket not found' };
    }

    const updatedTicket = await SupportTicket.updateTicketStatus(
      ticketId,
      TICKET_STATUS.RESOLVED
    );

    if (ticket.customer_type === 'prospect') {
      try {
        await Contact.updateCustomerType(ticket.contact_id, 'customer');
        await SupportTicket.updateTicketCustomerType(ticketId, 'customer');
      } catch (updateError) {
        console.error('Failed to update customer type on resolve:', updateError);
      }
    }

    // Promote to client if eligible
    try {
      const promotion = await Contact.promoteToClientIfEligible(ticket.contact_id);
      if (promotion.updated) {
        await SupportTicket.updateTicketCustomerType(ticketId, 'client');
      }
    } catch (updateError) {
      console.error('Failed to evaluate client promotion:', updateError);
    }

    return {
      success: true,
      message: 'Ticket resolved successfully',
      ticket: updatedTicket,
    };
  } catch (error) {
    console.error('Resolve ticket error:', error);
    throw error;
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  replyTicket,
  resolveTicket,
};
