/**
 * Invoice management tools for MCP server
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const invoiceTools: Tool[] = [
  {
    name: 'create_invoice',
    description: 'Create a new invoice in Xero',
    inputSchema: {
      type: 'object',
      properties: {
        contactName: {
          type: 'string',
          description: 'Name of the contact/customer',
        },
        contactEmail: {
          type: 'string',
          description: 'Email address of the contact',
        },
        invoiceNumber: {
          type: 'string',
          description: 'Invoice number (optional, auto-generated if not provided)',
        },
        date: {
          type: 'string',
          description: 'Invoice date in ISO format (YYYY-MM-DD)',
        },
        dueDate: {
          type: 'string',
          description: 'Due date in ISO format (YYYY-MM-DD)',
        },
        lineItems: {
          type: 'array',
          description: 'Array of line items',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              quantity: { type: 'number' },
              unitAmount: { type: 'number' },
              accountCode: { type: 'string' },
              taxType: { type: 'string' },
            },
            required: ['description', 'quantity', 'unitAmount'],
          },
        },
      },
      required: ['contactName', 'date', 'lineItems'],
    },
  },
  {
    name: 'get_invoice',
    description: 'Get details of a specific invoice by ID',
    inputSchema: {
      type: 'object',
      properties: {
        invoiceId: {
          type: 'string',
          description: 'Xero invoice ID',
        },
      },
      required: ['invoiceId'],
    },
  },
  {
    name: 'update_invoice',
    description: 'Update an existing invoice',
    inputSchema: {
      type: 'object',
      properties: {
        invoiceId: {
          type: 'string',
          description: 'Xero invoice ID',
        },
        data: {
          type: 'object',
          description: 'Fields to update (same structure as create_invoice)',
        },
      },
      required: ['invoiceId', 'data'],
    },
  },
  {
    name: 'list_invoices',
    description: 'List invoices with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['DRAFT', 'SUBMITTED', 'AUTHORISED', 'PAID', 'VOIDED'],
          description: 'Filter by invoice status',
        },
        contactName: {
          type: 'string',
          description: 'Filter by contact name',
        },
        fromDate: {
          type: 'string',
          description: 'Start date filter (ISO format)',
        },
        toDate: {
          type: 'string',
          description: 'End date filter (ISO format)',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
          default: 1,
        },
      },
    },
  },
  {
    name: 'send_invoice',
    description: 'Send an invoice to the customer via email',
    inputSchema: {
      type: 'object',
      properties: {
        invoiceId: {
          type: 'string',
          description: 'Xero invoice ID',
        },
      },
      required: ['invoiceId'],
    },
  },
];
