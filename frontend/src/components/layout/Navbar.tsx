import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CalendarDays, CalendarRange, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const storeLogout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout(localStorage.getItem('refresh_token') ?? '');
      localStorage.removeItem('refresh_token');
      storeLogout();
      navigate('/login', { replace: true });
    } catch {
      toast.error('Logout failed');
      localStorage.removeItem('refresh_token');
      storeLogout();
      navigate('/login', { replace: true });
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition-colors',
      isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
    );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="mx-auto h-14 max-w-[1280px] flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/events" className="text-lg font-bold tracking-tight text-primary">
            EventHub
          </Link>

          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <NavLink to="/events" end className={navLinkClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    Events
                  </span>
                )}
              </NavLink>
              <NavLink to="/my-events" className={navLinkClass}>
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    <CalendarRange className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    My Events
                  </span>
                )}
              </NavLink>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button asChild size="sm">
                <Link to="/events/create">+ Create Event</Link>
              </Button>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void handleLogout()}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Log In
              </NavLink>
              <Button asChild size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
