/**
 * Bank transaction tools for MCP server
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const bankTransactionTools: Tool[] = [
  {
    name: 'get_bank_transactions',
    description: 'Get bank transactions for a specific account',
    inputSchema: {
      type: 'object',
      properties: {
        accountId: {
          type: 'string',
          description: 'Bank account ID',
        },
        fromDate: {
          type: 'string',
          description: 'Start date (ISO format)',
        },
        toDate: {
          type: 'string',
          description: 'End date (ISO format)',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
          default: 1,
        },
      },
      required: ['accountId'],
    },
  },
  {
    name: 'create_bank_transaction',
    description: 'Create a new bank transaction',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['SPEND', 'RECEIVE'],
          description: 'Transaction type',
        },
        accountId: {
          type: 'string',
          description: 'Bank account ID',
        },
        date: {
          type: 'string',
          description: 'Transaction date (ISO format)',
        },
        description: {
          type: 'string',
          description: 'Transaction description',
        },
        amount: {
          type: 'number',
          description: 'Transaction amount',
        },
      },
      required: ['type', 'accountId', 'date', 'description', 'amount'],
    },
  },
  {
    name: 'reconcile_transaction',
    description: 'Reconcile a bank transaction with an invoice',
    inputSchema: {
      type: 'object',
      properties: {
        transactionId: {
          type: 'string',
          description: 'Bank transaction ID',
        },
        invoiceId: {
          type: 'string',
          description: 'Invoice ID to reconcile with',
        },
      },
      required: ['transactionId', 'invoiceId'],
    },
  },
];
