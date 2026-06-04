import { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AppShell({ title, children }: Props) {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto" style={{ background: '#f8f9fa' }}>
      {title && (
        <header className="sticky top-0 z-30 bg-white safe-top" style={{ borderBottom: '2px solid #0f172a' }}>
          <div className="px-4 py-3.5 flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ background: '#f97316' }} />
            <h1 className="text-lg font-black tracking-tight" style={{ color: '#0f172a', letterSpacing: '-0.03em' }}>{title}</h1>
          </div>
        </header>
      )}
      <main className="flex-1 pb-20 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
