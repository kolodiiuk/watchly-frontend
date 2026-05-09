import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserLayout, AuthLayout, MainLayout, AdminLayout } from '../../components/layouts';
import ProtectedRoute from '../../components/ProtectedRoute';
import { BrowsePage } from '../pages/BrowsePage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../../shared/NotFoundPage.tsx';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { SignInPage } from '../../features/auth/pages/SignInPage.tsx';
import { SignUpPage } from '../../features/auth/pages/SignUpPage.tsx';
import { TitlePage } from '../pages/TitlePage.tsx';
import { MoviePage } from '../pages/MoviePage.tsx';
import { SeriesPage } from '../pages/SeriesPage.tsx';
import { EpisodePage } from '../pages/EpisodePage.tsx';
import { ForgetPasswordPage } from '../../features/auth/pages/ForgetPasswordPage.tsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.tsx';
import { AdminContentPage } from '../pages/admin/AdminContentPage.tsx';
import { UserRole } from '../models/UserRole.ts';

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'browse',
        element: <BrowsePage />,
      },
      {
        path: 'title/:titleId',
        element: <TitlePage />,
      },
      {
        path: 'movie/:titleId',
        element: <MoviePage />,
      },
      {
        path: 'series/:titleId',
        element: <SeriesPage />,
      },
      {
        path: 'episode/:episodeId',
        element: <EpisodePage />,
      },
      {
        path: 'users/reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'sign-in',
            element: <SignInPage />,
          },
          {
            path: 'sign-up',
            element: <SignUpPage />,
          },
          {
            path: 'forget-password',
            element: <ForgetPasswordPage />,
          },
        ],
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // {
      //   path: 'wathlists',
      //   element:
      // },
      // {
      //   path: 'stats',
      //   element:
      // }
    ],
  },
  {
    element: (
      <ProtectedRoute requiredRoles={[UserRole.USER]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'admin/content',
        element: <AdminContentPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
