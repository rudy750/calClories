import { type ReactNode } from 'react';
import BottomNav from './BottomNav';

interface Props {
  title?: string;
  children: ReactNode;
}

export default function AppShell({ title, children }: Props) {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto" style={{ background: '#080B14' }}>
      {title && (
        <header className="sticky top-0 z-30 safe-top" style={{ background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid #1F2D50' }}>
          <div className="px-4 py-3">
            <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>
          </div>
        </header>
      )}
      <main className="flex-1 pb-20 px-4">{children}</main>
      <BottomNav />
    </div>
  );
}
