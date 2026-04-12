import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from './Layout';
import { LoginPage } from '../pages/LoginPage/LoginPage';
import { RegisterPage } from '../pages/RegisterPage/RegisterPage';
import { ProjectsPage } from '../pages/ProjectsPage/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage/ProjectDetailPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/projects',
            element: <ProjectsPage />,
          },
          {
            path: '/projects/:id',
            element: <ProjectDetailPage />,
          },
          {
            path: '/',
            element: <Navigate to="/projects" replace />,
          },
        ],
      },
    ],
  },
]);
