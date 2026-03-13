import { Navigate, Route, Routes } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/ui/page-loader';
import { EmptyState } from '@/components/ui/empty-state';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LoginPage from '@/features/auth/LoginPage';
import SignUpPage from '@/features/auth/SignUpPage';
import EventsPage from '@/features/events/EventsPage';
import EventDetailsPage from '@/features/events/EventDetailsPage';
import EventFormPage from '@/features/events/EventFormPage';
import MyEventsPage from '@/features/my-events/MyEventsPage';
import AssistantPage from '@/features/assistant/AssistantPage';

export default function App() {
  const isHydrated = useAuthStore((s) => s.isHydrated);

  if (!isHydrated) {
    return <PageLoader />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/events/create" element={<EventFormPage />} />
            <Route path="/events/:id/edit" element={<EventFormPage />} />
            <Route path="/my-events" element={<MyEventsPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
          </Route>

          <Route
            path="*"
            element={
              <EmptyState
                icon={FileQuestion}
                heading="404 Not Found"
                subText="The page you're looking for doesn't exist."
              />
            }
          />
        </Route>
      </Routes>
      <Toaster position="top-right" richColors duration={1500} />
    </>
  );
}
