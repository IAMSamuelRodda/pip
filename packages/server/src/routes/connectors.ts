/**
 * Connectors API Routes
 *
 * Unified endpoint for connector status and management.
 * Aggregates status from all OAuth providers (Xero, Gmail, Google Sheets).
 * Proactively refreshes expired tokens when possible.
 */

import { Router } from 'express';
import type { DatabaseProvider, OAuthTokens } from '@pip/core';
import { requireAuth } from '../middleware/auth.js';

export interface ConnectorStatus {
  connected: boolean;
  expired?: boolean;
  refreshFailed?: boolean;  // True if refresh was attempted but failed (needs reconnect)
  details?: string;  // tenantName for Xero, email for Google services
  expiresAt?: number;
}

export interface AllConnectorStatuses {
  xero: ConnectorStatus;
  gmail: ConnectorStatus;
  google_sheets: ConnectorStatus;
}

// Token refresh URLs
const XERO_TOKEN_URL = 'https://identity.xero.com/connect/token';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * Attempt to refresh an expired token
 * Returns updated tokens if successful, null if refresh failed
 */
async function refreshToken(
  tokens: OAuthTokens,
  db: DatabaseProvider
): Promise<OAuthTokens | null> {
  const { provider, refreshToken, userId } = tokens;

  try {
    let tokenResponse: Response;
    let tokenData: { access_token: string; refresh_token?: string; expires_in: number };

    if (provider === 'xero') {
      const clientId = process.env.XERO_CLIENT_ID;
      const clientSecret = process.env.XERO_CLIENT_SECRET;
      if (!clientId || !clientSecret) return null;

      tokenResponse = await fetch(XERO_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });
    } else if (provider === 'gmail' || provider === 'google_sheets') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) return null;

      tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
    } else {
      return null;
    }

    if (!tokenResponse.ok) {
      console.log(`Token refresh failed for ${provider}: ${tokenResponse.status}`);
      return null;
    }

    tokenData = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in: number };

    const updatedTokens: OAuthTokens = {
      ...tokens,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      updatedAt: Date.now(),
    };

    await db.saveOAuthTokens(updatedTokens);
    console.log(`✅ Proactively refreshed ${provider} token for user ${userId}`);

    return updatedTokens;
  } catch (error) {
    console.error(`Error refreshing ${provider} token:`, error);
    return null;
  }
}

/**
 * Build connector status, attempting refresh if expired
 */
async function getConnectorStatus(
  tokens: OAuthTokens | null,
  db: DatabaseProvider,
  detailsField: 'tenantName' | 'providerEmail'
): Promise<ConnectorStatus> {
  if (!tokens) {
    return { connected: false };
  }

  const now = Date.now();
  const isExpired = tokens.expiresAt < now;

  if (isExpired) {
    // Try to refresh the token
    const refreshedTokens = await refreshToken(tokens, db);

    if (refreshedTokens) {
      // Refresh succeeded
      return {
        connected: true,
        expired: false,
        details: refreshedTokens[detailsField],
        expiresAt: refreshedTokens.expiresAt,
      };
    } else {
      // Refresh failed - user needs to reconnect
      return {
        connected: true,
        expired: true,
        refreshFailed: true,
        details: tokens[detailsField],
        expiresAt: tokens.expiresAt,
      };
    }
  }

  // Token is still valid
  return {
    connected: true,
    expired: false,
    details: tokens[detailsField],
    expiresAt: tokens.expiresAt,
  };
}

export function createConnectorRoutes(db: DatabaseProvider): Router {
  const router = Router();

  /**
   * GET /api/connectors/status
   * Get status of all connectors for the authenticated user
   * Proactively refreshes expired tokens when possible
   */
  router.get('/status', requireAuth, async (req, res, next) => {
    try {
      const userId = req.userId!;

      // Fetch all OAuth tokens in parallel
      const [xeroTokens, gmailTokens, sheetsTokens] = await Promise.all([
        db.getOAuthTokens(userId, 'xero'),
        db.getOAuthTokens(userId, 'gmail'),
        db.getOAuthTokens(userId, 'google_sheets'),
      ]);

      // Build statuses with proactive refresh
      const [xeroStatus, gmailStatus, sheetsStatus] = await Promise.all([
        getConnectorStatus(xeroTokens, db, 'tenantName'),
        getConnectorStatus(gmailTokens, db, 'providerEmail'),
        getConnectorStatus(sheetsTokens, db, 'providerEmail'),
      ]);

      const statuses: AllConnectorStatuses = {
        xero: xeroStatus,
        gmail: gmailStatus,
        google_sheets: sheetsStatus,
      };

      res.json(statuses);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
