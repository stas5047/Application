import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-4 pt-20 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </>
  );
}
