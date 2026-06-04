import { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AppShell({ title, children }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-lg mx-auto">
      {title && (
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 safe-top">
          <div className="px-4 py-3">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
        </header>
      )}
      <main className="flex-1 pb-20 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
