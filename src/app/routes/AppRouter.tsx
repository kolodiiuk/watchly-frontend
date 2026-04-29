import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserLayout, AuthLayout, MainLayout } from '../../components/layouts';
import ProtectedRoute from '../../components/ProtectedRoute';
import { BrowsePage } from '../pages/BrowsePage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../../shared/NotFoundPage.tsx';
import { ProfilePage } from '../pages/ProfilePage';
import { SignInPage } from '../../features/auth/pages/SignInPage.tsx';
import { SignUpPage } from '../../features/auth/pages/SignUpPage.tsx';
import { TitlePage } from '../pages/TitlePage.tsx';

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
        path: 'episode/:episodeId',
        element: <TitlePage />,
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
    ],
  },
  // {
  //   path: '/admin',
  // },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
