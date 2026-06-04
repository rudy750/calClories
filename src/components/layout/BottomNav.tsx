import { NavLink } from 'react-router-dom';
import { Utensils, TrendingUp, Settings } from 'lucide-react';

export default function BottomNav() {
  const base = 'flex flex-col items-center gap-1 flex-1 py-3 text-xs font-semibold transition-all duration-200';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(139,92,246,0.1)' }}>
      <div className="flex max-w-lg mx-auto">
        <NavLink to="/log" className={({ isActive }) => `${base} ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-brand-100' : 'bg-transparent'}`}>
                <Utensils size={20} />
              </div>
              <span>Log</span>
            </>
          )}
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => `${base} ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-brand-100' : 'bg-transparent'}`}>
                <TrendingUp size={20} />
              </div>
              <span>Progress</span>
            </>
          )}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${base} ${isActive ? 'text-brand-600' : 'text-gray-400'}`}>
          {({ isActive }) => (
            <>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-brand-100' : 'bg-transparent'}`}>
                <Settings size={20} />
              </div>
              <span>Settings</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
