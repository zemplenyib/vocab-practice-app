import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const { pathname } = useLocation();

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      pathname === path
        ? 'bg-white text-indigo-700'
        : 'text-indigo-100 hover:bg-indigo-600'
    }`;

  return (
    <nav className="bg-indigo-700 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
        <span className="font-bold text-white mr-4 text-lg">Vocab Practice</span>
        <Link to="/" className={linkClass('/')}>Words</Link>
        <Link to="/practice" className={linkClass('/practice')}>Practice</Link>
      </div>
    </nav>
  );
}
