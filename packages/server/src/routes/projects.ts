/**
 * Project Management Routes
 *
 * Handles project CRUD operations for isolated context containers
 * Epic 2.3: Projects feature
 */

import { Router } from 'express';
import type { DatabaseProvider, Project } from '@pip/core';

// Predefined project colors (hex values for UI badges)
const PROJECT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

export function createProjectRoutes(db: DatabaseProvider): Router {
  const router = Router();

  /**
   * GET /api/projects
   * List all projects for a user
   */
  router.get('/', async (req, res, next) => {
    try {
      const userId = req.userId!;
      const projects = await db.listProjects(userId);

      res.json({
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          color: p.color,
          xeroTenantId: p.xeroTenantId,
          isDefault: p.isDefault,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/projects/colors
   * Get available project colors for the UI
   */
  router.get('/colors', (_req, res) => {
    res.json({ colors: PROJECT_COLORS });
  });

  /**
   * POST /api/projects
   * Create a new project
   */
  router.post('/', async (req, res, next) => {
    try {
      const userId = req.userId!;
      const { name, description, color, xeroTenantId, isDefault } = req.body;

      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'Project name is required' });
        return;
      }

      // Validate color if provided
      if (color && !PROJECT_COLORS.includes(color) && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        res.status(400).json({ error: 'Invalid color format. Use hex color code.' });
        return;
      }

      const project = await db.createProject({
        userId,
        name: name.trim().substring(0, 100),
        description: description?.trim()?.substring(0, 500),
        color: color || PROJECT_COLORS[0],
        xeroTenantId: xeroTenantId?.trim(),
        isDefault: isDefault === true,
      });

      res.status(201).json({
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        xeroTenantId: project.xeroTenantId,
        isDefault: project.isDefault,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/projects/:id
   * Get a specific project
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const userId = req.userId!;
      const { id: projectId } = req.params;

      const project = await db.getProject(userId, projectId);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json({
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        xeroTenantId: project.xeroTenantId,
        isDefault: project.isDefault,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  });

  /**
   * PATCH /api/projects/:id
   * Update a project
   */
  router.patch('/:id', async (req, res, next) => {
    try {
      const userId = req.userId!;
      const { id: projectId } = req.params;
      const { name, description, color, xeroTenantId, isDefault } = req.body;

      // Validate name if provided
      if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        res.status(400).json({ error: 'Project name cannot be empty' });
        return;
      }

      // Validate color if provided
      if (color && !PROJECT_COLORS.includes(color) && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        res.status(400).json({ error: 'Invalid color format. Use hex color code.' });
        return;
      }

      const updates: Partial<Project> = {};
      if (name !== undefined) updates.name = name.trim().substring(0, 100);
      if (description !== undefined) updates.description = description?.trim()?.substring(0, 500);
      if (color !== undefined) updates.color = color;
      if (xeroTenantId !== undefined) updates.xeroTenantId = xeroTenantId?.trim();
      if (isDefault !== undefined) updates.isDefault = isDefault === true;

      const updated = await db.updateProject(userId, projectId, updates);

      res.json({
        id: updated.id,
        name: updated.name,
        description: updated.description,
        color: updated.color,
        xeroTenantId: updated.xeroTenantId,
        isDefault: updated.isDefault,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      });
    } catch (error: any) {
      if (error.name === 'RecordNotFoundError') {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      next(error);
    }
  });

  /**
   * DELETE /api/projects/:id
   * Delete a project
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      const userId = req.userId!;
      const { id: projectId } = req.params;

      // Prevent deleting the last project
      const projects = await db.listProjects(userId);
      if (projects.length <= 1) {
        res.status(400).json({ error: 'Cannot delete your only project' });
        return;
      }

      await db.deleteProject(userId, projectId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/projects/:id/set-default
   * Set a project as the default
   */
  router.post('/:id/set-default', async (req, res, next) => {
    try {
      const userId = req.userId!;
      const { id: projectId } = req.params;

      const updated = await db.updateProject(userId, projectId, { isDefault: true });

      res.json({
        id: updated.id,
        isDefault: updated.isDefault,
      });
    } catch (error: any) {
      if (error.name === 'RecordNotFoundError') {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      next(error);
    }
  });

  return router;
}
