// User Roles
const ROLES = {
  ADMIN: 'admin',
  MARKETING: 'marketing',
  SUPPORT: 'support',
};

// Permissions
const PERMISSIONS = {
  CREATE_USER: 'CREATE_USER',
  VIEW_USERS: 'VIEW_USERS',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  VIEW_ENQUIRIES: 'VIEW_ENQUIRIES',
  REPLY_ENQUIRY: 'REPLY_ENQUIRY',
  VIEW_TICKETS: 'VIEW_TICKETS',
  REPLY_TICKET: 'REPLY_TICKET',
};

// Role-Permission Mapping
const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_ENQUIRIES,
    PERMISSIONS.REPLY_ENQUIRY,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.REPLY_TICKET,
  ],
  marketing: [
    PERMISSIONS.VIEW_ENQUIRIES,
    PERMISSIONS.REPLY_ENQUIRY,
  ],
  support: [
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.REPLY_TICKET,
  ],
};

// Enquiry Status
const ENQUIRY_STATUS = {
  NEW: 'new',
  REPLIED: 'replied',
  CLOSED: 'closed',
};

// Ticket Status
const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
};

// Customer Type
const CUSTOMER_TYPE = {
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  CLIENT: 'client',
};

// Intent Types
const INTENT_TYPE = {
  ENQUIRY: 'enquiry',
  SUPPORT: 'support',
  OTHER: 'other',
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ENQUIRY_STATUS,
  TICKET_STATUS,
  CUSTOMER_TYPE,
  INTENT_TYPE,
};
