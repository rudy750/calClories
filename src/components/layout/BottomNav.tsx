import { NavLink } from 'react-router-dom';
import { Utensils, TrendingUp, Settings } from 'lucide-react';

export default function BottomNav() {
  const base = 'flex flex-col items-center gap-0.5 flex-1 py-2 text-xs font-medium transition-colors';
  const active = 'text-brand-600';
  const inactive = 'text-gray-400';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white safe-bottom">
      <div className="flex max-w-lg mx-auto">
        <NavLink to="/log" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <Utensils size={22} />
          <span>Log</span>
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <TrendingUp size={22} />
          <span>Progress</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <Settings size={22} />
          <span>Settings</span>
        </NavLink>
      </div>
    </nav>
  );
}
