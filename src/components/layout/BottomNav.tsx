import { NavLink } from 'react-router-dom';
import { Utensils, TrendingUp, Settings } from 'lucide-react';

export default function BottomNav() {
  const base = 'flex flex-col items-center gap-1 flex-1 py-3 text-xs font-semibold transition-colors';

  return (
    <nav className="app-nav fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="flex max-w-lg mx-auto">
        <NavItem to="/log" icon={Utensils} label="Log" base={base} />
        <NavItem to="/progress" icon={TrendingUp} label="Progress" base={base} />
        <NavItem to="/settings" icon={Settings} label="Settings" base={base} />
      </div>
    </nav>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  base,
}: {
  to: string;
  icon: typeof Utensils;
  label: string;
  base: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${base} ${isActive ? '' : 'app-subtle'}`}
      style={({ isActive }) => ({ color: isActive ? 'var(--app-brand-strong)' : 'var(--app-subtle)' })}
    >
      {({ isActive }) => (
        <>
          <div
            className="flex h-10 w-10 items-center justify-center transition-all"
            style={{
              borderRadius: 'calc(var(--app-control-radius) - 0.1rem)',
              background: isActive ? 'var(--app-brand-soft)' : 'transparent',
              boxShadow: isActive ? 'var(--app-brand-shadow)' : 'none',
            }}
          >
            <Icon size={20} />
          </div>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
