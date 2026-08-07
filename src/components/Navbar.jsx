import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isChatActive = () => location.pathname.startsWith('/chat');

  return (
    <nav className="bg-gray-800 p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex gap-4 flex-wrap">
        <Link
          to="/"
          className={`px-3 py-2 rounded transition ${
            isActive('/') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          📋 Диалоги
        </Link>
        <Link
          to="/chat/0"
          className={`px-3 py-2 rounded transition ${
            isChatActive() ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          💬 Чат (без поиска)
        </Link>
        <Link
          to="/search-chat"
          className={`px-3 py-2 rounded transition ${
            isActive('/search-chat') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          🌐 Чат с поиском
        </Link>
        <Link
          to="/memory"
          className={`px-3 py-2 rounded transition ${
            isActive('/memory') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          🧠 Память
        </Link>
        <Link
          to="/documents"
          className={`px-3 py-2 rounded transition ${
            isActive('/documents') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          📄 Документы
        </Link>
        <Link
          to="/youtube"
          className={`px-3 py-2 rounded transition ${
            isActive('/youtube') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          🎥 YouTube
        </Link>
      </div>
      <button onClick={logout} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-white">
        Выйти
      </button>
    </nav>
  );
}