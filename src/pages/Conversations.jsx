import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchConversations = async (p = 1) => {
    try {
      const res = await api.get(`/chat/conversations?page=${p}&size=20`);
      setConversations(res.data.items);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-4">Ваши диалоги</h1>
      <div className="grid gap-4">
        {conversations.map((conv) => (
          <Link to={`/chat/${conv.id}`} key={conv.id} className="block bg-gray-800 p-4 rounded hover:bg-gray-700">
            <h3 className="text-xl text-white">{conv.title || 'Без названия'}</h3>
            <span className="text-sm text-gray-400">{new Date(conv.created_at).toLocaleString()}</span>
          </Link>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => { setPage(p => p - 1); fetchConversations(page - 1); }}
          className="bg-gray-700 px-4 py-2 rounded disabled:opacity-50 text-white"
        >
          Назад
        </button>
        <span className="text-white">Страница {page} из {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => { setPage(p => p + 1); fetchConversations(page + 1); }}
          className="bg-gray-700 px-4 py-2 rounded disabled:opacity-50 text-white"
        >
          Вперёд
        </button>
      </div>
    </div>
  );
}