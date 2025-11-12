/**
 * Invoice Agent - Specialized sub-agent for invoice operations
 */

export class InvoiceAgent {
  async createInvoice(params: any) {
    // TODO: Delegate to MCP server via Lambda invocation
    throw new Error('Not yet implemented');
  }

  async updateInvoice(invoiceId: string, updates: any) {
    // TODO: Delegate to MCP server
    throw new Error('Not yet implemented');
  }

  async listInvoices(filters: any) {
    // TODO: Delegate to MCP server
    throw new Error('Not yet implemented');
  }

  async sendInvoice(invoiceId: string) {
    // TODO: Delegate to MCP server
    throw new Error('Not yet implemented');
  }
}
