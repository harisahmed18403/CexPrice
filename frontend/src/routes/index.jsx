import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AdminPage } from '../pages/AdminPage';
import {BrowseProductsPage} from '../pages/products/BrowseProductsPage';
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />, // No Navbar on the Login page
  },
  {
    // 1. Wrap everything in the ProtectedRoute logic
    element: <ProtectedRoute />, 
    children: [
      {
        // 2. Wrap the protected content in the MainLayout
        element: <MainLayout />, 
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/profile', element: <DashboardPage /> },
          { path: '/admin', element: <AdminPage /> },
          { path: '/products', element: <BrowseProductsPage /> },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;