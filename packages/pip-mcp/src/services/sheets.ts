/**
 * Google Sheets Service for MCP Remote Server
 *
 * Handles Google Sheets API interactions with token management.
 * Uses spreadsheets scope (full read/write) and drive.readonly scope (for search).
 */

import { google, sheets_v4, drive_v3 } from "googleapis";
import { createDatabaseProvider, type OAuthTokens, type DatabaseProvider } from "@pip/core";

// Google OAuth configuration
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

// Initialize database provider (SQLite by default)
const dbPath = process.env.DATABASE_PATH || "./data/pip.db";
let db: DatabaseProvider;

// Initialize database (called at startup)
async function initDatabase(): Promise<void> {
  if (!db) {
    db = await createDatabaseProvider({
      provider: "sqlite",
      connection: { type: "sqlite", filename: dbPath },
    });
  }
}

// Ensure database is initialized before use
async function getDb(): Promise<DatabaseProvider> {
  if (!db) {
    await initDatabase();
  }
  return db;
}

export interface SheetsClient {
  sheets: sheets_v4.Sheets;
  drive: drive_v3.Drive;
  email: string;
}

/**
 * Get Sheets client with valid tokens for a user
 */
export async function getSheetsClient(userId: string): Promise<SheetsClient | null> {
  try {
    const database = await getDb();
    // Get tokens from database
    let tokens = await database.getOAuthTokens(userId, "google_sheets");

    if (!tokens) {
      return null;
    }

    // Check if token needs refresh (5-minute buffer)
    if (tokens.expiresAt < Date.now() + 5 * 60 * 1000) {
      tokens = await refreshSheetsTokens(tokens);
      if (!tokens) {
        return null;
      }
    }

    // Initialize Sheets client with OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    return {
      sheets,
      drive,
      email: tokens.providerEmail || "unknown",
    };
  } catch (error) {
    console.error("Error getting Sheets client:", error);
    return null;
  }
}

/**
 * Refresh expired Sheets tokens
 * Note: In Testing Mode, refresh tokens expire after 7 days
 */
async function refreshSheetsTokens(tokens: OAuthTokens): Promise<OAuthTokens | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Google OAuth not configured");
    return null;
  }

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: tokens.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Check for expired refresh token (Testing Mode: 7 days)
      if (response.status === 400 && errorText.includes("invalid_grant")) {
        console.error("Sheets refresh token expired (Testing Mode: 7-day limit). User needs to reconnect.");
        return null;
      }
      console.error("Sheets token refresh failed:", errorText);
      return null;
    }

    const data = await response.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    const updatedTokens: OAuthTokens = {
      ...tokens,
      accessToken: data.access_token,
      // Google may return a new refresh token
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
      updatedAt: Date.now(),
    };

    const database = await getDb();
    await database.saveOAuthTokens(updatedTokens);
    console.log(`Sheets tokens refreshed for user ${tokens.userId}`);

    return updatedTokens;
  } catch (error) {
    console.error("Error refreshing Sheets tokens:", error);
    return null;
  }
}

/**
 * Check if a user has Google Sheets connected
 */
export async function isSheetsConnected(userId: string): Promise<boolean> {
  const database = await getDb();
  const tokens = await database.getOAuthTokens(userId, "google_sheets");
  return tokens !== null;
}

/**
 * Get Sheets connection status for a user
 */
export async function getSheetsStatus(userId: string): Promise<{
  connected: boolean;
  email?: string;
  expired?: boolean;
}> {
  const database = await getDb();
  const tokens = await database.getOAuthTokens(userId, "google_sheets");

  if (!tokens) {
    return { connected: false };
  }

  return {
    connected: true,
    email: tokens.providerEmail,
    expired: tokens.expiresAt < Date.now(),
  };
}

// ============================================================================
// Google Sheets API Helper Functions
// ============================================================================

export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
  createdTime?: string;
  modifiedTime?: string;
  sheets?: SheetInfo[];
}

export interface SheetInfo {
  sheetId: number;
  title: string;
  index: number;
  rowCount?: number;
  columnCount?: number;
}

export interface CellValue {
  value: string | number | boolean | null;
  formattedValue?: string;
}

export interface RangeData {
  range: string;
  values: CellValue[][];
  rowCount: number;
  columnCount: number;
}

