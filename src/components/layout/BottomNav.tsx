import { NavLink } from 'react-router-dom';
import { Utensils, TrendingUp, Settings } from 'lucide-react';

export default function BottomNav() {
  const base = 'flex flex-col items-center gap-0.5 flex-1 py-2 text-xs font-medium transition-all duration-200';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom" style={{ background: 'rgba(8,11,20,0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid #1F2D50' }}>
      <div className="flex max-w-lg mx-auto">
        <NavLink to="/log" className={({ isActive }) => `${base} ${isActive ? 'text-brand-500' : 'text-gray-600'}`} style={({ isActive }) => isActive ? { textShadow: '0 0 8px rgba(0,217,126,0.6)' } : {}}>
          {({ isActive }) => (
            <>
              <div className={isActive ? 'drop-shadow-[0_0_6px_rgba(0,217,126,0.7)]' : ''}>
                <Utensils size={22} />
              </div>
              <span>Log</span>
            </>
          )}
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => `${base} ${isActive ? 'text-brand-500' : 'text-gray-600'}`} style={({ isActive }) => isActive ? { textShadow: '0 0 8px rgba(0,217,126,0.6)' } : {}}>
          {({ isActive }) => (
            <>
              <div className={isActive ? 'drop-shadow-[0_0_6px_rgba(0,217,126,0.7)]' : ''}>
                <TrendingUp size={22} />
              </div>
              <span>Progress</span>
            </>
          )}
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${base} ${isActive ? 'text-brand-500' : 'text-gray-600'}`} style={({ isActive }) => isActive ? { textShadow: '0 0 8px rgba(0,217,126,0.6)' } : {}}>
          {({ isActive }) => (
            <>
              <div className={isActive ? 'drop-shadow-[0_0_6px_rgba(0,217,126,0.7)]' : ''}>
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
