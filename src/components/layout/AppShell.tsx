import { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AppShell({ title, children }: Props) {
  return (
    <div className="app-shell flex flex-col min-h-screen max-w-lg mx-auto">
      {title && (
        <header className="app-header sticky top-0 z-30 safe-top">
          <div className="px-4 py-3">
            <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          </div>
        </header>
      )}
      <main className="flex-1 pb-24 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
