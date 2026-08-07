import { useState } from 'react';
import api from '../api/axios';

export default function YouTube() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const summarize = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/youtube/summary', { url: url.trim() });
      setSummary(res.data.summary);
    } catch (err) {
      alert('Ошибка при получении конспекта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-white">🎥 Конспект YouTube</h2>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Вставьте ссылку на YouTube..."
          className="flex-1 p-3 bg-gray-700 text-white rounded outline-none"
        />
        <button onClick={summarize} disabled={loading} className="bg-red-600 px-4 py-2 rounded disabled:opacity-50">
          Создать конспект
        </button>
      </div>
      {summary && (
        <div className="bg-gray-700 p-4 rounded">
          <p className="text-white whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  );
}