import { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AppShell({ title, children }: Props) {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto" style={{ background: '#fdfaf5' }}>
      {title && (
        <header className="sticky top-0 z-30 safe-top" style={{ background: 'rgba(253,250,245,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
          <div className="px-5 py-4">
            <h1 className="text-xl font-bold" style={{ color: '#1c1040', letterSpacing: '-0.02em' }}>{title}</h1>
          </div>
        </header>
      )}
      <main className="flex-1 pb-24 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
