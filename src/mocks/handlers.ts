import { http, HttpResponse } from 'msw';
import type {
  AuthResponse,
  LoginInput,
  Project,
  RegisterInput,
  Task,
  User,
} from '../types';
import { generateId } from '../lib/utils';
import { db, SEEDED_USER, SEEDED_PASSWORD } from './data';

function generateToken(): string {
  return `token_${generateId()}`;
}

function getAuthUser(request: Request): User | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  if (!token || token.length === 0) return null;
  return SEEDED_USER;
}

type ApiProject = {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  status: Project['status'];
};

type ApiTask = {
  id: string;
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  assignee_id: string | null;
  project_id: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};

type ApiCreateProjectInput = {
  name?: string;
  description?: string;
};

type ApiUpdateProjectInput = {
  name?: string;
  description?: string;
  status?: Project['status'];
};

type ApiCreateTaskInput = {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignee_id?: string | null;
  due_date?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
};

type ApiUpdateTaskInput = {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assignee_id?: string | null;
  due_date?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
};

function toApiProject(project: Project): ApiProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    owner_id: project.ownerId,
    created_at: project.createdAt,
    updated_at: project.updatedAt,
    status: project.status,
  };
}

function toApiTask(task: Task): ApiTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee_id: task.assigneeId,
    project_id: task.projectId,
    due_date: task.dueDate,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export const handlers = [
  // Auth
  http.post('*/auth/login', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const body = (await request.json()) as LoginInput;

    if (body.email !== SEEDED_USER.email || body.password !== SEEDED_PASSWORD) {
      return HttpResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = generateToken();
    db.tokens.add(token);
    const response: AuthResponse = { token, user: SEEDED_USER };
    return HttpResponse.json(response);
  }),

  http.post('*/auth/register', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const body = (await request.json()) as RegisterInput;

    const errors: Record<string, string> = {};
    if (!body.name || body.name.length < 2) errors.name = 'Name must be at least 2 characters';
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.email = 'Please enter a valid email address';
    if (!body.password || body.password.length < 8) errors.password = 'Password must be at least 8 characters';

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json({ error: 'validation failed', fields: errors }, { status: 400 });
    }

    if (body.email === SEEDED_USER.email) {
      return HttpResponse.json({ error: 'validation failed', fields: { email: 'Email already registered' } }, { status: 400 });
    }

    const user: User = { id: generateId(), name: body.name, email: body.email };
    db.users.set(user.id, user);
    const token = generateToken();
    db.tokens.add(token);

    const response: AuthResponse = { token, user };
    return HttpResponse.json(response, { status: 201 });
  }),

  // Projects
  http.get('*/projects', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const projects = Array.from(db.projects.values()).filter((p) => p.ownerId === user.id);
    return HttpResponse.json({ projects: projects.map(toApiProject) });
  }),

  http.post('*/projects', async ({ request }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = (await request.json()) as ApiCreateProjectInput;
    const errors: Record<string, string> = {};
    if (!body.name || body.name.length < 2) errors.name = 'Project name must be at least 2 characters';

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json({ error: 'validation failed', fields: errors }, { status: 400 });
    }

    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      name: body.name!,
      description: body.description ?? '',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      ownerId: user.id,
    };
    db.projects.set(project.id, project);
    return HttpResponse.json(toApiProject(project), { status: 201 });
  }),

  http.get('*/projects/:id', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = db.projects.get(params.id as string);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (project.ownerId !== user.id) return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    const tasks = Array.from(db.tasks.values()).filter((t) => t.projectId === project.id);
    return HttpResponse.json({
      ...toApiProject(project),
      tasks: tasks.map(toApiTask),
    });
  }),

  http.patch('*/projects/:id', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = db.projects.get(params.id as string);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (project.ownerId !== user.id) return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    const body = (await request.json()) as ApiUpdateProjectInput;
    const updates: Partial<Project> = {};

    if (body.name !== undefined) {
      if (body.name.length < 2) return HttpResponse.json({ error: 'validation failed', fields: { name: 'Name must be at least 2 characters' } }, { status: 400 });
      updates.name = body.name;
    }
    if (body.description !== undefined) {
      updates.description = body.description;
    }
    if (body.status !== undefined) updates.status = body.status;
    updates.updatedAt = new Date().toISOString();

    const updatedProject = { ...project, ...updates };
    db.projects.set(project.id, updatedProject);
    return HttpResponse.json(toApiProject(updatedProject));
  }),

  http.delete('*/projects/:id', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = db.projects.get(params.id as string);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (project.ownerId !== user.id) return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    const tasksToDelete = Array.from(db.tasks.values()).filter((t) => t.projectId === project.id);
    tasksToDelete.forEach((t) => db.tasks.delete(t.id));
    db.projects.delete(project.id);
    return new HttpResponse(null, { status: 204 });
  }),

  // Tasks
  http.get('*/projects/:id/tasks', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = db.projects.get(params.id as string);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (project.ownerId !== user.id) return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const assigneeFilter = url.searchParams.get('assignee');

    let tasks = Array.from(db.tasks.values()).filter((t) => t.projectId === project.id);
    if (statusFilter) tasks = tasks.filter((t) => t.status === statusFilter);
    if (assigneeFilter) {
      if (assigneeFilter === 'unassigned') {
        tasks = tasks.filter((t) => t.assigneeId === null);
      } else {
        tasks = tasks.filter((t) => t.assigneeId === assigneeFilter);
      }
    }

    return HttpResponse.json({ tasks: tasks.map(toApiTask) });
  }),

  http.post('*/projects/:id/tasks', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const project = db.projects.get(params.id as string);
    if (!project) return HttpResponse.json({ error: 'not found' }, { status: 404 });
    if (project.ownerId !== user.id) return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    const body = (await request.json()) as ApiCreateTaskInput;
    const errors: Record<string, string> = {};
    if (!body.title || body.title.length < 2) errors.title = 'Title must be at least 2 characters';
    if (!body.description || body.description.length < 5) errors.description = 'Description must be at least 5 characters';
    if (!body.priority || !['low', 'medium', 'high'].includes(body.priority)) errors.priority = 'Priority must be low, medium, or high';

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json({ error: 'validation failed', fields: errors }, { status: 400 });
    }

    const now = new Date().toISOString();
    const task: Task = {
      id: generateId(),
      title: body.title!,
      description: body.description!,
      status: body.status && ['todo', 'in_progress', 'done'].includes(body.status) ? body.status : 'todo',
      priority: body.priority!,
      assigneeId: body.assignee_id ?? body.assigneeId ?? null,
      projectId: project.id,
      dueDate: body.due_date ?? body.dueDate ?? null,
      createdAt: now,
      updatedAt: now,
    };
    db.tasks.set(task.id, task);
    return HttpResponse.json(toApiTask(task), { status: 201 });
  }),

  http.patch('*/tasks/:id', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const task = db.tasks.get(params.id as string);
    if (!task) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const project = db.projects.get(task.projectId);
    if (!project || project.ownerId !== user.id) return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    const body = (await request.json()) as ApiUpdateTaskInput;
    const updates: Partial<Task> = {};

    if (body.title !== undefined) {
      if (body.title.length < 2) return HttpResponse.json({ error: 'validation failed', fields: { title: 'Title must be at least 2 characters' } }, { status: 400 });
      updates.title = body.title;
    }
    if (body.description !== undefined) {
      if (body.description.length < 5) return HttpResponse.json({ error: 'validation failed', fields: { description: 'Description must be at least 5 characters' } }, { status: 400 });
      updates.description = body.description;
    }
    if (body.status !== undefined) updates.status = body.status;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.assignee_id !== undefined || body.assigneeId !== undefined) {
      updates.assigneeId = body.assignee_id ?? body.assigneeId ?? null;
    }
    if (body.due_date !== undefined || body.dueDate !== undefined) {
      updates.dueDate = body.due_date ?? body.dueDate ?? null;
    }
    updates.updatedAt = new Date().toISOString();

    const updatedTask = { ...task, ...updates };
    db.tasks.set(task.id, updatedTask);
    return HttpResponse.json(toApiTask(updatedTask));
  }),

  http.delete('*/tasks/:id', async ({ request, params }) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const user = getAuthUser(request);
    if (!user) return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });

    const task = db.tasks.get(params.id as string);
    if (!task) return HttpResponse.json({ error: 'not found' }, { status: 404 });

    const project = db.projects.get(task.projectId);
    if (!project || project.ownerId !== user.id) return HttpResponse.json({ error: 'forbidden' }, { status: 403 });

    db.tasks.delete(task.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
