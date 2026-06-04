import { NavLink } from 'react-router-dom';
import { Utensils, TrendingUp, Settings } from 'lucide-react';

export default function BottomNav() {
  const base = 'flex flex-col items-center gap-0.5 flex-1 py-2 text-[11px] font-black uppercase tracking-wider transition-all duration-150';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white safe-bottom" style={{ borderTop: '2px solid #0f172a' }}>
      <div className="flex max-w-lg mx-auto">
        <NavLink to="/log" className={({ isActive }) => `${base} ${isActive ? 'text-brand-500' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <div className={`relative p-1 ${isActive ? '' : ''}`}>
                {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full" style={{ background: '#f97316' }} />}
                <Utensils size={22} />
              </div>
              <span>Log</span>
            </>
          )}
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => `${base} ${isActive ? 'text-brand-500' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <div className="relative p-1">
                {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full" style={{ background: '#f97316' }} />}
                <TrendingUp size={22} />
              </div>
              <span>Progress</span>
            </>
          )}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${base} ${isActive ? 'text-brand-500' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <div className="relative p-1">
                {isActive && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full" style={{ background: '#f97316' }} />}
                <Settings size={22} />
              </div>
              <span>Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
