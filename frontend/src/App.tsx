import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/auth.store';
import { PageLoader } from '@/components/ui/page-loader';

function PlaceholderPage({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
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
        <Route path="/login" element={<PlaceholderPage label="Login — Phase 9" />} />
        <Route path="/signup" element={<PlaceholderPage label="Sign Up — Phase 9" />} />
        <Route path="/events" element={<PlaceholderPage label="Events — Phase 10" />} />
        <Route
          path="/events/create"
          element={<PlaceholderPage label="Create Event — Phase 12" />}
        />
        <Route
          path="/events/:id"
          element={<PlaceholderPage label="Event Details — Phase 11" />}
        />
        <Route
          path="/events/:id/edit"
          element={<PlaceholderPage label="Edit Event — Phase 12" />}
        />
        <Route
          path="/my-events"
          element={<PlaceholderPage label="My Events — Phase 13" />}
        />
        <Route path="*" element={<PlaceholderPage label="404 Not Found" />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </>
  );
}
