/**
 * Project Store - Zustand state management for projects
 * Epic 2.3: Projects feature
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { projectApi } from '../api/client';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../api/client';

interface ProjectState {
  // Project list
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  // Current project selection (persisted)
  currentProjectId: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (projectId: string, input: UpdateProjectInput) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  setCurrentProject: (projectId: string | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      isLoading: false,
      error: null,
      currentProjectId: null,

      loadProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await projectApi.listProjects();
          const projects = result.projects;

          // If no current project is set, use the default or first project
          const currentId = get().currentProjectId;
          let newCurrentId = currentId;

          if (!currentId || !projects.find((p) => p.id === currentId)) {
            const defaultProject = projects.find((p) => p.isDefault);
            newCurrentId = defaultProject?.id || projects[0]?.id || null;
          }

          set({
            projects,
            currentProjectId: newCurrentId,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load projects',
          });
        }
      },

      createProject: async (input: CreateProjectInput) => {
        try {
          const project = await projectApi.createProject(input);
          set((state) => ({
            projects: [...state.projects, project],
          }));

          // If this is the first project, set it as current
          if (get().projects.length === 1) {
            set({ currentProjectId: project.id });
          }

          return project;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create project' });
          throw error;
        }
      },

      updateProject: async (projectId: string, input: UpdateProjectInput) => {
        try {
          const project = await projectApi.updateProject(projectId, input);
          set((state) => ({
            projects: state.projects.map((p) => (p.id === projectId ? project : p)),
          }));
          return project;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update project' });
          throw error;
        }
      },

      deleteProject: async (projectId: string) => {
        try {
          await projectApi.deleteProject(projectId);
          const newProjects = get().projects.filter((p) => p.id !== projectId);

          // If deleting current project, switch to another
          let newCurrentId = get().currentProjectId;
          if (newCurrentId === projectId) {
            const defaultProject = newProjects.find((p) => p.isDefault);
            newCurrentId = defaultProject?.id || newProjects[0]?.id || null;
          }

          set({
            projects: newProjects,
            currentProjectId: newCurrentId,
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete project' });
          throw error;
        }
      },

      setCurrentProject: (projectId: string | null) => {
        set({ currentProjectId: projectId });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'pip-project-store',
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
      }),
    }
  )
);

// Helper to get current project
export function useCurrentProject(): Project | undefined {
  const { projects, currentProjectId } = useProjectStore();
  return projects.find((p) => p.id === currentProjectId);
}
