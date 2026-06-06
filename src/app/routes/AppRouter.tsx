import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { BrowsePage } from '../../features/catalog/BrowsePage';
//import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../../pages/NotFoundPage.tsx';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { SignInPage } from '../../features/auth/pages/SignInPage.tsx';
import { SignUpPage } from '../../features/auth/pages/SignUpPage.tsx';
import { TitlePage } from '../../features/titles-details/pages/TitlePage.tsx';
import { MoviePage } from '../../features/titles-details/pages/MoviePage.tsx';
import { SeriesPage } from '../../features/titles-details/pages/SeriesPage.tsx';
import { EpisodePage } from '../../features/titles-details/pages/EpisodePage.tsx';
import { ForgetPasswordPage } from '../../features/auth/pages/ForgetPasswordPage.tsx';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage.tsx';
import { AdminMoviesPage } from '../../features/admin/pages/AdminMoviesPage.tsx';
import { AdminSeriesPage } from '../../features/admin/pages/AdminSeriesPage.tsx';
import { AdminSeriesSeasonsPage } from '../../features/admin/pages/AdminSeriesSeasonsPage.tsx';
import { UserRole } from '../../features/auth/models/UserRole.ts';
import { StatsPage } from '../../features/user-stats/pages/StatsPage.tsx';
import { WatchListsPage } from '../../features/watch-list/pages/WatchListsPage.tsx';
import {UserLayout} from "../../layouts/UserLayout.tsx";
import {MainLayout} from "../../layouts/MainLayout.tsx";
import {AuthLayout} from "../../layouts/AuthLayout.tsx";
import {AdminLayout} from "../../layouts/AdminLayout.tsx";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        index: true,
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
      {
        path: 'stats',
        element: <StatsPage />,
      },
      {
        path: 'watchlists',
        element: <WatchListsPage />,
      },
      {
        path: 'watchlist',
        element: <WatchListsPage />,
      }
    ],
  },
  {
    element: (
      <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'admin/content',
        element: <Navigate to="/admin/movies" replace />,
      },
      {
        path: 'admin/movies',
        element: <AdminMoviesPage />,
      },
      {
        path: 'admin/series',
        element: <AdminSeriesPage />,
      },
      {
        path: 'admin/series/:titleId/seasons',
        element: <AdminSeriesSeasonsPage />,
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
