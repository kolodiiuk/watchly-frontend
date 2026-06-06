import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
