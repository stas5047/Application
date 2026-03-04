import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/ui/page-loader';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import LoginPage from '@/features/auth/LoginPage';
import SignUpPage from '@/features/auth/SignUpPage';
import EventsPage from '@/features/events/EventsPage';
import EventDetailsPage from '@/features/events/EventDetailsPage';
import EventFormPage from '@/features/events/EventFormPage';

function PlaceholderPage({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-muted-foreground text-lg">{label}</p>
    </div>
  );
}

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
            <Route path="/my-events" element={<PlaceholderPage label="My Events — Phase 13" />} />
          </Route>
        </Route>

        <Route path="*" element={<PlaceholderPage label="404 Not Found" />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
