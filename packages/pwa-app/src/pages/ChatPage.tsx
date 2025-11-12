/**
 * Chat Page - Main conversation interface
 */

export function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-semibold text-gray-900">Xero Agent</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-gray-500 mt-20">
            <p>Chat interface coming soon...</p>
            <p className="text-sm mt-2">AI-powered accounting assistant for Xero</p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t p-4">
        <div className="max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="Ask me anything about your Xero accounting..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled
          />
        </div>
      </footer>
    </div>
  );
}
