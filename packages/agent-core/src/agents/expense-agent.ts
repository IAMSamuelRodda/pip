/**
 * Expense Agent - Expense tracking and categorization
 */

export class ExpenseAgent {
  async createExpense(data: any) {
    // TODO: Delegate to MCP server
    throw new Error('Not yet implemented');
  }

  async categorizeExpense(expenseId: string, category: string) {
    // TODO: Delegate to MCP server
    throw new Error('Not yet implemented');
  }

  async suggestCategory(expenseDescription: string) {
    // TODO: Use Claude to suggest appropriate category
    throw new Error('Not yet implemented');
  }

  async listExpenses(filters: any) {
    // TODO: Delegate to MCP server
    throw new Error('Not yet implemented');
  }
}
