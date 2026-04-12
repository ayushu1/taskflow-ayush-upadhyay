import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Tooltip,
  Divider,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useProjects, useDeleteProject, useCreateProject } from '../../features/projects/useProjects';
import { createProjectSchema, type CreateProjectFormData } from '../../features/projects/schemas';
import { getApiError } from '../../lib/api';
import { formatRelativeDate } from '../../lib/utils';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading, error: projectsError } = useProjects();
  const { mutateAsync: deleteProject, isPending: isDeleting } = useDeleteProject();
  const { mutateAsync: createProjectMutate, isPending: isCreating } = useCreateProject();

  const [openDialog, setOpenDialog] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
    setError('');
    setServerErrors({});
  };

  const handleCreateProject = async (data: CreateProjectFormData) => {
    setError('');
    setServerErrors({});

    try {
      await createProjectMutate(data);
      handleCloseDialog();
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError.fields) {
        setServerErrors(apiError.fields);
      } else {
        setError(apiError.error || 'Failed to create project');
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    event.stopPropagation();
    setSelectedProjectId(id);
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleDeleteProject = async () => {
    if (!selectedProjectId) return;

    try {
      await deleteProject(selectedProjectId);
      handleCloseMenu();
      setSelectedProjectId(null);
    } catch {
      setError('Failed to delete project');
      handleCloseMenu();
    }
  };

  const handleCardClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  if (projectsError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load projects. Please try again.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {projects?.length || 0} project{projects?.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          size="large"
          startIcon={<span>+</span>}
        >
          New Project
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {projects && projects.length > 0 ? (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease-in-out',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[8],
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleCardClick(project.id)}
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    textAlign: 'left',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={project.status}
                        size="small"
                        color={project.status === 'active' ? 'success' : 'default'}
                        sx={{ fontWeight: 500 }}
                      />
                      <Tooltip title="More options">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, project.id)}
                          sx={{
                            opacity: 0.6,
                            '&:hover': { opacity: 1 },
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: 'text.primary',
                      }}
                    >
                      {project.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: 1.6,
                      }}
                    >
                      {project.description || 'No description provided.'}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Created {formatRelativeDate(project.createdAt)}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: 'primary.main',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      >
                        <span>View details</span>
                        <ArrowForwardIcon fontSize="small" />
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ mt: 8 }}>
          <Card
            variant="outlined"
            sx={{ textAlign: 'center', py: 6, borderStyle: 'dashed' }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No projects yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Get started by creating your first project
              </Typography>
              <Button
                variant="contained"
                onClick={() => setOpenDialog(true)}
                size="large"
              >
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Project</DialogTitle>
        <form onSubmit={handleSubmit(handleCreateProject)}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Project Name"
              margin="normal"
              {...register('name')}
              error={!!errors.name || !!serverErrors.name}
              helperText={errors.name?.message || serverErrors.name}
              disabled={isCreating}
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={3}
              {...register('description')}
              error={!!errors.description || !!serverErrors.description}
              helperText={errors.description?.message || serverErrors.description}
              disabled={isCreating}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isCreating}>
              {isCreating ? <CircularProgress size={20} /> : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenu}>
        <MenuItem onClick={handleDeleteProject} disabled={isDeleting} sx={{ color: 'error.main' }}>
          {isDeleting ? 'Deleting...' : 'Delete Project'}
        </MenuItem>
      </Menu>
    </Container>
  );
}
