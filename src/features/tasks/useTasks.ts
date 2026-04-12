import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTaskInput, Task, TaskFilters, TaskStatus, UpdateTaskInput } from '../../types';
import * as tasksApi from './api';

const TASKS_KEY = 'tasks';

export function useTasks(projectId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: [TASKS_KEY, projectId, filters],
    queryFn: () => tasksApi.getTasks(projectId, filters),
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, input }: { projectId: string; input: CreateTaskInput }) =>
      tasksApi.createTask(projectId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY, variables.projectId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; projectId: string; input: UpdateTaskInput }) =>
      tasksApi.updateTask(taskId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY, variables.projectId] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { taskId: string; projectId: string; status: TaskStatus }) =>
      tasksApi.updateTask(payload.taskId, { status: payload.status }),
    onMutate: async ({ projectId, taskId, status }) => {
      const queryKey = [TASKS_KEY, projectId] as const;

      await queryClient.cancelQueries({ queryKey });

      const previousTaskQueries = queryClient.getQueriesData<Task[]>({ queryKey });

      previousTaskQueries.forEach(([currentKey, currentTasks]) => {
        if (!currentTasks) return;
        queryClient.setQueryData<Task[]>(
          currentKey,
          currentTasks.map((task) =>
            task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task
          )
        );
      });

      return { previousTaskQueries };
    },
    onError: (_err, _variables, context) => {
      if (!context?.previousTaskQueries) return;
      context.previousTaskQueries.forEach(([currentKey, currentTasks]) => {
        queryClient.setQueryData(currentKey, currentTasks);
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY, variables.projectId] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId }: { taskId: string; projectId: string }) =>
      tasksApi.deleteTask(taskId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY, variables.projectId] });
    },
  });
}
