import type { ReactNode } from 'react';
import NavBar from './NavBar';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {children}
      </main>
    </div>
  );
}
