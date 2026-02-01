const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Create a new company
const createCompany = async (companyName, website) => {
  const companyId = uuidv4();
  const query = `
    INSERT INTO companies (id, company_name, website, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, company_name, website, created_at
  `;
  const result = await pool.query(query, [companyId, companyName, website]);
  return result.rows[0];
};

// Get company by ID
const getCompanyById = async (companyId) => {
  const query = `SELECT * FROM companies WHERE id = $1`;
  const result = await pool.query(query, [companyId]);
  return result.rows[0];
};

// Get all companies
const getAllCompanies = async () => {
  const query = `SELECT * FROM companies ORDER BY created_at DESC`;
  const result = await pool.query(query);
  return result.rows;
};

// Update company
const updateCompany = async (companyId, companyName, website) => {
  const query = `
    UPDATE companies
    SET company_name = $1, website = $2
    WHERE id = $3
    RETURNING id, company_name, website, created_at
  `;
  const result = await pool.query(query, [companyName, website, companyId]);
  return result.rows[0];
};

module.exports = {
  createCompany,
  getCompanyById,
  getAllCompanies,
  updateCompany,
};
