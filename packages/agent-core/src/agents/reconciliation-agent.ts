/**
 * Reconciliation Agent - Bank transaction matching
 */

export class ReconciliationAgent {
  async getBankTransactions(accountId: string, filters: any) {
    // TODO: Delegate to MCP server
    throw new Error('Not yet implemented');
  }

  async reconcileTransaction(transactionId: string, invoiceId: string) {
    // TODO: Delegate to MCP server
    throw new Error('Not yet implemented');
  }

  async suggestMatches(transactionId: string) {
    // TODO: Use Claude to suggest invoice matches
    throw new Error('Not yet implemented');
  }
}
