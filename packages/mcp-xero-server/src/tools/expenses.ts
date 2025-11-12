/**
 * Expense tracking tools for MCP server
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const expenseTools: Tool[] = [
  {
    name: 'create_expense',
    description: 'Create a new expense record',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Expense date (ISO format)',
        },
        description: {
          type: 'string',
          description: 'Expense description',
        },
        amount: {
          type: 'number',
          description: 'Expense amount',
        },
        category: {
          type: 'string',
          description: 'Expense category/account code',
        },
        receipt: {
          type: 'string',
          description: 'Receipt attachment URL or base64 data',
        },
      },
      required: ['date', 'description', 'amount'],
    },
  },
  {
    name: 'categorize_expense',
    description: 'Categorize an existing expense',
    inputSchema: {
      type: 'object',
      properties: {
        expenseId: {
          type: 'string',
          description: 'Expense ID',
        },
        category: {
          type: 'string',
          description: 'New category/account code',
        },
      },
      required: ['expenseId', 'category'],
    },
  },
  {
    name: 'list_expenses',
    description: 'List expenses with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        fromDate: {
          type: 'string',
          description: 'Start date (ISO format)',
        },
        toDate: {
          type: 'string',
          description: 'End date (ISO format)',
        },
        category: {
          type: 'string',
          description: 'Filter by category',
        },
        page: {
          type: 'number',
          description: 'Page number for pagination',
          default: 1,
        },
      },
    },
  },
];
