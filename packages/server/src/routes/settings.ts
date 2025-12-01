/**
 * User Settings Routes
 *
 * Handles safety settings and user preferences
 */

import { Router } from 'express';
import type { DatabaseProvider, PermissionLevel, PersonalityId } from '@pip/core';
import { personalities } from '@pip/core';
import { requireAuth } from '../middleware/auth.js';

export function createSettingsRoutes(db: DatabaseProvider): Router {
  const router = Router();

  /**
   * GET /api/personalities
   * Get available personality options
   */
  router.get('/personalities', requireAuth, (_req, res) => {
    const options = Object.entries(personalities).map(([id, p]) => ({
      id,
      name: p.name,
      description: p.description,
      greeting: p.speech.greetings[0],
    }));
    res.json({ personalities: options });
  });

  /**
   * GET /api/settings
   * Get current user settings
   */
  router.get('/', requireAuth, async (req, res, next) => {
    try {
      let settings = await db.getUserSettings(req.userId!);

      // Create default settings if none exist
      if (!settings) {
        settings = await db.upsertUserSettings({
          userId: req.userId!,
          permissionLevel: 0,
          requireConfirmation: true,
          dailyEmailSummary: true,
          require2FA: false,
          personality: 'adelaide',
        });
      }

      // Get personality info
      const personalityId = settings.personality || 'adelaide';
      const personality = personalities[personalityId as PersonalityId];

      res.json({
        settings: {
          permissionLevel: settings.permissionLevel,
          requireConfirmation: settings.requireConfirmation,
          dailyEmailSummary: settings.dailyEmailSummary,
          require2FA: settings.require2FA,
          vacationModeUntil: settings.vacationModeUntil,
          personality: personalityId,
        },
        personalityInfo: {
          name: personality.name,
          description: personality.description,
          greeting: personality.speech.greetings[0],
          role: personality.identity.role,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PUT /api/settings
   * Update user settings
   */
  router.put('/', requireAuth, async (req, res, next) => {
    try {
      const {
        permissionLevel,
        requireConfirmation,
        dailyEmailSummary,
        require2FA,
        vacationModeUntil,
        personality,
      } = req.body;

      // Validate permission level
      if (permissionLevel !== undefined) {
        if (![0, 1, 2, 3].includes(permissionLevel)) {
          return res.status(400).json({
            error: 'Invalid permission level. Must be 0, 1, 2, or 3.',
          });
        }
      }

      // Validate vacation mode date
      if (vacationModeUntil !== undefined && vacationModeUntil !== null) {
        if (typeof vacationModeUntil !== 'number' || vacationModeUntil < Date.now()) {
          return res.status(400).json({
            error: 'Vacation mode date must be in the future.',
          });
        }
      }

      // Validate personality
      if (personality !== undefined) {
        if (!Object.keys(personalities).includes(personality)) {
          return res.status(400).json({
            error: `Invalid personality. Must be one of: ${Object.keys(personalities).join(', ')}`,
          });
        }
      }

      const settings = await db.upsertUserSettings({
        userId: req.userId!,
        ...(permissionLevel !== undefined && { permissionLevel: permissionLevel as PermissionLevel }),
        ...(requireConfirmation !== undefined && { requireConfirmation }),
        ...(dailyEmailSummary !== undefined && { dailyEmailSummary }),
        ...(require2FA !== undefined && { require2FA }),
        ...(vacationModeUntil !== undefined && { vacationModeUntil: vacationModeUntil || undefined }),
        ...(personality !== undefined && { personality: personality as PersonalityId }),
      });

      console.log(`✅ Settings updated for user ${req.userId}: level=${settings.permissionLevel}, personality=${settings.personality}`);

      // Get personality info
      const personalityId = settings.personality || 'adelaide';
      const personalityData = personalities[personalityId as PersonalityId];

      res.json({
        settings: {
          permissionLevel: settings.permissionLevel,
          requireConfirmation: settings.requireConfirmation,
          dailyEmailSummary: settings.dailyEmailSummary,
          require2FA: settings.require2FA,
          vacationModeUntil: settings.vacationModeUntil,
          personality: personalityId,
        },
        personalityInfo: {
          name: personalityData.name,
          description: personalityData.description,
          greeting: personalityData.speech.greetings[0],
          role: personalityData.identity.role,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
