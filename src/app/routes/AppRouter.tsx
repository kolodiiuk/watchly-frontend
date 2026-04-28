import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserLayout, AuthLayout, MainLayout } from '../../components/layouts';
import ProtectedRoute from '../../components/ProtectedRoute';
import { BrowsePage } from '../pages/BrowsePage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../../shared/NotFoundPage.tsx';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { SignInPage } from '../../features/auth/pages/SignInPage.tsx';
import { SignUpPage } from '../../features/auth/pages/SignUpPage.tsx';

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
