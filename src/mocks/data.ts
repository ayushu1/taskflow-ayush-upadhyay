import type { User, Project, Task } from '../types';

// Stable IDs for seeded data so they persist across page reloads
const SEEDED_USER_ID = 'user-001-test-seed';
const PROJECT_1_ID = 'proj-001-website-redesign';
const PROJECT_2_ID = 'proj-002-mobile-app';
const PROJECT_3_ID = 'proj-003-api-migration';

export const SEEDED_USER: User = {
  id: SEEDED_USER_ID,
  name: 'Test User',
  email: 'test@example.com',
};

export const SEEDED_PASSWORD = 'password123';

const now = new Date().toISOString();

export const initialProjects: Project[] = [
  {
    id: PROJECT_1_ID,
    name: 'Website Redesign',
    description: 'Redesign the company website with modern aesthetics and improved UX',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    ownerId: SEEDED_USER.id,
  },
  {
    id: PROJECT_2_ID,
    name: 'Mobile App Development',
    description: 'Build a React Native mobile app for iOS and Android',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    ownerId: SEEDED_USER.id,
  },
  {
    id: PROJECT_3_ID,
    name: 'API Migration',
    description: 'Migrate legacy REST APIs to GraphQL',
    status: 'archived',
    createdAt: now,
    updatedAt: now,
    ownerId: SEEDED_USER.id,
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task-001-homepage-mockups',
    title: 'Design homepage mockups',
    description: 'Create Figma mockups for the new homepage design',
    status: 'done',
    priority: 'high',
    assigneeId: SEEDED_USER.id,
    projectId: PROJECT_1_ID,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-002-navigation',
    title: 'Implement navigation component',
    description: 'Build responsive navigation with mobile hamburger menu',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: SEEDED_USER.id,
    projectId: PROJECT_1_ID,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-003-setup-repo',
    title: 'Setup project repository',
    description: 'Initialize React Native project with proper folder structure',
    status: 'done',
    priority: 'high',
    assigneeId: SEEDED_USER.id,
    projectId: PROJECT_2_ID,
    dueDate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-004-db-schema',
    title: 'Design database schema',
    description: 'Plan and document the database schema for the mobile app',
    status: 'todo',
    priority: 'high',
    assigneeId: null,
    projectId: PROJECT_2_ID,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-005-auth-screens',
    title: 'Authentication screens',
    description: 'Build login and signup screens with form validation',
    status: 'todo',
    priority: 'medium',
    assigneeId: SEEDED_USER.id,
    projectId: PROJECT_2_ID,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'task-006-audit-endpoints',
    title: 'Audit existing endpoints',
    description: 'Document all current REST endpoints and their usage',
    status: 'done',
    priority: 'low',
    assigneeId: SEEDED_USER.id,
    projectId: PROJECT_3_ID,
    dueDate: null,
    createdAt: now,
    updatedAt: now,
  },
];

export const db = {
  users: new Map<string, User>([[SEEDED_USER.id, SEEDED_USER]]),
  projects: new Map<string, Project>(),
  tasks: new Map<string, Task>(),
  tokens: new Set<string>(),

  initialize() {
    initialProjects.forEach((project) => {
      this.projects.set(project.id, project);
    });
    initialTasks.forEach((task) => {
      this.tasks.set(task.id, task);
    });
  },

  reset() {
    this.users.clear();
    this.projects.clear();
    this.tasks.clear();
    this.tokens.clear();
    this.users.set(SEEDED_USER.id, SEEDED_USER);
    this.initialize();
  },
};

db.initialize();
