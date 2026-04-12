import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Task, TaskStatus } from '../../types';
import { formatDate, isOverdue } from '../../lib/utils';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: 'default' | 'primary' | 'success'; bgColor: string }> = {
  todo: { label: 'To Do', color: 'default', bgColor: '#f3f4f6' },
  in_progress: { label: 'In Progress', color: 'primary', bgColor: '#dbeafe' },
  done: { label: 'Done', color: 'success', bgColor: '#dcfce7' },
};

const priorityConfig: Record<string, { color: 'error' | 'warning' | 'info'; label: string }> = {
  low: { color: 'info', label: 'Low' },
  medium: { color: 'warning', label: 'Medium' },
  high: { color: 'error', label: 'High' },
};

export function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const overdue = isOverdue(task.dueDate, task.status);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusClick = (newStatus: TaskStatus) => {
    if (newStatus !== task.status) {
      onStatusChange(task.id, newStatus);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit(task);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    handleMenuClose();
  };

  const handleQuickStatusChange = () => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      todo: 'in_progress',
      in_progress: 'done',
      done: 'todo',
    };
    onStatusChange(task.id, nextStatus[task.status]);
  };

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        borderColor: overdue ? 'error.light' : 'divider',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
        ...(overdue && {
          background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
        }),
      }}
      onClick={() => onEdit(task)}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom noWrap>
              {task.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5,
              }}
            >
              {task.description}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ flexShrink: 0, mt: -0.5, mr: -0.5 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
          <Tooltip title="Click to change status">
            <Chip
              label={status.label}
              size="small"
              color={status.color}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickStatusChange();
              }}
              sx={{
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
            />
          </Tooltip>
          <Chip
            label={priority.label}
            size="small"
            color={priority.color}
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
          {overdue && (
            <Chip
              label="Overdue"
              size="small"
              color="error"
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>

        {task.dueDate && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: overdue ? 'error.main' : 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            <AccessTimeIcon fontSize="small" />
            <span>Due {formatDate(task.dueDate)}</span>
          </Box>
        )}

        <LinearProgress
          variant="determinate"
          value={task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0}
          sx={{
            mt: 2,
            height: 4,
            borderRadius: 2,
            bgcolor: 'grey.100',
            '& .MuiLinearProgress-bar': {
              bgcolor: task.status === 'done' ? 'success.main' : 'primary.main',
            },
          }}
        />
      </CardContent>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleStatusClick('todo')}>Mark as To Do</MenuItem>
        <MenuItem onClick={() => handleStatusClick('in_progress')}>Mark as In Progress</MenuItem>
        <MenuItem onClick={() => handleStatusClick('done')}>Mark as Done</MenuItem>
        <MenuItem onClick={handleEdit}>Edit Task</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete Task
        </MenuItem>
      </Menu>
    </Card>
  );
}