/**
 * Search for spreadsheets by name
 */
export async function searchSpreadsheets(
  client: SheetsClient,
  query: string,
  maxResults: number = 20
): Promise<SpreadsheetInfo[]> {
  const response = await client.drive.files.list({
    q: `mimeType='application/vnd.google-apps.spreadsheet' and name contains '${query.replace(/'/g, "\\'")}'`,
    fields: "files(id, name, webViewLink, createdTime, modifiedTime)",
    pageSize: maxResults,
    orderBy: "modifiedTime desc",
  });

  const files = response.data.files || [];
  return files.map((file) => ({
    id: file.id!,
    name: file.name!,
    url: file.webViewLink!,
    createdTime: file.createdTime || undefined,
    modifiedTime: file.modifiedTime || undefined,
  }));
}

/**
 * Get spreadsheet metadata including all sheets
 */
export async function getSpreadsheetMetadata(
  client: SheetsClient,
  spreadsheetId: string
): Promise<SpreadsheetInfo | null> {
  try {
    const response = await client.sheets.spreadsheets.get({
      spreadsheetId,
      fields: "spreadsheetId,properties.title,spreadsheetUrl,sheets.properties",
    });

    const data = response.data;
    return {
      id: data.spreadsheetId!,
      name: data.properties?.title || "Untitled",
      url: data.spreadsheetUrl!,
      sheets: (data.sheets || []).map((sheet) => ({
        sheetId: sheet.properties?.sheetId || 0,
        title: sheet.properties?.title || "Sheet",
        index: sheet.properties?.index || 0,
        rowCount: sheet.properties?.gridProperties?.rowCount ?? undefined,
        columnCount: sheet.properties?.gridProperties?.columnCount ?? undefined,
      })),
    };
  } catch (error) {
    console.error("Error getting spreadsheet metadata:", error);
    return null;
  }
}

/**
 * Read data from a range
 */
export async function readRange(
  client: SheetsClient,
  spreadsheetId: string,
  range: string
): Promise<RangeData | null> {
  try {
    const response = await client.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: "FORMATTED_VALUE",
    });

    const values = response.data.values || [];
    return {
      range: response.data.range || range,
      values: values.map((row) =>
        row.map((cell) => ({
          value: cell,
          formattedValue: String(cell),
        }))
      ),
      rowCount: values.length,
      columnCount: values.length > 0 ? Math.max(...values.map((r) => r.length)) : 0,
    };
  } catch (error) {
    console.error("Error reading range:", error);
    return null;
  }
}

/**
 * Write data to a range
 */
export async function writeRange(
  client: SheetsClient,
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean | null)[][]
): Promise<{ updatedRange: string; updatedRows: number; updatedColumns: number } | null> {
  try {
    const response = await client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    return {
      updatedRange: response.data.updatedRange || range,
      updatedRows: response.data.updatedRows || 0,
      updatedColumns: response.data.updatedColumns || 0,
    };
  } catch (error) {
    console.error("Error writing range:", error);
    return null;
  }
}

/**
 * Append rows to a sheet
 */
export async function appendRows(
  client: SheetsClient,
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean | null)[][]
): Promise<{ updatedRange: string; updatedRows: number } | null> {
  try {
    const response = await client.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values,
      },
    });

    return {
      updatedRange: response.data.updates?.updatedRange || range,
      updatedRows: response.data.updates?.updatedRows || 0,
    };
  } catch (error) {
    console.error("Error appending rows:", error);
    return null;
  }
}

/**
 * Update a single cell
 */
export async function updateCell(
  client: SheetsClient,
  spreadsheetId: string,
  cell: string,
  value: string | number | boolean | null
): Promise<boolean> {
  try {
    await client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cell,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[value]],
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating cell:", error);
    return false;
  }
}

/**
 * Create a new spreadsheet
 */
export async function createSpreadsheet(
  client: SheetsClient,
  title: string,
  sheetTitles?: string[]
): Promise<SpreadsheetInfo | null> {
  try {
    const sheets = sheetTitles?.map((title, index) => ({
      properties: { title, index },
    })) || [{ properties: { title: "Sheet1", index: 0 } }];

    const response = await client.sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets,
      },
    });

    return {
      id: response.data.spreadsheetId!,
      name: response.data.properties?.title || title,
      url: response.data.spreadsheetUrl!,
      sheets: (response.data.sheets || []).map((sheet) => ({
        sheetId: sheet.properties?.sheetId || 0,
        title: sheet.properties?.title || "Sheet",
        index: sheet.properties?.index || 0,
      })),
    };
  } catch (error) {
    console.error("Error creating spreadsheet:", error);
    return null;
  }
}

