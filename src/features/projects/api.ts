import { api } from '../../lib/api';
import type { CreateProjectInput, Project, Task, UpdateProjectInput } from '../../types';

interface ApiProject {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  created_at: string;
  updated_at?: string;
  status?: Project['status'];
}

interface ApiTask {
  id: string;
  title: string;
  description?: string;
  status: Task['status'];
  priority: Task['priority'];
  assignee_id: string | null;
  project_id: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

function mapProjectFromApi(project: ApiProject): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? '',
    ownerId: project.owner_id,
    createdAt: project.created_at,
    updatedAt: project.updated_at ?? project.created_at,
    status: project.status ?? 'active',
  };
}

function mapTaskFromApi(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    assigneeId: task.assignee_id,
    projectId: task.project_id,
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<{ projects: ApiProject[] }>('/projects');
  return data.projects.map(mapProjectFromApi);
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export async function getProject(id: string): Promise<ProjectWithTasks> {
  const { data } = await api.get<ApiProject & { tasks: ApiTask[] }>(`/projects/${id}`);
  return {
    ...mapProjectFromApi(data),
    tasks: data.tasks.map(mapTaskFromApi),
  };
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const payload = {
    name: input.name,
    description: input.description,
  };
  const { data } = await api.post<ApiProject>('/projects', payload);
  return mapProjectFromApi(data);
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const payload = {
    name: input.name,
    description: input.description,
    status: input.status,
  };
  const { data } = await api.patch<ApiProject>(`/projects/${id}`, payload);
  return mapProjectFromApi(data);
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}
