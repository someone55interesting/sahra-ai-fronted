import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(conversationId === '0' || !conversationId);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId && conversationId !== '0') {
      const loadHistory = async () => {
        try {
          const res = await api.get(`/chat/conversations/${conversationId}`);
          setMessages(res.data.messages || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    } else {
      setIsNew(true);
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!user || loading) return;

    const token = localStorage.getItem('access_token');
    const wsUrl = `ws://31.129.98.168:8000/chat/ws/${isNew ? '0' : conversationId}?token=${token}`;
    const socket = new WebSocket(wsUrl);
    setWs(socket);

    socket.onopen = () => console.log('WebSocket connected');
    socket.onmessage = (event) => {
      const data = event.data;
      if (data === '[DONE]') {
        // завершение
      } else {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && !last.finished) {
            const updated = { ...last, content: last.content + data };
            return [...prev.slice(0, -1), updated];
          } else {
            return [...prev, { role: 'assistant', content: data, finished: false }];
          }
        });
        scrollToBottom();
      }
    };
    socket.onclose = () => console.log('WebSocket closed');

    return () => socket.close();
  }, [user, loading, conversationId, isNew]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!input.trim() || !ws) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    ws.send(text);
    setInput('');
  };

  if (loading) return <div className="text-white p-4">Загрузка...</div>;

  return (
    <div className="flex flex-col h-[80vh] bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-700 p-3 text-white font-bold flex justify-between items-center">
        <span>Чат {conversationId && conversationId !== '0' ? `#${conversationId}` : '(новый)'}</span>
        <Link to="/" className="text-sm text-blue-400 hover:underline">← Назад к диалогам</Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 ml-auto' : 'bg-gray-700 mr-auto'}`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-gray-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Сообщение..."
          className="flex-1 p-3 bg-gray-600 text-white rounded outline-none"
        />
        <button onClick={sendMessage} className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700">
          Отправить
        </button>
      </div>
    </div>
  );
}