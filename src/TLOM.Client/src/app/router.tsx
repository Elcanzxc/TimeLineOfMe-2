import { createBrowserRouter } from 'react-router-dom';
import App from '../App';

import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ConfirmEmailPage } from '@/pages/auth/ConfirmEmailPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';
import { SearchPage } from '@/pages/search/SearchPage';
import { EntryDetailsPage } from '@/pages/entry/EntryDetailsPage';
import { TimelinePage } from '@/pages/timeline/TimelinePage';
import { UsersSearchPage } from '@/pages/users/UsersSearchPage';
import { UserProfilePage } from '@/pages/users/UserProfilePage';
import { SettingsPage } from '@/pages/users/SettingsPage';
import { FeedPage } from '@/pages/feed/FeedPage';
import { ProtectedRoute } from '@/features/auth/ui/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App serves as root layout
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'register',
        element: <RegisterPage />
      },
      {
        path: 'confirm-email',
        element: <ConfirmEmailPage />
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />
      },
      {
        element: <ProtectedRoute />, // Wrap private routes
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />
          },
          {
            path: 'search',
            element: <SearchPage />
          },
          {
            path: 'users',
            element: <UsersSearchPage />
          },
          {
            path: 'users/:username',
            element: <UserProfilePage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          },
          {
            path: 'feed',
            element: <FeedPage />
          },
          {
            path: 'timeline',
            element: <TimelinePage />
          },
          {
            path: 'entry/:id',
            element: <EntryDetailsPage />
          },
          {
            path: 'onboarding',
            element: <OnboardingPage />
          }
        ]
      }
    ]
  }
]);
