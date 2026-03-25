import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const { pathname } = useLocation();

  return (
    <nav style={{ borderBottom: '1px solid var(--border)' }} className="bg-bg">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <span className="font-display text-xl text-primary font-semibold tracking-tight">
          <span style={{ color: 'var(--gold)' }}>V</span>okabular
        </span>
        <div className="flex items-center gap-1">
          {([['/', 'Words'], ['/lists', 'Lists'], ['/practice', 'Practice']] as const).map(([path, label]) => {
            const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className="relative px-4 py-1.5 text-sm font-mono transition-colors duration-200"
                style={{
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  letterSpacing: '0.02em',
                }}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-px"
                    style={{ background: 'var(--gold)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
