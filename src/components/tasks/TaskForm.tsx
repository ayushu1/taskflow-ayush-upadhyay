import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  DialogActions,
  DialogContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import type { Task } from '../../types';
import { createTaskSchema, type CreateTaskFormData } from '../../features/tasks/schemas';

interface TaskFormProps {
  task?: Task | null;
  currentUserId: string;
  currentUserName: string;
  serverErrors?: Record<string, string>;
  submitError?: string;
  isSubmitting: boolean;
  onSubmit: (data: CreateTaskFormData) => void;
  onCancel: () => void;
}

export function TaskForm({
  task,
  currentUserId,
  currentUserName,
  serverErrors,
  submitError,
  isSubmitting,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setValue,
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assigneeId: null,
      dueDate: '',
    },
  });

  useEffect(() => {
    if (task) {
      setValue('title', task.title);
      setValue('description', task.description);
      setValue('status', task.status);
      setValue('priority', task.priority);
      setValue('assigneeId', task.assigneeId);
      const formattedDate = task.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : '';
      setValue('dueDate', formattedDate);
    } else {
      reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assigneeId: null,
        dueDate: '',
      });
    }
  }, [task, setValue, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogContent>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Title"
          margin="normal"
          {...register('title')}
          error={!!errors.title || !!serverErrors?.title}
          helperText={errors.title?.message || serverErrors?.title}
          disabled={isSubmitting}
        />

        <TextField
          fullWidth
          label="Description"
          margin="normal"
          multiline
          rows={3}
          {...register('description')}
          error={!!errors.description || !!serverErrors?.description}
          helperText={errors.description?.message || serverErrors?.description}
          disabled={isSubmitting}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.status || !!serverErrors?.status}
            >
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                {...field}
                labelId="status-label"
                label="Status"
                disabled={isSubmitting}
                value={field.value || 'todo'}
              >
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
              <FormHelperText>{errors.status?.message || serverErrors?.status}</FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.priority || !!serverErrors?.priority}
            >
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                {...field}
                labelId="priority-label"
                label="Priority"
                disabled={isSubmitting}
                value={field.value || 'medium'}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
              <FormHelperText>
                {errors.priority?.message || serverErrors?.priority}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="assigneeId"
          control={control}
          render={({ field }) => (
            <FormControl
              fullWidth
              margin="normal"
              error={!!errors.assigneeId || !!serverErrors?.assignee_id || !!serverErrors?.assigneeId}
            >
              <InputLabel id="assignee-label">Assignee</InputLabel>
              <Select
                labelId="assignee-label"
                label="Assignee"
                value={field.value ?? 'unassigned'}
                onChange={(event) => {
                  const selected = event.target.value;
                  field.onChange(selected === 'unassigned' ? null : selected);
                }}
                disabled={isSubmitting}
              >
                {currentUserId && <MenuItem value={currentUserId}>{currentUserName}</MenuItem>}
                <MenuItem value="unassigned">Unassigned</MenuItem>
              </Select>
              <FormHelperText>
                {errors.assigneeId?.message || serverErrors?.assignee_id || serverErrors?.assigneeId}
              </FormHelperText>
            </FormControl>
          )}
        />

        <Controller
          name="dueDate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Due Date"
              margin="normal"
              type="date"
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value || null)}
              error={!!errors.dueDate || !!serverErrors?.due_date || !!serverErrors?.dueDate}
              helperText={errors.dueDate?.message || serverErrors?.due_date || serverErrors?.dueDate}
              disabled={isSubmitting}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          )}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={20} /> : task ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </form>
  );
}
