import { useState } from 'react';
import api from '../api/axios';

export default function SearchChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/search/', { query: text });
      const answer = res.data.answer;
      const sources = res.data.sources || '';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer + (sources ? `\n\n📎 Источники:\n${sources}` : '') },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Ошибка при поиске. Проверьте интернет и ключ Tavily.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-700 p-3 text-white font-bold">🌐 Чат с интернет-поиском</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] p-3 rounded-xl whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-700 mr-auto'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-400">⏳ Ищу в интернете...</div>}
      </div>
      <div className="p-4 bg-gray-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Задайте вопрос (с поиском в интернете)..."
          className="flex-1 p-3 bg-gray-600 text-white rounded outline-none"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Отправить
        </button>
      </div>
    </div>
  );
}