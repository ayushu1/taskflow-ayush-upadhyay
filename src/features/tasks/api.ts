import { api } from '../../lib/api';
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from '../../types';

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

function mapCreateTaskToApi(input: CreateTaskInput) {
  return {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    assignee_id: input.assigneeId,
    due_date: input.dueDate,
  };
}

function mapUpdateTaskToApi(input: UpdateTaskInput) {
  return {
    title: input.title,
    description: input.description,
    status: input.status,
    priority: input.priority,
    assignee_id: input.assigneeId,
    due_date: input.dueDate,
  };
}

export async function getTasks(projectId: string, filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.assignee) params.append('assignee', filters.assignee);

  const query = params.toString();
  const url = query ? `/projects/${projectId}/tasks?${query}` : `/projects/${projectId}/tasks`;

  const { data } = await api.get<{ tasks: ApiTask[] }>(url);
  return data.tasks.map(mapTaskFromApi);
}

export async function createTask(projectId: string, input: CreateTaskInput): Promise<Task> {
  const { data } = await api.post<ApiTask>(`/projects/${projectId}/tasks`, mapCreateTaskToApi(input));
  return mapTaskFromApi(data);
}

export async function updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
  const { data } = await api.patch<ApiTask>(`/tasks/${taskId}`, mapUpdateTaskToApi(input));
  return mapTaskFromApi(data);
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}
