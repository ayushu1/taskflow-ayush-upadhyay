import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useProject } from '../../features/projects/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from '../../features/tasks/useTasks';
import { useAuth } from '../../features/auth';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskForm } from '../../components/tasks/TaskForm';
import { getApiError } from '../../lib/api';
import type { Task, TaskStatus, TaskFilters } from '../../types';
import type { CreateTaskFormData } from '../../features/tasks/schemas';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const projectId = id || '';
  const currentUserId = user?.id || '';
  const currentUserName = user?.name || 'Me';

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(projectId);
  const [filters, setFilters] = useState<TaskFilters>({});
  const { data: tasks, isLoading: tasksLoading, error: tasksError } = useTasks(projectId, filters);

  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask();
  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutateAsync: deleteTask, isPending: isDeleting } = useDeleteTask();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string>('');
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const normalizeTaskInput = (data: CreateTaskFormData): CreateTaskFormData => ({
    ...data,
    assigneeId: data.assigneeId || null,
    dueDate: data.dueDate || null,
  });

  const handleOpenCreate = () => {
    setEditingTask(null);
    setError('');
    setServerErrors({});
    setOpenDialog(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setError('');
    setServerErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
    setError('');
    setServerErrors({});
  };

  const handleCreateTask = async (data: CreateTaskFormData) => {
    setError('');
    setServerErrors({});

    try {
      await createTask({ projectId, input: normalizeTaskInput(data) });
      handleCloseDialog();
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError.fields) {
        setServerErrors(apiError.fields);
      } else {
        setError(apiError.error || 'Failed to create task');
      }
    }
  };

  const handleUpdateTask = async (data: CreateTaskFormData) => {
    if (!editingTask) return;
    setError('');
    setServerErrors({});

    try {
      await updateTask({ taskId: editingTask.id, projectId, input: normalizeTaskInput(data) });
      handleCloseDialog();
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError.fields) {
        setServerErrors(apiError.fields);
      } else {
        setError(apiError.error || 'Failed to update task');
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask({ taskId, projectId });
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    updateTaskStatus({ taskId, projectId, status });
  };

  const isSubmitting = isCreating || isUpdating;

  if (projectLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={150} />
      </Container>
    );
  }

  if (projectError || !project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Project not found or failed to load.</Alert>
      </Container>
    );
  }

  const groupedTasks = {
    todo: tasks?.filter((t) => t.status === 'todo') || [],
    in_progress: tasks?.filter((t) => t.status === 'in_progress') || [],
    done: tasks?.filter((t) => t.status === 'done') || [],
  };

  const taskCount = tasks?.length || 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink
          component="button"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/projects')}
        >
          Projects
        </MuiLink>
        <Typography color="text.primary">{project.name}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <IconButton onClick={() => navigate('/projects')} sx={{ mt: 0.5 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" component="h1">
                {project.name}
              </Typography>
              <Chip
                label={project.status}
                color={project.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Typography variant="body1" color="text.secondary">
              {project.description || 'No description provided.'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          Tasks ({taskCount})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status Filter"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: (e.target.value as TaskStatus) || undefined,
                }))
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="todo">To Do</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Assignee Filter</InputLabel>
            <Select
              value={filters.assignee || ''}
              label="Assignee Filter"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  assignee: e.target.value || undefined,
                }))
              }
            >
              <MenuItem value="">All</MenuItem>
              {currentUserId && <MenuItem value={currentUserId}>Assigned to me</MenuItem>}
              <MenuItem value="unassigned">Unassigned</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleOpenCreate}>
            Add Task
          </Button>
        </Box>
      </Box>

      {tasksLoading ? (
        <Skeleton variant="rectangular" height={400} />
      ) : tasksError ? (
        <Alert severity="error">Failed to load tasks. Please try again.</Alert>
      ) : filters.status ? (
        <Box>
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            <Alert severity="info">No tasks match the selected filter.</Alert>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {(['todo', 'in_progress', 'done'] as const).map((status) => {
            const statusTasks = groupedTasks[status];
            const statusLabels: Record<string, string> = {
              todo: 'To Do',
              in_progress: 'In Progress',
              done: 'Done',
            };
            const statusColors: Record<string, 'default' | 'primary' | 'success'> = {
              todo: 'default',
              in_progress: 'primary',
              done: 'success',
            };

            return (
              <Box key={status}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Chip
                    label={statusLabels[status]}
                    color={statusColors[status]}
                    sx={{ fontWeight: 500 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {statusTasks.length}
                  </Typography>
                </Box>
                {statusTasks.length > 0 ? (
                  statusTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    No tasks
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <TaskForm
          task={editingTask}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          serverErrors={serverErrors}
          submitError={error}
          isSubmitting={isSubmitting || isDeleting}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCloseDialog}
        />
      </Dialog>
    </Container>
  );
}