/**
 * Add a new sheet to an existing spreadsheet
 */
export async function addSheet(
  client: SheetsClient,
  spreadsheetId: string,
  title: string
): Promise<SheetInfo | null> {
  try {
    const response = await client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title },
            },
          },
        ],
      },
    });

    const reply = response.data.replies?.[0]?.addSheet;
    if (!reply?.properties) {
      return null;
    }

    return {
      sheetId: reply.properties.sheetId || 0,
      title: reply.properties.title || title,
      index: reply.properties.index || 0,
    };
  } catch (error) {
    console.error("Error adding sheet:", error);
    return null;
  }
}

/**
 * Delete a sheet from a spreadsheet
 */
export async function deleteSheet(
  client: SheetsClient,
  spreadsheetId: string,
  sheetId: number
): Promise<boolean> {
  try {
    await client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteSheet: { sheetId },
          },
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting sheet:", error);
    return false;
  }
}

/**
 * Clear a range of cells
 */
export async function clearRange(
  client: SheetsClient,
  spreadsheetId: string,
  range: string
): Promise<boolean> {
  try {
    await client.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });
    return true;
  } catch (error) {
    console.error("Error clearing range:", error);
    return false;
  }
}

/**
 * Delete rows from a sheet
 */
export async function deleteRows(
  client: SheetsClient,
  spreadsheetId: string,
  sheetId: number,
  startIndex: number,
  endIndex: number
): Promise<boolean> {
  try {
    await client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex,
                endIndex,
              },
            },
          },
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting rows:", error);
    return false;
  }
}

/**
 * Delete columns from a sheet
 */
export async function deleteColumns(
  client: SheetsClient,
  spreadsheetId: string,
  sheetId: number,
  startIndex: number,
  endIndex: number
): Promise<boolean> {
  try {
    await client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "COLUMNS",
                startIndex,
                endIndex,
              },
            },
          },
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting columns:", error);
    return false;
  }
}

/**
 * Move a spreadsheet to trash
 */
export async function trashSpreadsheet(
  client: SheetsClient,
  spreadsheetId: string
): Promise<boolean> {
  try {
    await client.drive.files.update({
      fileId: spreadsheetId,
      requestBody: {
        trashed: true,
      },
    });
    return true;
  } catch (error) {
    console.error("Error trashing spreadsheet:", error);
    return false;
  }
}

/**
 * List all sheets in a spreadsheet
 */
export async function listSheets(
  client: SheetsClient,
  spreadsheetId: string
): Promise<SheetInfo[]> {
  try {
    const response = await client.sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties",
    });

    return (response.data.sheets || []).map((sheet) => ({
      sheetId: sheet.properties?.sheetId || 0,
      title: sheet.properties?.title || "Sheet",
      index: sheet.properties?.index || 0,
      rowCount: sheet.properties?.gridProperties?.rowCount ?? undefined,
      columnCount: sheet.properties?.gridProperties?.columnCount ?? undefined,
    }));
  } catch (error) {
    console.error("Error listing sheets:", error);
    return [];
  }
}

/**
 * Get revision history for a spreadsheet (via Drive API)
 */
export async function getSpreadsheetRevisions(
  client: SheetsClient,
  spreadsheetId: string,
  maxResults: number = 10
): Promise<Array<{
  id: string;
  modifiedTime: string;
  lastModifyingUser?: string;
}>> {
  try {
    const response = await client.drive.revisions.list({
      fileId: spreadsheetId,
      fields: "revisions(id, modifiedTime, lastModifyingUser/displayName)",
      pageSize: maxResults,
    });

    return (response.data.revisions || []).map((rev) => ({
      id: rev.id!,
      modifiedTime: rev.modifiedTime || "",
      lastModifyingUser: rev.lastModifyingUser?.displayName ?? undefined,
    }));
  } catch (error) {
    console.error("Error getting revisions:", error);
    return [];
  }
}
